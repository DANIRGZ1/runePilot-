import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RoleIcon } from './RoleIcons';
import {
  getChampionIconByKey,
  getChampionSplashByKey,
  getProfileIconUrl,
  getRankedEmblemUrl,
  getItemImageUrl,
  getSpellImageUrl,
} from '../services/datadragon';
import { metaBuilds } from '../data/builds';

/* ── Constants ── */
const QUEUE_NAMES = {
  420: 'Ranked Solo/Duo', 440: 'Ranked Flex', 450: 'ARAM',
  400: 'Normal Draft',    430: 'Normal',       700: 'Clash', 0: 'Custom',
};
const TIER_COLORS = {
  IRON:'#8d7154', BRONZE:'#a0522d', SILVER:'#8fa8b0', GOLD:'#c89b3c',
  PLATINUM:'#3fa58a', EMERALD:'#3fa565', DIAMOND:'#4fa8e0',
  MASTER:'#9550c0', GRANDMASTER:'#cf3f3f', CHALLENGER:'#f4c874',
};
const SPELL_ID_MAP = {
  1:'SummonerBoost', 3:'SummonerExhaust', 4:'SummonerFlash',
  6:'SummonerHaste', 7:'SummonerHeal', 11:'SummonerSmite',
  12:'SummonerTeleport', 14:'SummonerDot', 21:'SummonerBarrier',
  32:'SummonerSnowball',
};
const IMPORT_REGIONS = [
  { id: 'KR',  label: 'Korea',  source: 'Challenger KR'  },
  { id: 'EUW', label: 'EUW',   source: 'Challenger EUW' },
  { id: 'CN',  label: 'China', source: 'Challenger CN'  },
  { id: 'NA',  label: 'NA',    source: 'Challenger NA'  },
];

/* ── LP simulation: deterministic per gameId ── */
function simulateLpChange(gameId, win, queueId) {
  if (queueId !== 420 && queueId !== 440) return null;
  const seed = Number(String(gameId).slice(-4)) || 1234;
  const r = ((seed * 9301 + 49297) % 233280) / 233280;
  return win ? Math.round(18 + r * 14) : -Math.round(11 + r * 9);
}

/* ── Primitives ── */

function RankedEmblem({ tier, size = 80 }) {
  const [failed, setFailed] = useState(false);
  const src = tier ? getRankedEmblemUrl(tier) : null;
  if (!src || failed) return (
    <div style={{ width: size, height: size, display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--rp-surface)', borderRadius: 8, color:'var(--rp-text-muted)', fontSize: size * 0.3, fontWeight: 700 }}>
      {tier?.[0] || '?'}
    </div>
  );
  return <img src={src} alt={tier} width={size} height={size} className="rank-emblem-img" onError={() => setFailed(true)} />;
}

function ChampIcon({ champId, ddVersion, size = 36 }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!champId || !ddVersion) return;
    getChampionIconByKey(champId, ddVersion).then(url => setSrc(url || null));
  }, [champId, ddVersion]);
  if (!src || failed)
    return <div style={{ width: size, height: size, borderRadius: 6, background: 'var(--rp-surface)',
      border: '1px solid var(--rp-border)', flexShrink: 0 }} />;
  return <img src={src} alt="" width={size} height={size}
    style={{ borderRadius: 6, objectFit:'cover', flexShrink: 0, border: '1px solid var(--rp-border)' }}
    onError={() => setFailed(true)} />;
}

function SpellIcon({ spellId, ddVersion, size = 22 }) {
  const key = SPELL_ID_MAP[spellId];
  const [failed, setFailed] = useState(false);
  if (!key || !ddVersion || failed)
    return <div style={{ width: size, height: size, borderRadius: 4, background: 'var(--rp-surface)', border: '1px solid var(--rp-border)' }} />;
  const src = getSpellImageUrl(key, ddVersion);
  return <img src={src} alt={key} width={size} height={size}
    style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }}
    onError={() => setFailed(true)} />;
}

function ItemIcon({ itemId, ddVersion, size = 26 }) {
  const [failed, setFailed] = useState(false);
  if (!itemId || itemId === 0 || failed)
    return <div style={{ width: size, height: size, borderRadius: 4, background: 'var(--rp-surface)',
      border: '1px solid var(--rp-border)', opacity: 0.4 }} />;
  const src = getItemImageUrl(itemId, ddVersion);
  return <img src={src} alt="" width={size} height={size}
    style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)', cursor: 'default' }}
    onError={() => setFailed(true)} />;
}

