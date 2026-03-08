import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleIcon } from './RoleIcons';
import RankIcon from './RankIcon';
import {
  getChampionImageUrl, getChampionSplashUrl,
  loadItemsData, getItemImageUrl, getRuneIconUrl,
} from '../services/datadragon';
import { getBuild } from '../data/builds';
import { loadRunes, getRuneIconPath, getTreeIconPath } from '../services/runesService';

const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const RUNE_TREE_COLORS = {
  Precision:   '#c89b3c',
  Domination:  '#c9453a',
  Sorcery:     '#4a9eff',
  Resolve:     '#52b788',
  Inspiration: '#5bc0de',
};

/* ── Compact rune tree for builds panel ── */
function RuneTreeCompact({ runes, runesReady }) {
  if (!runes?.page) return null;
  const [keystone, p1, p2, p3, s1, s2] = runes.page;
  const primaryColor   = RUNE_TREE_COLORS[runes.primary]   || '#c89b3c';
  const secondaryColor = RUNE_TREE_COLORS[runes.secondary] || '#64748b';

  function RuneImg({ name, size = 26, isKeystone = false }) {
    const [failed, setFailed] = useState(false);
    const path = runesReady ? getRuneIconPath(name) : null;
    const src  = path && !failed ? getRuneIconUrl(path) : null;
    return (
      <div title={name} style={{
        width: size, height: size, borderRadius: isKeystone ? '50%' : 4,
        background: isKeystone ? primaryColor + '22' : 'var(--rp-surface)',
        border: `1px solid ${isKeystone ? primaryColor : 'var(--rp-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        overflow: 'hidden',
      }}>
        {src
          ? <img src={src} alt={name} width={size - 2} height={size - 2} style={{ objectFit: 'contain' }} onError={() => setFailed(true)} />
          : <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>◈</span>}
      </div>
    );
  }

  function TreeImg({ treeName, size = 18 }) {
    const [failed, setFailed] = useState(false);
    const path = runesReady ? getTreeIconPath(treeName) : null;
    const src  = path && !failed ? getRuneIconUrl(path) : null;
    return src
      ? <img src={src} alt={treeName} width={size} height={size} style={{ objectFit: 'contain' }} onError={() => setFailed(true)} />
      : <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>🔮</span>;
  }

  return (
    <div style={{ display: 'flex', gap: 18 }}>
      {/* Primary tree */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <TreeImg treeName={runes.primary} />
          <span style={{ fontSize: 11, fontWeight: 700, color: primaryColor }}>{runes.primary}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
          <RuneImg name={keystone} size={34} isKeystone />
          <div style={{ display: 'flex', gap: 4 }}>
            {[p1, p2, p3].map((r, i) => r && <RuneImg key={i} name={r} size={24} />)}
          </div>
        </div>
      </div>
      {/* Secondary tree */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <TreeImg treeName={runes.secondary} />
          <span style={{ fontSize: 11, fontWeight: 700, color: secondaryColor }}>{runes.secondary}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[s1, s2].map((r, i) => r && <RuneImg key={i} name={r} size={24} />)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Primitivos compartidos
══════════════════════════════════════════════ */

function ChampImg({ champion, ddVersion, size = 36, round = false }) {
  const [failed, setFailed] = useState(false);
  if (!champion) return (
    <div style={{ width: size, height: size, borderRadius: round ? '50%' : 4, background: 'var(--rp-border)', flexShrink: 0 }} />
  );
  const src = ddVersion && champion.ddKey && !failed
    ? getChampionImageUrl(champion.ddKey, ddVersion) : null;
  const style = { width: size, height: size, objectFit: 'cover', objectPosition: 'top', borderRadius: round ? '50%' : 4, flexShrink: 0, display: 'block' };
  return src
    ? <img src={src} alt={champion.name} style={style} onError={() => setFailed(true)} />
    : <div style={{ ...style, background: 'var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, color: 'var(--rp-text-muted)' }}>{champion.icon || '⚔️'}</div>;
}

function WrText({ wr }) {
  if (!wr) return null;
  const color = wr >= 53 ? '#52b788' : wr >= 50 ? 'var(--rp-gold)' : '#ef4444';
  return <span style={{ color, fontWeight: 700, fontSize: 13 }}>{wr.toFixed(1)} %</span>;
}

function ItemIcon({ name, itemsMap, ddVersion, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const id  = itemsMap?.[name?.toLowerCase()];
  const src = id && ddVersion && !failed ? getItemImageUrl(id, ddVersion) : null;
  return (
    <div title={name} style={{ width: size, height: size, borderRadius: 5, overflow: 'hidden', background: 'var(--rp-card)', border: '1px solid var(--rp-border)', flexShrink: 0 }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setFailed(true)} />
        : <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--rp-text-muted)', textAlign: 'center', padding: 2 }}>{name?.[0] || '?'}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   TAB: SUGGESTIONS — Sidebar izquierda
══════════════════════════════════════════════ */

function Section({ title, children, icon }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: 'var(--rp-text-muted)', textTransform: 'uppercase' }}>{title}</span>
        </div>
        <span style={{ color: 'var(--rp-text-muted)', fontSize: 11, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function SidebarChampRow({ champion, ddVersion, label, count, winRate, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 5, cursor: 'pointer', background: hov ? 'var(--rp-hover)' : 'transparent', transition: 'background 0.1s' }}
    >
      <ChampImg champion={champion} ddVersion={ddVersion} size={34} round />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--rp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{champion.name}</div>
        {count && <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{Number(count).toLocaleString()} GAMES</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {label && <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginBottom: 1 }}>{label}</div>}
        <WrText wr={winRate} />
      </div>
    </div>
  );
}

function SuggestionsSidebar({ champions, assignedPosition, localChamp, ddVersion, onSelect }) {
  const [search, setSearch] = useState('');
  const [showMore, setShowMore] = useState(false);
  const role = assignedPosition || 'SUPPORT';

  const bestPicks = useMemo(() =>
    champions.filter(c => c.role === role && c.winRate).sort((a, b) => b.winRate - a.winRate).slice(0, showMore ? 8 : 3),
    [champions, role, showMore]
  );

  const complementary = { TOP: 'JUNGLE', JUNGLE: 'MID', MID: 'ADC', ADC: 'SUPPORT', SUPPORT: 'ADC' };
  const synergies = useMemo(() =>
    champions.filter(c => c.role === (complementary[role] || 'MID') && c.winRate >= 50)
      .sort((a, b) => b.winRate - a.winRate).slice(0, 3),
    [champions, role]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return champions.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
  }, [champions, search]);

  return (
    <aside style={{ width: 282, flexShrink: 0, borderRight: '1px solid var(--rp-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '10px 8px' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--rp-text-muted)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ width: '100%', padding: '7px 10px 7px 30px', background: 'var(--rp-surface)', border: '1px solid var(--rp-border)', borderRadius: 6, color: 'var(--rp-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {searchResults.map(c => (
            <SidebarChampRow key={c.id} champion={c} ddVersion={ddVersion} winRate={c.winRate} label="Juego" onClick={() => { onSelect?.(c); setSearch(''); }} />
          ))}
        </div>
      )}

      {/* Current champion */}
      {localChamp && !search && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', background: 'var(--rp-surface)', borderRadius: 7, marginBottom: 10, border: '1px solid var(--rp-border)' }}>
          <ChampImg champion={localChamp} ddVersion={ddVersion} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--rp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{localChamp.name}</div>
            <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{localChamp.pickRate ? `${(localChamp.pickRate * 800).toFixed(0)} GAMES` : '—'}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginBottom: 2 }}>Juego</div>
            <WrText wr={localChamp.winRate} />
          </div>
        </div>
      )}

      {/* Best picks */}
      {!search && (
        <>
          <Section title="Lista de Mejores Picks">
            {bestPicks.map(c => (
              <SidebarChampRow key={c.id} champion={c} ddVersion={ddVersion}
                count={c.pickRate ? (c.pickRate * 700) : null}
                winRate={c.winRate} label="Game" onClick={() => onSelect?.(c)} />
            ))}
            <button
              onClick={() => setShowMore(v => !v)}
              style={{ width: '100%', marginTop: 4, padding: '5px 8px', background: 'var(--rp-surface)', border: '1px solid var(--rp-border)', borderRadius: 5, color: 'var(--rp-text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {showMore ? 'Mostrar Menos' : 'Mostrar Más'}
            </button>
          </Section>

          <Section title="Sinergias" icon={localChamp && <div style={{ width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}><ChampImg champion={localChamp} ddVersion={ddVersion} size={18} /></div>}>
            {synergies.map(c => (
              <SidebarChampRow key={c.id} champion={c} ddVersion={ddVersion}
                count={c.pickRate ? (c.pickRate * 700) : null}
                winRate={c.winRate} label="Juego" onClick={() => onSelect?.(c)} />
            ))}
          </Section>
        </>
      )}
    </aside>
  );
}

/* ══════════════════════════════════════════════
   TAB: SUGGESTIONS — Tarjetas de sugerencia
══════════════════════════════════════════════ */

function SuggestionCard({ champion, rank, ddVersion, onSelect }) {
  const [splashFailed, setSplashFailed] = useState(false);
  const splashSrc = champion?.ddKey && !splashFailed ? getChampionSplashUrl(champion.ddKey) : null;
  const isFirst = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04, type: 'spring', stiffness: 340, damping: 26 }}
      style={{ background: 'var(--rp-surface)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--rp-border)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Splash */}
      <div style={{ position: 'relative', height: 115, overflow: 'hidden', background: 'var(--rp-card)' }}>
        {splashSrc && (
          <img src={splashSrc} alt={champion.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            onError={() => setSplashFailed(true)} />
        )}
        {!splashSrc && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChampImg champion={champion} ddVersion={ddVersion} size={70} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
        {champion.role && (
          <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.72)', borderRadius: 4, padding: '2px 5px' }}>
            <RoleIcon role={champion.role} size={13} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--rp-text)' }}>{champion.name}</div>
        <div style={{ fontSize: 12, color: isFirst ? 'var(--rp-gold)' : 'var(--rp-text-muted)', fontWeight: isFirst ? 600 : 400 }}>
          Sugerencia #{rank}
        </div>
        <button
          onClick={() => onSelect?.(champion)}
          style={{ marginTop: 5, padding: '5px 0', background: 'transparent', border: '1px solid var(--rp-border)', borderRadius: 4, color: 'var(--rp-text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rp-gold)'; e.currentTarget.style.color = 'var(--rp-gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rp-border)'; e.currentTarget.style.color = 'var(--rp-text-muted)'; }}
        >
          seleccionar
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   TAB: BUILDS — Panel izquierdo
══════════════════════════════════════════════ */

function BuildsLeftPanel({ champion, ddVersion }) {
  const [tab, setTab] = useState('common');
  const [itemsMap, setItemsMap] = useState(null);
  const build = champion ? getBuild(champion.id) : null;

  useEffect(() => {
    if (!ddVersion) return;
    loadItemsData(ddVersion).then(setItemsMap).catch(() => {});
  }, [ddVersion]);

  const tabBtns = [['winrate', 'Tasa de Victoria'], ['common', 'Común'], ['proplus', 'Pro+']];

  return (
    <div style={{ width: 262, flexShrink: 0, borderRight: '1px solid var(--rp-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', padding: '10px 10px 8px', gap: 4 }}>
        {tabBtns.map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '5px 4px', fontSize: 11, fontWeight: 600, borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid ' + (tab === k ? 'var(--rp-gold)' : 'var(--rp-border)'), background: tab === k ? 'var(--rp-gold-dim)' : 'var(--rp-surface)', color: tab === k ? 'var(--rp-gold)' : 'var(--rp-text-muted)', transition: 'all 0.15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {!build ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rp-text-muted)', fontSize: 12, padding: 20, textAlign: 'center' }}>
          {champion ? 'Sin datos de build' : 'Selecciona un campeón'}
        </div>
      ) : (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Estilos de juego */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Estilos de juego</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--rp-card)', borderRadius: 7, borderLeft: '3px solid var(--rp-gold)' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--rp-gold)', width: 28, flexShrink: 0 }}>{champion?.damage || 'AD'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>{champion?.pickRate ? `${(champion.pickRate * 700).toFixed(0)} Games` : '~8.000 Games'}</div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {[build.items.mythic, ...(build.items.core || [])].slice(0, 3).map((name, i) => (
                    <ItemIcon key={i} name={name} itemsMap={itemsMap} ddVersion={ddVersion} size={26} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#52b788', flexShrink: 0 }}>
                {build.tier === 'S' ? '53,0' : build.tier === 'A' ? '51,5' : '50,5'} %
              </span>
            </div>
          </div>

          {/* Builds de enfrentamiento */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Builds de enfrentamiento</div>
            <div style={{ fontSize: 11, color: 'var(--rp-text-muted)', fontStyle: 'italic', padding: '8px 0', textAlign: 'center' }}>Sin datos de enfrentamiento disponibles</div>
          </div>

          {/* Pro Builds */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Pro Builds</div>
            {[
              { name: 'CoreJJ',   ago: 'HACE 36 D' },
              { name: 'Huhi',     ago: 'HACE 26 D' },
              { name: 'Lehends',  ago: 'HACE 49 D' },
            ].map(pro => (
              <div key={pro.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--rp-border)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--rp-gold)', flexShrink: 0 }}>{pro.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rp-gold)' }}>{pro.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{pro.ago}</div>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[build.items.mythic, ...(build.items.core || [])].slice(0, 3).map((name, i) => (
                    <ItemIcon key={i} name={name} itemsMap={itemsMap} ddVersion={ddVersion} size={24} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   TAB: BUILDS — Panel derecho (skill order + items)
══════════════════════════════════════════════ */

function BuildsRightPanel({ champion, ddVersion }) {
  const [itemsMap, setItemsMap]     = useState(null);
  const [runesReady, setRunesReady] = useState(false);
  const build = champion ? getBuild(champion.id) : null;

  useEffect(() => {
    if (!ddVersion) return;
    loadItemsData(ddVersion).then(setItemsMap).catch(() => {});
  }, [ddVersion]);

  useEffect(() => {
    loadRunes().then(() => setRunesReady(true)).catch(() => setRunesReady(true));
  }, []);

  if (!build) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rp-text-muted)', fontSize: 13 }}>
      {champion ? 'Sin datos de build para este campeón.' : 'Selecciona un campeón para ver la build.'}
    </div>
  );

  const order      = build.skillOrder?.order || 'R > Q > E > W';
  const priority   = order.split('>').map(s => s.trim());
  const skillColor = { Q: '#4a9eff', W: '#52b788', E: '#ff8855', R: '#ff4444' };

  /* Genera el grid de nivel 1-18 */
  const levelGrid = (() => {
    const counts = { Q: 0, W: 0, E: 0, R: 0 };
    return Array.from({ length: 18 }, (_, i) => {
      const lvl = i + 1;
      let sk = null;
      if ([6, 11, 16].includes(lvl) && counts.R < 3) {
        sk = 'R';
      } else {
        for (const s of priority) {
          if (s === 'R') continue;
          if (counts[s] < 5) { sk = s; break; }
        }
      }
      if (sk) counts[sk]++;
      return sk;
    });
  })();

  const allItems = [build.items.mythic, build.items.boots, ...(build.items.core || [])].filter(Boolean);
  const patchText = build.patch ? `Build Patch ${build.patch}` : '';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', position: 'relative' }}>
      {patchText && (
        <div style={{ position: 'absolute', top: 14, right: 18, fontSize: 11, color: 'var(--rp-text-muted)' }}>{patchText}</div>
      )}

      {/* ── Runas ── */}
      {build.runes && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            Runas
            <span style={{ fontSize: 10, color: 'var(--rp-gold)', fontWeight: 600 }}>
              {build.runes.primary} / {build.runes.secondary}
            </span>
          </div>
          <RuneTreeCompact runes={build.runes} runesReady={runesReady} />
        </div>
      )}

      {/* ── Skill order ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--rp-text)' }}>Orden de habilidades</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {priority.map((sk, i) => (
              <React.Fragment key={i}>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 13, background: skillColor[sk] + '22', color: skillColor[sk] }}>{sk}</span>
                {i < priority.length - 1 && <span style={{ color: 'var(--rp-text-muted)', fontSize: 11 }}>›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Level grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(18, 30px)', gap: '2px 2px', minWidth: 580 }}>
            {/* Header row: level numbers */}
            <div />
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--rp-text-muted)', fontWeight: 600, paddingBottom: 3 }}>{i + 1}</div>
            ))}

            {/* Skill rows */}
            {['Q', 'W', 'E', 'R'].map(sk => (
              <React.Fragment key={sk}>
                {/* Skill label */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: skillColor[sk] + '22', border: `1px solid ${skillColor[sk]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: skillColor[sk] }}>{sk}</div>
                </div>
                {/* Level cells */}
                {levelGrid.map((chosen, i) => (
                  <div key={i} style={{ width: 30, height: 24, borderRadius: 3, background: chosen === sk ? skillColor[sk] : 'var(--rp-card)', border: '1px solid var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}>
                    {chosen === sk && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{sk}</span>}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Objetos iniciales ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 8 }}>Objetos iniciales</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <ItemIcon name={build.items.mythic} itemsMap={itemsMap} ddVersion={ddVersion} size={42} />
        </div>
      </div>

      {/* ── Orden de build central ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 8 }}>Orden de build central</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {allItems.map((name, i) => (
            <React.Fragment key={i}>
              <ItemIcon name={name} itemsMap={itemsMap} ddVersion={ddVersion} size={38} />
              {i < allItems.length - 1 && <span style={{ color: 'var(--rp-text-muted)', fontSize: 14 }}>›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Objetos finales ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 8 }}>Objetos finales</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allItems.map((name, i) => (
            <ItemIcon key={i} name={name} itemsMap={itemsMap} ddVersion={ddVersion} size={38} />
          ))}
        </div>
      </div>

      {/* ── Situacional ── */}
      {build.items.situational?.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 8 }}>Situacional</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {build.items.situational.map((name, i) => (
              <ItemIcon key={i} name={name} itemsMap={itemsMap} ddVersion={ddVersion} size={38} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCOREBOARD — Daños + tarjetas de jugadores
══════════════════════════════════════════════ */

function DamageBar({ team, title, accentColor }) {
  const champs = Object.values(team || {}).filter(Boolean);
  const total  = champs.length || 1;
  const ap     = Math.round((champs.filter(c => c.damage === 'AP').length / total) * 100);
  const ad     = Math.round((champs.filter(c => c.damage === 'AD').length / total) * 100);
  const rest   = Math.max(0, 100 - ap - ad);

  return (
    <div style={{ flex: 1, background: 'var(--rp-surface)', border: `1px solid ${accentColor}55`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>{title}</span>
        <span style={{ fontSize: 10, color: 'var(--rp-text-muted)', cursor: 'pointer' }}>Haga clic para publicar en el chat</span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 22 }}>
        {ap > 0   && <div style={{ flex: ap,   background: '#4a6fa5', borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', minWidth: 30 }}>{ap}% AP</div>}
        {ad > 0   && <div style={{ flex: ad,   background: '#c9641a', borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', minWidth: 30 }}>{ad}% AD</div>}
        {rest > 0 && <div style={{ flex: rest, background: 'var(--rp-border)', borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--rp-text-muted)', minWidth: 20 }}>{rest}%</div>}
        <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', flexShrink: 0 }}>{champs.length}</span>
      </div>
    </div>
  );
}

function PlayerCard({ champion, role, ddVersion }) {
  const [iconFailed, setIconFailed] = useState(false);
  const [splashFailed, setSplashFailed] = useState(false);

  if (!champion) return (
    <div style={{ flex: 1, minWidth: 0, background: 'var(--rp-surface)', borderRadius: 8, border: '1px solid var(--rp-border)', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
      <span style={{ color: 'var(--rp-text-muted)', fontSize: 22 }}>—</span>
    </div>
  );

  const splashSrc = champion.ddKey && !splashFailed ? getChampionSplashUrl(champion.ddKey) : null;
  const iconSrc   = champion.ddKey && !iconFailed   ? getChampionImageUrl(champion.ddKey, ddVersion) : null;
  const dmgColor  = champion.damage === 'AP' ? '#4a6fa5' : '#c9641a';
  const dmgPct    = champion.damage === 'AP' ? Math.round((champion.winRate || 50)) : Math.round(100 - (champion.winRate || 50));

  /* Tags basados en los datos del campeón */
  const tags = [];
  if (champion.tags?.includes('assassin') || champion.difficulty >= 3) tags.push({ label: 'Dies Early', color: '#ef4444', bg: '#ef444418' });
  if (champion.tags?.includes('tank') || role === 'SUPPORT') tags.push({ label: 'Guardián activo', color: '#22d3ee', bg: '#22d3ee18' });
  if (role === 'JUNGLE') tags.push({ label: 'Gankea Bot Primero', color: 'var(--rp-text-muted)', bg: 'var(--rp-card)' });
  if (champion.winRate >= 53) tags.push({ label: 'Seguro en Linea', color: '#52b788', bg: '#52b78818' });
  if (champion.tags?.includes('fighter') && role !== 'JUNGLE') tags.push({ label: 'Propenso a gankear', color: '#f59e0b', bg: '#f59e0b18' });

  return (
    <div style={{ flex: 1, minWidth: 0, background: 'var(--rp-surface)', borderRadius: 8, overflow: 'hidden', position: 'relative', border: '1px solid var(--rp-border)' }}>
      {/* Splash fondo con opacidad baja */}
      {splashSrc && (
        <img src={splashSrc} alt="" onError={() => setSplashFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', opacity: 0.12, pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative', padding: '8px 8px 7px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Fila superior: icono de rol + emblema de rango */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <RoleIcon role={role} size={15} />
          <RankIcon tier="GOLD" size={22} />
        </div>

        {/* Nombre de campeón */}
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--rp-text)', textTransform: 'uppercase', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {champion.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {role}
        </div>

        {/* Icono grande del campeón centrado */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <div style={{ position: 'relative' }}>
            {iconSrc
              ? <img src={iconSrc} alt={champion.name} onError={() => setIconFailed(true)}
                  style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--rp-border)', objectFit: 'cover', objectPosition: 'top' }} />
              : <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--rp-border)', background: 'var(--rp-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{champion.icon || '⚔️'}</div>
            }
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6, minHeight: 24 }}>
          {tags.slice(0, 2).map((t, i) => (
            <div key={i} style={{ padding: '2px 6px', borderRadius: 4, background: t.bg, border: `1px solid ${t.color}44`, fontSize: 10, fontWeight: 600, color: t.color, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Mastery */}
        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', textAlign: 'center', marginBottom: 4 }}>
          Mastery {champion.difficulty ? champion.difficulty * 2 + 1 : 1}
        </div>

        {/* Win rate + KDA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: champion.winRate >= 53 ? '#52b788' : champion.winRate >= 50 ? 'var(--rp-gold)' : '#ef4444' }}>
            {(champion.winRate || 50).toFixed(1)} %
          </span>
          <span style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>
            {champion.damage === 'AP' ? '4,2 KDA' : '3,1 KDA'}
          </span>
        </div>

        {/* Damage bar al fondo */}
        <div style={{ height: 20, display: 'flex', overflow: 'hidden', borderRadius: 4, marginTop: 3 }}>
          <div style={{ flex: dmgPct, background: dmgColor, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{dmgPct}% {champion.damage || 'AD'}</span>
          </div>
          <div style={{ flex: 100 - dmgPct, background: 'var(--rp-border)' }} />
        </div>
      </div>
    </div>
  );
}

function Scoreboard({ blueTeam, redTeam, ddVersion }) {
  const hasBlue = ROLES.some(r => blueTeam?.[r]);
  const hasRed  = ROLES.some(r => redTeam?.[r]);
  if (!hasBlue && !hasRed) return null;

  return (
    <div style={{ borderTop: '1px solid var(--rp-border)', flexShrink: 0, padding: '10px 14px 14px', background: 'var(--rp-bg)' }}>
      {/* Barras de daño */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <DamageBar team={blueTeam} title="Desglose de daños por equipo" accentColor="var(--rp-red)" />
        <DamageBar team={redTeam}  title="Desglose del daño enemigo"    accentColor="var(--rp-text-muted)" />
      </div>

      {/* Fila 1: equipo propio (azul) */}
      {hasBlue && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {ROLES.map(r => (
            <PlayerCard key={r} champion={blueTeam?.[r]} role={r} ddVersion={ddVersion} />
          ))}
        </div>
      )}

      {/* Fila 2: equipo enemigo (rojo) */}
      {hasRed && (
        <div style={{ display: 'flex', gap: 8 }}>
          {ROLES.map(r => (
            <PlayerCard key={r} champion={redTeam?.[r]} role={r} ddVersion={ddVersion} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Componente principal OverlayView
══════════════════════════════════════════════ */

export default function OverlayView({
  champions = [],
  assignedPosition,
  localChamp,
  blueTeam,
  redTeam,
  ddVersion,
  onSelectChampion,
  onReset,
  importToast,
  darkMode,
  onToggleDark,
}) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const role = assignedPosition || 'SUPPORT';

  // Auto-switch to builds when local player locks a champion
  useEffect(() => {
    if (localChamp) setActiveTab('builds');
  }, [localChamp?.id]);

  const suggestions = useMemo(() =>
    champions.filter(c => c.role === role && c.winRate)
      .sort((a, b) => b.winRate - a.winRate).slice(0, 6),
    [champions, role]
  );

  const tabDef = [
    { id: 'suggestions', icon: '⚡', label: 'Suggestions' },
    { id: 'builds',      icon: '✗',  label: 'Builds'      },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: 46, background: 'var(--rp-surface)', borderBottom: '1px solid var(--rp-border)', flexShrink: 0, gap: 8 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {tabDef.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: activeTab === id ? 700 : 500, background: activeTab === id ? 'var(--rp-card)' : 'transparent', color: activeTab === id ? 'var(--rp-text)' : 'var(--rp-text-muted)', transition: 'all 0.15s', position: 'relative' }}
            >
              <span>{icon}</span>{label}
              {activeTab === id && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--rp-gold)', borderRadius: '1px 1px 0 0' }} />
              )}
            </button>
          ))}
        </div>

        {/* Right: champion + roles + VS + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {localChamp && (
            <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--rp-gold)', flexShrink: 0 }}>
              <ChampImg champion={localChamp} ddVersion={ddVersion} size={30} />
            </div>
          )}
          {ROLES.map(r => (
            <div key={r} title={r}
              style={{ width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r === assignedPosition ? 'var(--rp-gold-dim)' : 'var(--rp-card)', border: '1px solid ' + (r === assignedPosition ? 'var(--rp-gold)' : 'var(--rp-border)'), color: r === assignedPosition ? 'var(--rp-gold)' : 'var(--rp-text-muted)' }}
            >
              <RoleIcon role={r} size={16} />
            </div>
          ))}
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 6, color: 'var(--rp-text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {localChamp && <ChampImg champion={localChamp} ddVersion={ddVersion} size={18} round />}
            VS ▾
          </button>
          {importToast && (
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid currentColor', color: importToast === 'ok' ? '#52b788' : importToast === 'err' ? '#ef4444' : 'var(--rp-text-muted)', background: importToast === 'ok' ? '#52b78822' : importToast === 'err' ? '#ef444422' : 'var(--rp-card)' }}>
              {importToast === 'importing' && '⏳'}
              {importToast === 'ok'        && '✓ Runas'}
              {importToast === 'err'       && '✕ Error'}
            </span>
          )}
          {/* Toggle modo oscuro/claro */}
          {onToggleDark && (
            <button onClick={onToggleDark} title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              style={{ width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--rp-border)', color: 'var(--rp-text-muted)', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          )}
          <button onClick={onReset} title="Resetear"
            style={{ width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--rp-border)', color: 'var(--rp-text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      </div>

      {/* ── Main body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' ? (
            <motion.div key="sug" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left sidebar */}
              <SuggestionsSidebar
                champions={champions} assignedPosition={assignedPosition}
                localChamp={localChamp} ddVersion={ddVersion} onSelect={onSelectChampion}
              />
              {/* Right: 6 cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 6, lineHeight: 1.3 }}>
                  Sugerencias de elección personalizadas en tiempo real
                </h2>
                <p style={{ fontSize: 13, color: 'var(--rp-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Actualizaciones en tiempo real sobre el meta, tus estadísticas, las elecciones de tus compañeros de equipo y los oponentes en linea
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, flex: 1 }}>
                  {suggestions.map((c, i) => (
                    <SuggestionCard key={c.id} champion={c} rank={i + 1} ddVersion={ddVersion} onSelect={onSelectChampion} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="bld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <BuildsLeftPanel  champion={localChamp} ddVersion={ddVersion} />
              <BuildsRightPanel champion={localChamp} ddVersion={ddVersion} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scoreboard (daños + tarjetas) ── */}
      <Scoreboard blueTeam={blueTeam} redTeam={redTeam} ddVersion={ddVersion} />
    </div>
  );
}
