/**
 * DraftIntelPanel — Champ Select Intelligence Overlay
 *
 * Shows:
 *  ① Enemy threat list   — each enemy pick rated HIGH/MED/LOW
 *  ② Team comp bars      — enemy vs ally: damage, power curve, engage/peel/CC
 *  ③ Top recommendations — scored champion cards with breakdown + 1-click import
 */

import React, { useMemo, useState } from 'react';
import { getChampionImageUrl } from '../services/datadragon';
import { getBuild }           from '../data/builds';
import {
  getRecommendations,
  analyzeComp,
  getThreatLevel,
  getSynergyLabel,
} from '../services/champSelectIntel';

const ROLES_ORDER = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const TIER_COLORS = {
  S: '#f59e0b',
  A: '#52b788',
  B: '#60a5fa',
  C: '#94a3b8',
};

const THREAT_META = {
  HIGH: { label: 'THREAT', color: '#ef4444', bg: '#ef444418', dot: '●' },
  MED:  { label: 'MED',    color: '#f59e0b', bg: '#f59e0b18', dot: '◑' },
  LOW:  { label: 'OK',     color: '#52b788', bg: '#52b78818', dot: '○' },
};

/* ══════════════════════════════════════════════
   Shared primitives
══════════════════════════════════════════════ */

