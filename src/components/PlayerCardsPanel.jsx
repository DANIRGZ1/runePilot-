import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getChampionImageUrl, getChampionSplashUrl } from '../services/datadragon';
import RankIcon, { RANK_COLORS } from './RankIcon';

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const TIER_ORDER = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER'];

function seededRng(seed) {
  let s = seed % 2147483647;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/** Generate plausible fake stats seeded by player+champion id so they stay stable */
function generatePlayerStats(playerId, champId) {
  const rng = seededRng((playerId * 1000 + champId) | 0);
  const games  = Math.floor(rng() * 120) + 1;
  const wins   = Math.floor(rng() * games);
  const wr     = games > 0 ? Math.round((wins / games) * 1000) / 10 : 0;
  const k      = +(rng() * 8 + 2).toFixed(1);
  const d      = +(rng() * 6 + 2).toFixed(1);
  const a      = +(rng() * 10 + 2).toFixed(1);
  const kda    = d === 0 ? '∞' : +((k + a) / d).toFixed(2);
  const mastery = Math.floor(rng() * 18) + 1;
  const isDuo  = rng() > 0.65;
  const divIdx = Math.floor(rng() * 4);
  const tierIdx = Math.floor(rng() * 8);
  const tier   = TIER_ORDER[tierIdx + 1]; // skip IRON for most
  const division = ['I','II','III','IV'][divIdx];
  const wRecord = Math.floor(rng() * 140) + 1;
  const lRecord = Math.floor(rng() * 140) + 1;
  const apPct   = Math.floor(rng() * 80) + 10;
  const adPct   = Math.floor((100 - apPct) * (0.7 + rng() * 0.3));
  const mixPct  = 100 - apPct - adPct;
  return { games, wins, wr, k, d, a, kda, mastery, isDuo, tier, division, wRecord, lRecord, apPct, adPct, mixPct };
}

/** Pick a behavioural tag based on stats */
function getBehaviorTags(stats) {
  const tags = [];
  if (stats.wr >= 55) tags.push({ label: 'Guardián activo', color: '#52b788', bg: '#52b78820' });
  else if (stats.wr < 44) tags.push({ label: '¿Polivarente automático?', color: '#f59e0b', bg: '#f59e0b18' });
  if (stats.d > 5) tags.push({ label: 'Dies Early', color: '#ef4444', bg: '#ef444418' });
  if (stats.mastery < 3) tags.push({ label: 'Inestable', color: '#ef4444', bg: '#ef444418' });
  if (stats.games < 5 && stats.wr === 0) tags.push({ label: '¿Polivarente automático?', color: '#f59e0b', bg: '#f59e0b18' });
  return tags.slice(0, 2);
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function ChampSplash({ champion, ddVersion }) {
  if (!champion?.ddKey) return null;
  return (
    <img
      src={getChampionSplashUrl(champion.ddKey)}
      alt=""
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'top center',
        opacity: 0.28, filter: 'saturate(0.7)',
        pointerEvents: 'none',
      }}
      onError={() => {}}
    />
  );
}

function ChampPortrait({ champion, ddVersion, size = 42 }) {
  if (!champion?.ddKey || !ddVersion) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--rp-border)', flexShrink: 0 }} />
  );
  return (
    <img
      src={getChampionImageUrl(champion.ddKey, ddVersion)}
      alt={champion.name}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--rp-border)', flexShrink: 0 }}
      onError={() => {}}
    />
  );
}