/* ── WR Donut ── */
function WRDonut({ wr, label = '', size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (wr / 100) * circ;
  const color = wr >= 60 ? '#3a9f5f' : wr >= 52 ? '#c89b3c' : '#e84057';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rp-border)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round" />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1 }}>{wr}%</span>
        {label && <span style={{ fontSize: 9, color: 'var(--rp-text-sub)', marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

/* ── Rank Line Chart with hover tooltip ── */
function RankChart({ tier, division, lpHistory = [] }) {
  // lpHistory: array of { lp: number, date: timestamp|null }
  const [tooltip, setTooltip] = useState(null);

  const TIERS_ORDER = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER'];
  const DIV_ORDER = ['IV','III','II','I'];
  const tierIdx = TIERS_ORDER.indexOf(tier?.toUpperCase?.()) >= 0 ? TIERS_ORDER.indexOf(tier.toUpperCase()) : 5;
  const divIdx = DIV_ORDER.indexOf(division?.toUpperCase?.()) >= 0 ? DIV_ORDER.indexOf(division.toUpperCase()) : 1;
  const currentScore = tierIdx * 4 + divIdx;

  const scoreToTier = (score) => {
    const idx = Math.floor(score / 4);
    return TIERS_ORDER[Math.min(Math.max(idx, 0), TIERS_ORDER.length - 1)];
  };

  const formatDate = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Build points from LP history (most recent = rightmost)
  const chartData = useMemo(() => {
    const base = Math.max(0, currentScore - 6);
    if (lpHistory.length >= 2) {
      let score = currentScore;
      const reversed = [...lpHistory].reverse();
      const scores = [{ value: currentScore, entry: null }];
      for (const entry of reversed.slice(0, 7)) {
        const lp = typeof entry === 'object' ? entry.lp : entry;
        score = Math.max(0, score - lp);
        scores.unshift({ value: score, entry });
      }
      return scores.map((s, i) => {
        const origEntry = lpHistory[lpHistory.length - 1 - (scores.length - 1 - i)];
        const lp = origEntry != null ? (typeof origEntry === 'object' ? origEntry.lp : origEntry) : null;
        const date = origEntry != null && typeof origEntry === 'object' ? origEntry.date : null;
        return { value: s.value, lp, date };
      });
    }
    // Fallback: smooth curve
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const progress = i / 7;
      const noise = Math.sin(i * 2.3) * 0.8;
      pts.push({ value: base + progress * (currentScore - base) + noise, lp: null, date: null });
    }
    pts[pts.length - 1].value = currentScore;
    return pts;
  }, [currentScore, lpHistory]);

  const W = 220, H = 80;
  const values = chartData.map(d => d.value);
  const minP = Math.min(...values) - 1;
  const maxP = Math.max(...values) + 1;
  const toX = (i) => (i / (chartData.length - 1)) * W;
  const toY = (v) => H - ((v - minP) / (maxP - minP)) * (H - 4) - 2;
  const color = TIER_COLORS[tier] || '#4fa8e0';
  const lastX = toX(chartData.length - 1);
  const lastY = toY(chartData[chartData.length - 1].value);

  // Build colored segments per tier transition
  const segments = [];
  for (let i = 0; i < chartData.length - 1; i++) {
    const midScore = (chartData[i].value + chartData[i + 1].value) / 2;
    const segTier = scoreToTier(midScore);
    const segColor = TIER_COLORS[segTier] || color;
    const x1 = toX(i), y1 = toY(chartData[i].value);
    const x2 = toX(i + 1), y2 = toY(chartData[i + 1].value);
    segments.push({ x1, y1, x2, y2, color: segColor });
  }

  // Fill area path
  const pathD = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`).join(' ');
  const fillD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg width={W} height={H + 10} viewBox={`0 0 ${W} ${H + 10}`}
        style={{ overflow: 'visible', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="rankFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <path d={fillD} fill="url(#rankFillGrad)" />
        {/* Colored segments per tier */}
        {segments.map((seg, i) => (
          <line key={i}
            x1={seg.x1.toFixed(1)} y1={seg.y1.toFixed(1)}
            x2={seg.x2.toFixed(1)} y2={seg.y2.toFixed(1)}
            stroke={seg.color} strokeWidth="1.8"
            strokeLinecap="round" />
        ))}
        {/* Hover targets + dots */}
        {chartData.map((d, i) => {
          const cx = toX(i), cy = toY(d.value);
          const pointTier = scoreToTier(d.value);
          const pointColor = TIER_COLORS[pointTier] || color;
          const isHovered = tooltip && Math.abs(tooltip.x - cx) < 5;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="8" fill="transparent"
                onMouseEnter={() => setTooltip({ x: cx, y: cy, lp: d.lp, date: d.date, tier: pointTier })} />
              <circle cx={cx} cy={cy} r={isHovered ? 4 : 2.5}
                fill={isHovered ? pointColor : 'var(--rp-surface)'}
                stroke={pointColor} strokeWidth="1.5"
                style={{ transition: 'r 0.1s' }} />
            </g>
          );
        })}
        {/* Last dot */}
        <circle cx={lastX} cy={lastY} r="4" fill={color} stroke="var(--rp-card)" strokeWidth="2" />
      </svg>

      {/* Rank label */}
      <div style={{ position:'absolute', top: Math.max(0, lastY - 26), left: Math.min(W - 40, Math.max(0, lastX - 18)),
        background: 'var(--rp-surface)', border: `1px solid ${color}`,
        borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 700, color, pointerEvents: 'none' }}>
        {tier?.[0]}{['MASTER','GRANDMASTER','CHALLENGER'].includes(tier) ? '' : division}
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(W - 90, Math.max(0, tooltip.x - 40)),
          top: Math.max(0, tooltip.y - 52),
          background: 'var(--rp-card)',
          border: `1px solid ${TIER_COLORS[tooltip.tier] || 'var(--rp-border)'}`,
          borderRadius: 6,
          padding: '5px 9px',
          fontSize: 11,
          fontWeight: 700,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          {tooltip.lp !== null ? (
            <span style={{ color: tooltip.lp >= 0 ? 'var(--rp-green)' : 'var(--rp-red)' }}>
              {tooltip.lp >= 0 ? '+' : ''}{tooltip.lp} LP
            </span>
          ) : (
            <span style={{ color: TIER_COLORS[tooltip.tier] || color }}>
              {tooltip.tier}
            </span>
          )}
          {tooltip.date && (
            <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--rp-text-sub)', marginTop: 1 }}>
              {formatDate(tooltip.date)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Champion Stats row ── */
function ChampStatRow({ champ, ddVersion, onClick }) {
  const color = champ.wr >= 60 ? '#3a9f5f' : champ.wr >= 52 ? '#c89b3c' : '#e84057';
  const lpSign = champ.avgLp > 0 ? '+' : '';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
      borderBottom: '1px solid var(--rp-border)', cursor: 'pointer', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--rp-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <ChampIcon champId={champ.championId} ddVersion={ddVersion} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {champ.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>
          {champ.kdaStr} KDA
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color }}>{champ.wr}%</div>
        <div style={{ fontSize: 10, color: 'var(--rp-text-sub)' }}>{champ.games} partidas</div>
      </div>
      {champ.avgLp !== null && (
        <div style={{ fontSize: 11, fontWeight: 700, color: champ.avgLp >= 0 ? '#3a9f5f' : '#e84057',
          minWidth: 42, textAlign: 'right', flexShrink: 0 }}>
          {lpSign}{champ.avgLp} LP
        </div>
      )}
    </div>
  );
}

/* ── Match Row ── */
function MatchRow({ game, ddVersion, expanded, onToggle }) {
  const me = game.participants?.[0];
  if (!me) return null;
  const stats = me.stats || {};
  const win = stats.win;
  const k = stats.kills ?? 0, d = stats.deaths ?? 0, a = stats.assists ?? 0;
  const kda = d === 0 ? '∞' : ((k + a) / d).toFixed(2);
  const mins = game.gameDuration ? Math.floor(game.gameDuration / 60) : 0;
  const secs = game.gameDuration ? game.gameDuration % 60 : 0;
  const duration = `${mins}m ${String(secs).padStart(2,'0')}s`;
  const queueName = QUEUE_NAMES[game.queueId] ?? `Cola ${game.queueId}`;
  const lpChange = simulateLpChange(game.gameId, win, game.queueId);
  const cs = (stats.totalMinionsKilled ?? 0) + (stats.neutralMinionsKilled ?? 0);
  const csPerMin = mins > 0 ? (cs / mins).toFixed(1) : '0';

  const teamPos = me.teamPosition || me.timeline?.lane || '';
  let role = teamPos?.toUpperCase();
  if (role === 'MIDDLE') role = 'MID';
  if (role === 'BOTTOM' && (me.timeline?.role || '').toUpperCase() === 'SUPPORT') role = 'UTILITY';

  const items = [stats.item0, stats.item1, stats.item2, stats.item3, stats.item4, stats.item5];
  const trinket = stats.item6;

  const winColor = win ? '#3a9f5f' : '#e84057';
  const winBg = win ? 'rgba(58,159,95,0.06)' : 'rgba(232,64,87,0.06)';
  const winBorder = win ? 'rgba(58,159,95,0.18)' : 'rgba(232,64,87,0.18)';

  const timeAgo = game.gameCreation
    ? (() => {
        const diff = Date.now() - game.gameCreation;
        const m = Math.floor(diff / 60000);
        if (m < 60) return `${m} min ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
      })()
    : '';

  return (
    <div style={{ borderRadius: 8, marginBottom: 6, overflow: 'hidden', border: `1px solid ${winBorder}` }}>
      {/* Main row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: winBg, borderLeft: `3px solid ${winColor}`, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = win ? 'rgba(58,159,95,0.10)' : 'rgba(232,64,87,0.10)'}
        onMouseLeave={e => e.currentTarget.style.background = winBg}
      >
        {/* Queue + LP */}
        <div style={{ width: 100, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginBottom: 2 }}>{queueName}</div>
          {lpChange !== null && (
            <div style={{ fontSize: 16, fontWeight: 800, color: lpChange >= 0 ? '#3a9f5f' : '#e84057' }}>
              {lpChange >= 0 ? '+' : ''}{lpChange} LP
            </div>
          )}
        </div>

        {/* Champ + spells */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
          <ChampIcon champId={me.championId} ddVersion={ddVersion} size={42} />
          <div style={{ display: 'flex', gap: 2 }}>
            <SpellIcon spellId={me.spell1Id} ddVersion={ddVersion} size={20} />
            <SpellIcon spellId={me.spell2Id} ddVersion={ddVersion} size={20} />
          </div>
        </div>

        {/* KDA */}
        <div style={{ minWidth: 90, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--rp-text)' }}>
            <span style={{ color: '#3a9f5f' }}>{k}</span>
            <span style={{ color: 'var(--rp-text-muted)', fontWeight: 400 }}> / </span>
            <span style={{ color: d >= 8 ? '#e84057' : 'var(--rp-text)' }}>{d}</span>
            <span style={{ color: 'var(--rp-text-muted)', fontWeight: 400 }}> / </span>
            <span>{a}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>
            <span style={{ fontWeight: 700, color: d === 0 ? '#c89b3c' : 'var(--rp-text)' }}>{kda}</span> KDA
          </div>
          <div style={{ fontSize: 10, color: 'var(--rp-text-sub)' }}>CS {cs} ({csPerMin})</div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
          {items.map((id, i) => (
            <ItemIcon key={i} itemId={id} ddVersion={ddVersion} size={26} />
          ))}
          <div style={{ width: 1, background: 'var(--rp-border)', margin: '0 2px', alignSelf: 'stretch' }} />
          <ItemIcon itemId={trinket} ddVersion={ddVersion} size={26} />
        </div>

        {/* Meta: role, result, time */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 2, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RoleIcon role={role} size={12} />
            <span style={{ fontSize: 12, fontWeight: 700, color: winColor }}>{win ? 'VICTORIA' : 'DERROTA'}</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--rp-text-sub)' }}>{duration}</span>
          {timeAgo && <span style={{ fontSize: 10, color: 'var(--rp-text-sub)' }}>{timeAgo}</span>}
        </div>

        {/* Toggle button */}
        <button onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ background: 'none', border: 'none', color: 'var(--rp-text-muted)', cursor: 'pointer',
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, padding: '4px 6px',
            borderRadius: 4, transition: 'color 0.15s', flexShrink: 0 }}>
          VER MÁS {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ background: 'var(--rp-surface)', borderTop: `1px solid ${winBorder}`, padding: '10px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--rp-text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Estadísticas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  ['Daño a campeones', (stats.totalDamageDealtToChampions ?? 0).toLocaleString()],
                  ['Daño recibido', (stats.totalDamageTaken ?? 0).toLocaleString()],
                  ['Visión', stats.visionScore ?? 0],
                  ['Wardes colocados', stats.wardsPlaced ?? 0],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--rp-text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--rp-text)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--rp-text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Hechizos evocadores</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <SpellIcon spellId={me.spell1Id} ddVersion={ddVersion} size={32} />
                <SpellIcon spellId={me.spell2Id} ddVersion={ddVersion} size={32} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--rp-text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Objetos</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {items.map((id, i) => <ItemIcon key={i} itemId={id} ddVersion={ddVersion} size={32} />)}
                <ItemIcon itemId={trinket} ddVersion={ddVersion} size={32} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Import Builds from Regions ── */
function ImportBuildsSection({ ddVersion, onImport, lcuConnected }) {
  const [selectedRegion, setSelectedRegion] = useState('KR');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [selectedChamp, setSelectedChamp] = useState('');
  const champNames = useMemo(() => Object.keys(metaBuilds || {}).map(k => k.charAt(0).toUpperCase() + k.slice(1)).sort(), []);

  async function doImport() {
    if (!selectedChamp || !lcuConnected) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const region = IMPORT_REGIONS.find(r => r.id === selectedRegion);
      const build = metaBuilds?.[selectedChamp.toLowerCase()];
      if (!build) { setImportStatus({ type: 'err', msg: 'Build no encontrada para este campeón' }); setImporting(false); return; }
      const res = await fetch('http://localhost:3001/lcu/runes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champion: selectedChamp, source: region?.source }),
      });
      if (res.ok) setImportStatus({ type: 'ok', msg: `Runas de ${region?.label} importadas` });
      else setImportStatus({ type: 'err', msg: 'Error al importar' });
    } catch { setImportStatus({ type: 'err', msg: 'Sin conexión con el LCU' }); }
    setImporting(false);
    setTimeout(() => setImportStatus(null), 3500);
  }

  return (
    <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
        color: 'var(--rp-text-muted)', marginBottom: 12 }}>
        Importar build por region
      </div>

      {/* Region selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {IMPORT_REGIONS.map(r => (
          <button key={r.id} onClick={() => setSelectedRegion(r.id)}
            style={{
              flex: 1, padding: '6px 4px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
              background: selectedRegion === r.id ? 'var(--rp-gold-dim)' : 'var(--rp-surface)',
              borderColor: selectedRegion === r.id ? 'var(--rp-gold)' : 'var(--rp-border)',
              color: selectedRegion === r.id ? 'var(--rp-gold)' : 'var(--rp-text-muted)',
            }}>
            {r.id}
          </button>
        ))}
      </div>

      {/* Champ selector */}
      <select value={selectedChamp} onChange={e => setSelectedChamp(e.target.value)}
        style={{ width: '100%', padding: '7px 10px', background: 'var(--rp-surface)',
          border: '1px solid var(--rp-border)', borderRadius: 6, color: selectedChamp ? 'var(--rp-text)' : 'var(--rp-text-sub)',
          fontSize: 12, outline: 'none', marginBottom: 10, cursor: 'pointer' }}>
        <option value="">Seleccionar campeón…</option>
        {champNames.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Import button */}
      <button onClick={doImport} disabled={!selectedChamp || importing || !lcuConnected}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
          cursor: selectedChamp && lcuConnected ? 'pointer' : 'not-allowed',
          background: selectedChamp && lcuConnected ? 'var(--rp-gold)' : 'var(--rp-surface)',
          border: 'none', color: 'white', opacity: (!selectedChamp || !lcuConnected) ? 0.5 : 1,
          transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
        {importing ? 'Importando...' : 'Importar runas al cliente'}
      </button>

      {importStatus && (
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 4, textAlign: 'center',
          background: importStatus.type === 'ok' ? 'rgba(16,185,129,0.1)' : 'var(--rp-red-dim)',
          color: importStatus.type === 'ok' ? '#10b981' : 'var(--rp-red)',
          border: `1px solid ${importStatus.type === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(232,64,87,0.3)'}` }}>
          {importStatus.msg}
        </div>
      )}

      {!lcuConnected && (
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--rp-text-sub)', textAlign: 'center' }}>
          Requiere League of Legends abierto
        </div>
      )}
    </div>
  );
}