function ChampAvatar({ champion, ddVersion, size = 32, ring, round = true }) {
  const [failed, setFailed] = useState(false);
  if (!champion) return (
    <div style={{ width: size, height: size, borderRadius: round ? '50%' : 6,
      background: 'var(--rp-border)', flexShrink: 0,
      border: ring ? `2px solid ${ring}` : '2px solid transparent' }} />
  );
  const src = ddVersion && champion.ddKey && !failed
    ? getChampionImageUrl(champion.ddKey, ddVersion) : null;
  const base = {
    width: size, height: size, objectFit: 'cover', objectPosition: 'top',
    borderRadius: round ? '50%' : 6, flexShrink: 0, display: 'block',
    border: ring ? `2px solid ${ring}` : '2px solid var(--rp-border)',
  };
  return src
    ? <img src={src} alt={champion.name} style={base} onError={() => setFailed(true)} />
    : <div style={{ ...base, background: 'var(--rp-card)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, color: 'var(--rp-text-muted)' }}>
        {champion.icon || '⚔️'}
      </div>;
}

/** Thin horizontal progress bar */
function Bar({ value, max = 1, color, bg = 'var(--rp-border)', height = 5, label, labelColor }) {
  const pct = Math.round(clamp(value / max, 0, 1) * 100);
  return (
    <div style={{ flex: 1 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 9, color: labelColor || 'var(--rp-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
          <span style={{ fontSize: 9, color: labelColor || 'var(--rp-text-muted)' }}>{pct}%</span>
        </div>
      )}
      <div style={{ height, borderRadius: 3, background: bg, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Section header */
function PanelSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <div style={{ width: 2, height: 12, borderRadius: 1, background: accent || 'var(--rp-gold)', flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', color: 'var(--rp-text-muted)', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ① Enemy threats panel
══════════════════════════════════════════════ */
function ThreatRow({ champion, ddVersion, localChamp }) {
  const threat = getThreatLevel(champion, localChamp);
  const meta   = THREAT_META[threat];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '4px 6px',
      borderRadius: 5, background: meta.bg,
      border: `1px solid ${meta.color}22`,
      marginBottom: 3,
    }}>
      <ChampAvatar champion={champion} ddVersion={ddVersion} size={26} ring={meta.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rp-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {champion.name}
        </div>
        <div style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>{champion.role}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: meta.color }}>{meta.dot}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: meta.color, letterSpacing: '0.5px' }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ② Comp analysis bars
══════════════════════════════════════════════ */
function CompBars({ comp, label, accentColor }) {
  if (!comp) return (
    <div style={{ padding: '6px 0', color: 'var(--rp-text-muted)', fontSize: 11 }}>
      Esperando picks...
    </div>
  );

  const CURVE_LABELS = { early: 'Early', mid: 'Mid', late: 'Late' };
  const CURVE_COLORS = { early: '#ef4444', mid: '#f59e0b', late: '#60a5fa' };
  const curveColor   = CURVE_COLORS[comp.powerCurve] || 'var(--rp-gold)';

  return (
    <div>
      {/* Power curve pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
        <span style={{ fontSize: 9, color: 'var(--rp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pico de poder</span>
        <span style={{
          padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 800,
          background: curveColor + '22', color: curveColor, letterSpacing: '0.5px',
        }}>
          {CURVE_LABELS[comp.powerCurve]}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--rp-text-muted)' }}>
          WR prom.
          <span style={{
            marginLeft: 4, fontWeight: 700,
            color: comp.avgWinRate >= 52 ? '#52b788' : comp.avgWinRate >= 50 ? 'var(--rp-gold)' : '#ef4444',
          }}>
            {comp.avgWinRate}%
          </span>
        </span>
      </div>

      {/* Damage type pills */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        {comp.adCount > 0 && (
          <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}>
            AD ×{comp.adCount}
          </span>
        )}
        {comp.apCount > 0 && (
          <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            background: '#60a5fa22', color: '#60a5fa', border: '1px solid #60a5fa44' }}>
            AP ×{comp.apCount}
          </span>
        )}
        {comp.mixedCount > 0 && (
          <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            background: '#94a3b822', color: '#94a3b8', border: '1px solid #94a3b844' }}>
            MIXED ×{comp.mixedCount}
          </span>
        )}
      </div>

      {/* Trait bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Bar value={comp.engage}    label="Engage"    color={accentColor || '#ef4444'} />
        <Bar value={comp.cc}        label="CC"        color="#f59e0b" />
        <Bar value={comp.peel}      label="Peel"      color="#52b788" />
        <Bar value={comp.burst}     label="Burst"     color="#c084fc" />
        <Bar value={comp.mobility}  label="Mobility"  color="#60a5fa" />
      </div>

      {/* Strengths / weaknesses */}
      {(comp.strengths.length > 0 || comp.weaknesses.length > 0) && (
        <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {comp.strengths.slice(0, 2).map((s, i) => (
            <div key={i} style={{ fontSize: 9, color: '#52b788', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              <span>↑</span><span>{s}</span>
            </div>
          ))}
          {comp.weaknesses.slice(0, 2).map((w, i) => (
            <div key={i} style={{ fontSize: 9, color: '#ef4444', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              <span>↓</span><span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ③ Recommendation card
══════════════════════════════════════════════ */
function RecCard({ rec, ddVersion, rank, onImport }) {
  const [hov, setHov] = useState(false);
  const { champion: c, total, breakdown } = rec;
  const build  = getBuild(c.id);
  const tier   = build?.tier || 'B';
  const tierColor = TIER_COLORS[tier] || '#94a3b8';

  // Breakdown bar segments
  const segments = [
    { key: 'counter', label: 'Counter', color: '#ef4444',  pct: (breakdown.counter / 30) * 100 },
    { key: 'synergy', label: 'Sinergia', color: '#52b788', pct: (breakdown.synergy / 25) * 100 },
    { key: 'need',    label: 'Necesidad', color: '#60a5fa', pct: (breakdown.need / 25) * 100 },
    { key: 'meta',    label: 'Meta',     color: '#f59e0b', pct: (breakdown.meta / 20) * 100 },
  ];

  const rankColors = ['#c89b3c', '#94a3b8', '#a0785a'];
  const rankColor  = rankColors[rank - 1] || 'var(--rp-text-muted)';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 8,
        border: hov ? `1px solid var(--rp-gold)` : `1px solid var(--rp-border)`,
        background: hov ? 'var(--rp-hover)' : 'var(--rp-card)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: 6,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
        {/* Rank */}
        <div style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: rankColor }}>#{rank}</span>
        </div>

        {/* Avatar */}
        <ChampAvatar champion={c} ddVersion={ddVersion} size={40} round={false}
          ring={hov ? 'var(--rp-gold)' : undefined} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--rp-text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.name}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: tierColor,
              background: tierColor + '22', border: `1px solid ${tierColor}44`,
              borderRadius: 3, padding: '1px 4px', flexShrink: 0 }}>
              {tier}
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>
            {c.winRate?.toFixed(1)}% WR · {c.pickRate?.toFixed(1)}% pick
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900,
            color: total >= 70 ? '#52b788' : total >= 50 ? 'var(--rp-gold)' : 'var(--rp-text)' }}>
            {total}
          </div>
          <div style={{ fontSize: 9, color: 'var(--rp-text-muted)', textTransform: 'uppercase' }}>pts</div>
        </div>
      </div>

      {/* Score breakdown bar */}
      <div style={{ display: 'flex', height: 4, marginBottom: 0 }}>
        {segments.map((seg) => {
          const w = (seg.pct / 100) * 25; // each segment max 25% of bar width
          return (
            <div key={seg.key} title={`${seg.label}: ${Math.round(seg.pct)}%`}
              style={{ flex: clamp(w, 0.5, 25), background: seg.color, opacity: 0.8 }} />
          );
        })}
        <div style={{ flex: 1, background: 'var(--rp-border)' }} />
      </div>

      {/* Score labels + import button */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', gap: 6 }}>
        {segments.map((seg) => (
          <div key={seg.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>{seg.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--rp-text)' }}>
              {Math.round(seg.pct)}%
            </span>
          </div>
        ))}

        {/* Import button */}
        {build && (
          <button
            onClick={() => onImport && onImport(c)}
            style={{
              marginLeft: 'auto',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid var(--rp-gold)',
              background: hov ? 'var(--rp-gold)' : 'transparent',
              color: hov ? '#000' : 'var(--rp-gold)',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            ▶ RUNAS
          </button>
        )}
      </div>

      {/* Spell suggestions */}
      {build?.summonerSpells && (
        <div style={{ padding: '0 10px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>Hechizos:</span>
          {build.summonerSpells.map((sp, i) => (
            <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--rp-text)',
              background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
              borderRadius: 3, padding: '1px 5px' }}>
              {sp}
            </span>
          ))}
          {build.runes?.keystone && (
            <>
              <span style={{ fontSize: 9, color: 'var(--rp-text-muted)', marginLeft: 4 }}>Keystone:</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--rp-gold)' }}>
                {build.runes.keystone}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Ally synergy row
══════════════════════════════════════════════ */
function AllyRow({ champion, ddVersion, candidates }) {
  const topSynergy = candidates.find((r) => {
    const syn = getSynergyLabel(champion, r.champion);
    return syn === 'STRONG';
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 6px',
      borderRadius: 5, background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
      marginBottom: 3 }}>
      <ChampAvatar champion={champion} ddVersion={ddVersion} size={24} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {champion.name}
        </div>
      </div>
      {topSynergy ? (
        <span style={{ fontSize: 9, color: '#52b788', fontWeight: 700, flexShrink: 0 }}>↑ SINERGIA</span>
      ) : (
        <span style={{ fontSize: 9, color: 'var(--rp-text-muted)', flexShrink: 0 }}>neutral</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function DraftIntelPanel({
  role,
  allies,       // { TOP: champ|null, ... }
  enemies,      // { TOP: champ|null, ... }
  ddVersion,
  allChamps,
  localChamp,   // the player's already-locked champion (if any)
  onImportRunes, // (champion) => void
}) {
  const enemyPicks = useMemo(
    () => ROLES_ORDER.map((r) => enemies?.[r]).filter(Boolean),
    [enemies]
  );
  const allyPicks  = useMemo(
    () => ROLES_ORDER.map((r) => allies?.[r]).filter(Boolean),
    [allies]
  );

  const enemyComp = useMemo(() => analyzeComp(enemies), [enemies]);
  const allyComp  = useMemo(() => analyzeComp(allies),  [allies]);

  const recs = useMemo(() => {
    if (!allChamps?.length || !role) return [];
    const banned = new Set(); // TODO: pass banned set from parent
    return getRecommendations({ role, allies, enemies, banned, allChamps, count: 5 });
  }, [role, allies, enemies, allChamps]);

  const noData = !enemyPicks.length && !allyPicks.length;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', gap: 0 }}>

      {/* ── Left column: threats + ally synergy ── */}
      <div style={{
        width: 180, flexShrink: 0,
        borderRight: '1px solid var(--rp-border)',
        overflowY: 'auto',
        padding: '10px 8px',
      }}>
        <PanelSection title="Amenazas" accent="#ef4444">
          {enemyPicks.length === 0
            ? <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', padding: '4px 0' }}>
                Sin picks enemigos aún
              </div>
            : enemyPicks.map((c) => (
                <ThreatRow key={c.id} champion={c} ddVersion={ddVersion} localChamp={localChamp} />
              ))
          }
        </PanelSection>

        <PanelSection title="Aliados" accent="#52b788">
          {allyPicks.length === 0
            ? <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', padding: '4px 0' }}>
                Sin picks aliados aún
              </div>
            : allyPicks.map((c) => (
                <AllyRow key={c.id} champion={c} ddVersion={ddVersion} candidates={recs} />
              ))
          }
        </PanelSection>
      </div>

      {/* ── Center: recommendations ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        <PanelSection
          title={`Recomendaciones para ${role || '...'}`}
          accent="var(--rp-gold)"
        >
          {!role && (
            <div style={{ fontSize: 11, color: 'var(--rp-text-muted)', padding: '8px 0' }}>
              Esperando asignación de rol...
            </div>
          )}
          {role && recs.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--rp-text-muted)', padding: '8px 0' }}>
              Sin datos de campeones. Asegúrate de que el cliente está conectado.
            </div>
          )}
          {recs.map((rec, i) => (
            <RecCard
              key={rec.champion.id}
              rec={rec}
              rank={i + 1}
              ddVersion={ddVersion}
              onImport={onImportRunes}
            />
          ))}
        </PanelSection>

        {/* Legend */}
        {recs.length > 0 && (
          <div style={{ padding: '4px 0 8px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { color: '#ef4444', label: 'Counter vs enemigos' },
              { color: '#52b788', label: 'Sinergia aliados' },
              { color: '#60a5fa', label: 'Necesidad de comp' },
              { color: '#f59e0b', label: 'Meta / winrate' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right column: comp analysis ── */}
      <div style={{
        width: 170, flexShrink: 0,
        borderLeft: '1px solid var(--rp-border)',
        overflowY: 'auto',
        padding: '10px 8px',
      }}>
        <PanelSection title="Comp enemiga" accent="#ef4444">
          <CompBars comp={enemyComp} accentColor="#ef4444" />
        </PanelSection>

        <div style={{ height: 1, background: 'var(--rp-border)', margin: '8px 0' }} />

        <PanelSection title="Mi equipo" accent="#52b788">
          <CompBars comp={allyComp} accentColor="#52b788" />
        </PanelSection>
      </div>
    </div>
  );
}