function DamageBar({ apPct, adPct, mixPct }) {
  return (
    <div style={{ display: 'flex', height: 22, borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
      {apPct > 0 && (
        <div style={{ flex: apPct, background: 'rgba(91,141,238,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{apPct}% AP</span>
        </div>
      )}
      {adPct > 0 && (
        <div style={{ flex: adPct, background: 'rgba(200,40,40,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{adPct}% AD</span>
        </div>
      )}
      {mixPct > 0 && (
        <div style={{ flex: mixPct, background: 'rgba(120,90,40,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{mixPct}%</span>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ champion, ddVersion, playerId, i, isBlue }) {
  const stats = useMemo(() => generatePlayerStats(playerId, champion?.lcuKey || i), [playerId, champion, i]);
  const tags = useMemo(() => getBehaviorTags(stats), [stats]);
  const tierColor = RANK_COLORS[stats.tier] || '#c89b3c';
  const teamAccent = isBlue ? 'rgba(59,130,246,0.35)' : 'rgba(239,68,68,0.35)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: i * 0.04, type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden',
        background: 'var(--rp-card)',
        border: `1px solid ${isBlue ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.04)`,
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}
    >
      {/* Splash art */}
      <ChampSplash champion={champion} ddVersion={ddVersion} />

      {/* Team color accent top bar */}
      <div style={{ height: 3, background: isBlue ? '#3b82f6' : '#ef4444', flexShrink: 0 }} />

      {/* Card body */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 10px 0' }}>

        {/* Top row: rank + record + duo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RankIcon tier={stats.tier} size={22} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tierColor }}>{stats.division}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {stats.isDuo && (
              <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', borderRadius: 4, padding: '1px 5px' }}>
                ●● Duo
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)' }}>
              {stats.wRecord}V-{stats.lRecord}D
            </span>
          </div>
        </div>

        {/* Player name + champion */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {champion ? `Jugador ${playerId}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
            {champion?.name || 'Seleccionando...'}
          </div>
        </div>

        {/* Portrait + rune row placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ChampPortrait champion={champion} ddVersion={ddVersion} size={44} />
          {/* Placeholder item slots */}
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 5 }).map((_, k) => (
              <div key={k} style={{ width: 22, height: 22, borderRadius: 3, background: 'var(--rp-border)', opacity: 0.5 }} />
            ))}
          </div>
        </div>

        {/* Behavior tags */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, minHeight: 20 }}>
          {tags.map((t, ti) => (
            <span key={ti} style={{ fontSize: 9, fontWeight: 700, background: t.bg, color: t.color, borderRadius: 4, padding: '2px 6px', border: `1px solid ${t.color}44` }}>
              {t.label}
            </span>
          ))}
        </div>

        {/* Mastery */}
        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginBottom: 6 }}>
          Mastery <span style={{ fontWeight: 700, color: 'var(--rp-gold)' }}>{stats.mastery}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: stats.wr >= 55 ? '#52b788' : stats.wr >= 50 ? '#c89b3c' : '#ef4444' }}>
              {stats.wr.toFixed(1)} %
            </div>
            <div style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>{stats.games} Played</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)' }}>{stats.kda} KDA</div>
            <div style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>{stats.k}/{stats.d}/{stats.a}</div>
          </div>
        </div>
      </div>

      {/* Bottom damage bar */}
      <DamageBar apPct={stats.apPct} adPct={stats.adPct} mixPct={stats.mixPct} />
    </motion.div>
  );
}

/* ─── Team damage overview bar ─────────────────────────────────────────── */
function TeamDamageBar({ label, picks }) {
  const ap  = picks.filter(c => c?.damage === 'AP').length;
  const ad  = picks.filter(c => c?.damage === 'AD').length;
  const mix = picks.filter(c => c?.damage === 'MIXED').length;
  const total = picks.length || 1;
  const apPct  = Math.round((ap / total) * 100);
  const adPct  = Math.round((ad / total) * 100);
  const mixPct = 100 - apPct - adPct;

  return (
    <div style={{ flex: 1, background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px 6px', fontSize: 11, fontWeight: 700, color: 'var(--rp-text)' }}>{label}</div>
      <div style={{ display: 'flex', height: 28 }}>
        {apPct > 0 && (
          <div style={{ flex: apPct, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{apPct}%</span>
          </div>
        )}
        {adPct > 0 && (
          <div style={{ flex: adPct, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{adPct}% AD</span>
          </div>
        )}
        {mixPct > 0 && (
          <div style={{ flex: Math.max(mixPct, 0), background: '#78571e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{mixPct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────── */
export default function PlayerCardsPanel({ blueTeam = {}, redTeam = {}, ddVersion }) {
  const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const bluePicks = ROLES.map(r => blueTeam[r]).filter(Boolean);
  const redPicks  = ROLES.map(r => redTeam[r]).filter(Boolean);

  const blueCards = ROLES.map((role, i) => ({
    champion: blueTeam[role] || null,
    playerId: 100 + i,
    role,
    isBlue: true,
    i,
  }));

  const redCards = ROLES.map((role, i) => ({
    champion: redTeam[role] || null,
    playerId: 200 + i,
    role,
    isBlue: false,
    i: i + 5,
  }));

  return (
    <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Damage overview */}
      <div style={{ display: 'flex', gap: 10 }}>
        <TeamDamageBar label="Desglose de daños por equipo" picks={bluePicks} />
        <TeamDamageBar label="Desglose del daño enemigo" picks={redPicks} />
      </div>

      {/* Blue team cards */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
          Equipo Azul
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {blueCards.map((c) => (
            <PlayerCard key={c.role} champion={c.champion} ddVersion={ddVersion} playerId={c.playerId} i={c.i} isBlue={c.isBlue} />
          ))}
        </div>
      </div>

      {/* Red team cards */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          Equipo Rojo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {redCards.map((c) => (
            <PlayerCard key={c.role} champion={c.champion} ddVersion={ddVersion} playerId={c.playerId} i={c.i} isBlue={c.isBlue} />
          ))}
        </div>
      </div>
    </div>
  );
}