/* ── Premium Spinner Box ── */
function SpinnerBox({ size = 52, label = '', sublabel = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      {/* Box + rotating border */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Outer spinning square */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            border: '2px solid transparent',
            borderTopColor: 'var(--rp-gold)',
            borderRightColor: 'rgba(200,155,60,0.25)',
            borderRadius: 4,
          }}
        />
        {/* Inner box — counter-rotate slowly */}
        <motion.div
          animate={{ rotate: -180 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 8,
            border: '1px solid rgba(200,155,60,0.3)',
            borderRadius: 2,
          }}
        />
        {/* Center logo */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(size * 0.3), fontWeight: 800,
          letterSpacing: 1, color: 'var(--rp-gold)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          RP
        </div>
      </div>

      {/* Loading bar */}
      <div style={{ width: size * 2, height: 2, background: 'var(--rp-border)', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '60%', height: '100%', background: 'var(--rp-gold)', borderRadius: 1 }}
        />
      </div>

      <div>
        {label && (
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--rp-text)', margin: 0, textAlign: 'center' }}>
            {label}
          </motion.p>
        )}
        {sublabel && (
          <p style={{ fontSize: 12, color: 'var(--rp-text-muted)', margin: '4px 0 0', textAlign: 'center' }}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Connecting screens ── */
function ConnectingScreen() {
  return (
    <div className="home-connecting">
      <SpinnerBox size={56} label="Esperando a League of Legends..." sublabel="Abre el cliente de LoL para continuar" />
    </div>
  );
}

function LoadingData({ onRetry }) {
  const [showRetry, setShowRetry] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowRetry(true), 6000); return () => clearTimeout(t); }, []);
  return (
    <div className="home-connecting">
      <SpinnerBox size={52} label="Cargando perfil..." />
      {showRetry && (
        <button className="connecting-retry-btn" onClick={onRetry} style={{ marginTop: 8 }}>
          Reintentar conexion
        </button>
      )}
    </div>
  );
}

/* ── Main HomeView ── */
export default function HomeView({ ddVersion, playerData, lcuStatus, onRetry }) {
  const connected = lcuStatus === 'connected';
  const hasSummoner = !!playerData?.summoner?.displayName;

  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchedData, setSearchedData] = useState(null);
  const [viewMode, setViewMode] = useState('own');
  const [activeTab, setActiveTab] = useState('overview');
  const [matchFilter, setMatchFilter] = useState('all');
  const [expandedGame, setExpandedGame] = useState(null);
  const [reloading, setReloading] = useState(false);

  const [savedProfiles, setSavedProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rp_saved_profiles') || '[]'); }
    catch { return []; }
  });

  const displayData = viewMode === 'searched' ? searchedData : playerData;
  const allGames = displayData?.history?.games?.games ?? [];

  const filteredGames = useMemo(() => {
    if (matchFilter === 'ranked') return allGames.filter(g => g.queueId === 420);
    if (matchFilter === 'flex') return allGames.filter(g => g.queueId === 440);
    if (matchFilter === 'normal') return allGames.filter(g => g.queueId === 400 || g.queueId === 430);
    if (matchFilter === 'aram') return allGames.filter(g => g.queueId === 450);
    return allGames;
  }, [allGames, matchFilter]);

  /* Champion stats computed from history */
  const championStats = useMemo(() => {
    const map = {};
    for (const game of allGames) {
      const me = game.participants?.[0];
      if (!me) continue;
      const stats = me.stats || {};
      const cId = me.championId;
      if (!cId) continue;
      if (!map[cId]) map[cId] = { championId: cId, games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, lpSum: 0, lpGames: 0 };
      const e = map[cId];
      e.games++;
      if (stats.win) e.wins++;
      e.kills += stats.kills ?? 0;
      e.deaths += stats.deaths ?? 0;
      e.assists += stats.assists ?? 0;
      const lp = simulateLpChange(game.gameId, stats.win, game.queueId);
      if (lp !== null) { e.lpSum += lp; e.lpGames++; }
    }
    return Object.values(map)
      .map(e => ({
        ...e,
        wr: Math.round((e.wins / e.games) * 100),
        kda: e.deaths === 0 ? '∞' : ((e.kills + e.assists) / e.deaths).toFixed(2),
        kdaStr: `${(e.kills / e.games).toFixed(1)} / ${(e.deaths / e.games).toFixed(1)} / ${(e.assists / e.games).toFixed(1)}`,
        avgLp: e.lpGames > 0 ? Math.round(e.lpSum / e.lpGames) : null,
        name: null,
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 8);
  }, [allGames]);

  /* Most-played champion splash art */
  const [mostPlayedSplash, setMostPlayedSplash] = useState(null);
  useEffect(() => {
    const topChamp = championStats[0];
    if (!topChamp?.championId || !ddVersion) return;
    getChampionSplashByKey(topChamp.championId, ddVersion).then(url => {
      if (url) setMostPlayedSplash(url);
    });
  }, [championStats, ddVersion]);

  /* Ranked stats */
  const soloQ = displayData?.ranked?.queues?.find(q => q.queueType === 'RANKED_SOLO_5x5');
  const rankedQ = soloQ || displayData?.ranked?.queues?.find(q => q.queueType === 'RANKED_FLEX_SR');
  const tier = rankedQ?.tier || 'UNRANKED';
  const division = rankedQ?.division || '';
  const lp = rankedQ?.leaguePoints ?? 0;
  const wins = rankedQ?.wins ?? 0;
  const losses = rankedQ?.losses ?? 0;
  const totalGames = wins + losses;
  const wr = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const tierColor = TIER_COLORS[tier] || '#8fa8b0';

  /* Recent 20 games KDA */
  const recentKda = useMemo(() => {
    const recent = allGames.slice(0, 20);
    if (!recent.length) return null;
    let k = 0, d = 0, a = 0;
    for (const g of recent) {
      const s = g.participants?.[0]?.stats || {};
      k += s.kills ?? 0; d += s.deaths ?? 0; a += s.assists ?? 0;
    }
    const kda = d === 0 ? '∞' : ((k + a) / d).toFixed(2);
    return { k: (k / recent.length).toFixed(1), d: (d / recent.length).toFixed(1), a: (a / recent.length).toFixed(1), kda };
  }, [allGames]);

  /* Recent 20 WR */
  const recentWr = useMemo(() => {
    const recent = allGames.slice(0, 20);
    if (!recent.length) return null;
    const w = recent.filter(g => g.participants?.[0]?.stats?.win).length;
    return Math.round((w / recent.length) * 100);
  }, [allGames]);

  async function handleSearch(e) {
    e?.preventDefault();
    const name = searchInput.trim();
    if (!name) return;
    setSearching(true); setSearchError(null);
    try {
      const sumRes = await fetch(`http://localhost:3001/lcu/summoner/search?name=${encodeURIComponent(name)}`);
      if (!sumRes.ok) { setSearchError('Invocador no encontrado'); setSearching(false); return; }
      const summoner = await sumRes.json();
      const [rankRes, histRes] = await Promise.allSettled([
        fetch(`http://localhost:3001/lcu/ranked/by-id?summonerId=${summoner.summonerId}`).then(r => r.json()),
        fetch(`http://localhost:3001/lcu/history/by-puuid?puuid=${summoner.puuid}`).then(r => r.json()),
      ]);
      setSearchedData({ summoner, ranked: rankRes.status === 'fulfilled' ? rankRes.value : null, history: histRes.status === 'fulfilled' ? histRes.value : null });
      setViewMode('searched'); setActiveTab('overview');
    } catch { setSearchError('Error al conectar con el LCU'); }
    setSearching(false);
  }

  async function reloadStats() {
    setReloading(true);
    try { await onRetry?.(); } finally { setTimeout(() => setReloading(false), 1200); }
  }

  function saveProfile(summoner) {
    if (savedProfiles.some(p => p.puuid === summoner.puuid)) return;
    const profile = { displayName: summoner.displayName, puuid: summoner.puuid, summonerId: summoner.summonerId, profileIconId: summoner.profileIconId, summonerLevel: summoner.summonerLevel };
    const updated = [profile, ...savedProfiles].slice(0, 10);
    setSavedProfiles(updated);
    localStorage.setItem('rp_saved_profiles', JSON.stringify(updated));
  }

  function unsaveProfile(puuid) {
    const updated = savedProfiles.filter(p => p.puuid !== puuid);
    setSavedProfiles(updated);
    localStorage.setItem('rp_saved_profiles', JSON.stringify(updated));
  }

  async function loadSavedProfile(profile) {
    setSearchInput(profile.displayName); setSearching(true); setSearchError(null);
    try {
      const [rankRes, histRes] = await Promise.allSettled([
        fetch(`http://localhost:3001/lcu/ranked/by-id?summonerId=${profile.summonerId}`).then(r => r.json()),
        fetch(`http://localhost:3001/lcu/history/by-puuid?puuid=${profile.puuid}`).then(r => r.json()),
      ]);
      setSearchedData({ summoner: profile, ranked: rankRes.status === 'fulfilled' ? rankRes.value : null, history: histRes.status === 'fulfilled' ? histRes.value : null });
      setViewMode('searched'); setActiveTab('overview');
    } catch { setSearchError('Error al cargar perfil'); }
    setSearching(false);
  }

  if (!connected && !hasSummoner) return <ConnectingScreen />;
  if (connected && playerData === null) return <LoadingData onRetry={onRetry} />;

  const summoner = displayData?.summoner;
  const profileIconUrl = summoner?.profileIconId && ddVersion ? getProfileIconUrl(summoner.profileIconId, ddVersion) : null;
  const isSaved = savedProfiles.some(p => p.puuid === summoner?.puuid);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animation: 'fadeIn 0.3s ease' }}>

      {/* ── Left / Center column ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Search bar */}
        {connected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <form style={{ display: 'flex', flex: 1, maxWidth: 400 }} onSubmit={handleSearch}>
              <input className="home-search-input" type="text"
                placeholder="ej: Faker#KR1" value={searchInput}
                onChange={e => setSearchInput(e.target.value)} />
              <button className="home-search-btn" type="submit" disabled={searching}>
                {searching
                  ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display:'inline-block', fontSize:14 }}>o</motion.span>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
              </button>
            </form>
            {searchError && <span className="search-error">{searchError}</span>}
            {viewMode === 'searched' && (
              <button className="home-back-btn" onClick={() => { setViewMode('own'); setSearchInput(''); setSearchedData(null); }}>
                Mi perfil
              </button>
            )}
          </div>
        )}

        {/* Saved profiles */}
        {connected && savedProfiles.length > 0 && (
          <div className="saved-profiles-section">
            <span className="saved-profiles-label">Guardados</span>
            <div className="saved-profiles-list">
              {savedProfiles.map(p => (
                <div key={p.puuid} className="saved-chip">
                  {p.profileIconId && ddVersion && (
                    <img src={getProfileIconUrl(p.profileIconId, ddVersion)} alt="" className="saved-chip-icon" onError={() => {}} />
                  )}
                  <button className="saved-chip-name" onClick={() => loadSavedProfile(p)}>{p.displayName}</button>
                  <button className="saved-chip-remove" onClick={() => unsaveProfile(p.puuid)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {summoner ? (
          <>
            {/* ── Player card header ── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)',
                borderRadius: 10, overflow: 'hidden', position: 'relative' }}>

              {/* Splash background — most-played champion */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {mostPlayedSplash && (
                  <img
                    src={mostPlayedSplash}
                    alt=""
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center top',
                      opacity: 0.35, filter: 'saturate(0.8)',
                    }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0,
                  background: mostPlayedSplash
                    ? 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.15) 100%)'
                    : 'none',
                }} />
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px' }}>
                {/* Profile icon */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {profileIconUrl
                    ? <img src={profileIconUrl} alt="profile" style={{ width: 86, height: 86, borderRadius: 10, objectFit: 'cover', border: '3px solid var(--rp-gold)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
                    : <div style={{ width: 86, height: 86, borderRadius: 10, background: 'var(--rp-surface)', border: '3px solid var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--rp-text-muted)' }}>?</div>}
                  <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--rp-gold)', color: '#1a1200', fontSize: 10, fontWeight: 800,
                    padding: '1px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    {summoner.summonerLevel ?? '--'}
                  </div>
                </div>

                {/* Name + rank */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                      {summoner.displayName}
                    </span>
                    {tier !== 'UNRANKED' && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: tierColor, background: `${tierColor}20`,
                        border: `1px solid ${tierColor}50`, borderRadius: 4, padding: '2px 8px' }}>
                        {tier} {division}
                      </span>
                    )}
                    {viewMode === 'searched' && (
                      isSaved
                        ? <button className="save-profile-btn saved" onClick={() => unsaveProfile(summoner.puuid)}>Guardado</button>
                        : <button className="save-profile-btn" onClick={() => saveProfile(summoner)}>Guardar</button>
                    )}
                  </div>
                  {tier !== 'UNRANKED' ? (
                    <div style={{ fontSize: 13, color: 'var(--rp-text-muted)', marginBottom: 8 }}>
                      <span style={{ color: tierColor, fontWeight: 600 }}>{lp} LP</span>
                      {totalGames > 0 && <span> · {wins}V {losses}D · {wr}% WR</span>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--rp-text-muted)', marginBottom: 8 }}>Sin clasificar</div>
                  )}
                  {/* Reload button */}
                  {viewMode === 'own' && (
                    <button onClick={reloadStats} disabled={reloading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        background: 'rgba(200,155,60,0.12)', border: '1px solid var(--rp-gold)',
                        borderRadius: 6, color: 'var(--rp-gold)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s', opacity: reloading ? 0.6 : 1 }}>
                      <motion.span animate={reloading ? { rotate: 360 } : { rotate: 0 }}
                        transition={reloading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
                          </svg>
                        </motion.span>
                      Recargar stats
                    </button>
                  )}
                </div>

                {/* Rank emblem */}
                {tier !== 'UNRANKED' && <RankedEmblem tier={tier} size={140} />}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderTop: '1px solid var(--rp-border)', padding: '0 24px' }}>
                {['overview', 'champion_stats', 'import'].map(tab => {
                  const labels = { overview: 'Overview', champion_stats: 'Stats por campeon', import: 'Importar builds' };
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding: '10px 16px', background: 'none', border: 'none',
                        borderBottom: `2px solid ${activeTab === tab ? 'var(--rp-gold)' : 'transparent'}`,
                        color: activeTab === tab ? 'var(--rp-gold)' : 'var(--rp-text-muted)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s',
                        marginBottom: -1 }}>
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Tab content ── */}
            {activeTab === 'overview' && (
              <>
                {/* Stats bar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                  {/* Rank tile */}
                  <div style={{ flex: 1, background: 'var(--rp-card)', border: '1px solid var(--rp-border)',
                    borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RankedEmblem tier={tier} size={88} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: tierColor }}>
                        {tier !== 'UNRANKED' ? `${tier} ${division}` : 'Sin clasificar'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--rp-text-muted)' }}>{lp} LP</div>
                    </div>
                  </div>

                  {/* WR donut */}
                  {recentWr !== null && (
                    <div style={{ flex: 1, background: 'var(--rp-card)', border: '1px solid var(--rp-border)',
                      borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <WRDonut wr={recentWr} size={64} />
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--rp-text)' }}>{recentWr}% WR</div>
                        <div style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>Últ. {Math.min(allGames.length, 20)} partidas</div>
                        <div style={{ fontSize: 11, color: 'var(--rp-text-sub)' }}>{wins}V · {losses}D</div>
                      </div>
                    </div>
                  )}

                  {/* KDA */}
                  {recentKda && (
                    <div style={{ flex: 1, background: 'var(--rp-card)', border: '1px solid var(--rp-border)',
                      borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--rp-text)' }}>{recentKda.kda} KDA</div>
                      <div style={{ fontSize: 12, color: 'var(--rp-text-muted)', marginTop: 2 }}>
                        {recentKda.k} / <span style={{ color: '#e84057' }}>{recentKda.d}</span> / {recentKda.a}
                      </div>
                    </div>
                  )}
                </div>

                {/* Match filter */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[['all','Todas'],['ranked','Ranked Solo'],['flex','Flex'],['normal','Normal'],['aram','ARAM']].map(([v, l]) => (
                    <button key={v} onClick={() => setMatchFilter(v)}
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s', border: '1px solid',
                        background: matchFilter === v ? 'var(--rp-burgundy-dim)' : 'var(--rp-surface)',
                        borderColor: matchFilter === v ? 'var(--rp-burgundy-light)' : 'var(--rp-border)',
                        color: matchFilter === v ? 'var(--rp-burgundy-light)' : 'var(--rp-text-muted)' }}>
                      {l}
                    </button>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--rp-text-sub)', marginLeft: 4 }}>
                    {filteredGames.length} partidas
                  </span>
                </div>

                {/* Match list */}
                <div>
                  {filteredGames.length === 0
                    ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--rp-text-muted)', fontSize: 13 }}>Sin partidas.</div>
                    : filteredGames.slice(0, 20).map(g => (
                        <MatchRow key={g.gameId} game={g} ddVersion={ddVersion}
                          expanded={expandedGame === g.gameId}
                          onToggle={() => setExpandedGame(expandedGame === g.gameId ? null : g.gameId)} />
                      ))}
                </div>
              </>
            )}

            {activeTab === 'champion_stats' && (
              <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
                  color: 'var(--rp-text-muted)', marginBottom: 12 }}>Stats por campeón</div>
                {championStats.length === 0
                  ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--rp-text-muted)' }}>Sin datos de historial.</div>
                  : championStats.map(c => (
                      <ChampStatRow key={c.championId} champ={c} ddVersion={ddVersion} onClick={() => {}} />
                    ))}
              </div>
            )}

            {activeTab === 'import' && (
              <ImportBuildsSection ddVersion={ddVersion} lcuConnected={connected} />
            )}
          </>
        ) : (
          <div className="home-no-lcu">
            <h3>No se encontraron datos</h3>
            <p>Comprueba que el cliente de LoL ha terminado de cargar.</p>
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12,
        position: 'sticky', top: 70 }}>

        {/* Ranking Statistics */}
        {tier !== 'UNRANKED' && (
          <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
              color: 'var(--rp-text-muted)', marginBottom: 12 }}>Estadísticas de rango</div>
            <RankChart tier={tier} division={division}
              lpHistory={allGames.slice(0, 10)
                .map(g => {
                  const lp = simulateLpChange(g.gameId, g.participants?.[0]?.stats?.win, g.queueId);
                  return lp !== null ? { lp, date: g.gameCreation ?? null } : null;
                })
                .filter(Boolean)} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              {['S23','S24','2025'].map((y, i) => (
                <span key={i} style={{ color: 'var(--rp-text-sub)' }}>{y}</span>
              ))}
            </div>
          </div>
        )}

        {/* LP trend this session */}
        {allGames.length > 0 && (
          <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
              color: 'var(--rp-text-muted)', marginBottom: 10 }}>LP recientes (Ranked)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {allGames.slice(0, 8).map(g => {
                const lp = simulateLpChange(g.gameId, g.participants?.[0]?.stats?.win, g.queueId);
                if (lp === null) return null;
                const win = g.participants?.[0]?.stats?.win;
                return (
                  <div key={g.gameId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, flexShrink: 0,
                      background: win ? '#3a9f5f' : '#e84057' }} />
                    <span style={{ fontSize: 11, color: 'var(--rp-text-muted)', flex: 1 }}>
                      {QUEUE_NAMES[g.queueId] ?? 'Ranked'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: lp >= 0 ? '#3a9f5f' : '#e84057' }}>
                      {lp >= 0 ? '+' : ''}{lp} LP
                    </span>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {/* Champion Stats (top 4) */}
        {championStats.length > 0 && (
          <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
              color: 'var(--rp-text-muted)', marginBottom: 10 }}>Mejores campeones</div>
            {championStats.slice(0, 4).map(c => (
              <ChampStatRow key={c.championId} champ={c} ddVersion={ddVersion} onClick={() => setActiveTab('champion_stats')} />
            ))}
            {championStats.length > 4 && (
              <button onClick={() => setActiveTab('champion_stats')}
                style={{ width: '100%', marginTop: 8, padding: '6px', background: 'none',
                  border: '1px solid var(--rp-border)', borderRadius: 6, color: 'var(--rp-text-muted)',
                  fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.color = 'var(--rp-text)'; e.target.style.borderColor = 'var(--rp-text-muted)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--rp-text-muted)'; e.target.style.borderColor = 'var(--rp-border)'; }}>
                Ver todos ({championStats.length})
              </button>
            )}
          </div>
        )}

        {/* Quick import */}
        <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
            color: 'var(--rp-text-muted)', marginBottom: 10 }}>Build recomendada</div>
          <div style={{ fontSize: 12, color: 'var(--rp-text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            Importa las runas y builds de los mejores jugadores de KR, EUW, CN y NA directamente al cliente.
          </div>
          <button onClick={() => setActiveTab('import')}
            style={{ width: '100%', padding: '8px', background: 'var(--rp-burgundy)',
              border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}>
            Ir a importar builds
          </button>
        </div>
      </div>
    </div>
  );
}
