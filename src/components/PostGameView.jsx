/**
 * PostGameView — Post-Match Analysis Dashboard
 *
 * Three tabs:
 *  Resumen  — scorecards, performance bars vs elo/history, insights
 *  Timeline — interactive SVG event timeline
 *  Equipo   — full 5v5 team comparison table
 *
 * Props:
 *  eogData    — raw LCU EOG stats block (or null = use liveGameData events)
 *  liveEvents — accumulated live_game_events[]
 *  playerData — { ranked, summoner } from App.jsx
 *  ddVersion  — DataDragon version
 *  role       — player's assigned role
 *  onClose    — dismiss handler
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  parseFullEOG, compareVsElo, compareVsHistory,
  buildHistoryAvg, generateInsights, detectErrors,
  calcPerformanceScore,
} from '../services/postGameAnalyzer';
import { getChampionIconByKey, getRankedEmblemUrl } from '../services/datadragon';

/* ══════════════════════════════════════════════
   Constants
══════════════════════════════════════════════ */
const TIER_COLORS = {
  IRON:'#8d7154', BRONZE:'#a0522d', SILVER:'#8fa8b0', GOLD:'#c89b3c',
  PLATINUM:'#3fa58a', EMERALD:'#3fa565', DIAMOND:'#4fa8e0',
  MASTER:'#9550c0', GRANDMASTER:'#cf3f3f', CHALLENGER:'#f4c874',
};

const SEVERITY_META = {
  strength: { color: '#52b788', bg: '#52b78815', icon: '↑', label: 'Fortaleza' },
  warning:  { color: '#f59e0b', bg: '#f59e0b15', icon: '⚠', label: 'Atención' },
  error:    { color: '#ef4444', bg: '#ef444415', icon: '✕', label: 'Error' },
};

const EVENT_META = {
  ChampionKill:  { icon: '⚔', color: '#ef4444', label: 'Kill' },
  ChampionKill_assist: { icon: '💠', color: '#60a5fa', label: 'Asistencia' },
  DragonKill:    { icon: '🐉', color: '#f59e0b', label: 'Dragón' },
  BaronKill:     { icon: '🟣', color: '#a855f7', label: 'Barón' },
  HeraldKill:    { icon: '👁', color: '#6b7280', label: 'Heraldo' },
  TurretKilled:  { icon: '🏰', color: '#78716c', label: 'Torre' },
  InhibitorKilled:{ icon: '💥', color: '#dc2626', label: 'Inhibidor' },
  FirstBlood:    { icon: '🩸', color: '#ef4444', label: 'First Blood' },
  Ace:           { icon: '⭐', color: '#f59e0b', label: 'Ace' },
  GameStart:     { icon: '▶', color: '#52b788', label: 'Inicio' },
};

/* ══════════════════════════════════════════════
   Shared primitives
══════════════════════════════════════════════ */

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function StatValue({ value, label, color, sub }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 64 }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: color || 'var(--rp-text)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: color || 'var(--rp-text)', opacity: 0.7 }}>{sub}</div>}
      <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', marginTop: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

/** Horizontal comparison bar: player vs benchmark */
function CompBar({ label, actual, expected, pct, rating, unit = '', invert = false }) {
  const RATING_COLORS = {
    excellent: '#52b788', good: '#86efac', average: 'var(--rp-text-muted)',
    below: '#f59e0b', poor: '#ef4444',
  };
  const color = RATING_COLORS[rating] || 'var(--rp-text-muted)';
  const fillPct = Math.min(100, Math.max(0, 50 + (pct || 0) / 2)); // 0-100 scale centered at 50%

  const sign = pct > 0 ? '+' : '';
  const dispPct = `${sign}${(pct || 0).toFixed(1)}%`;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--rp-text)', fontWeight: 600 }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color }}>
            {typeof actual === 'number' ? actual.toFixed(actual < 10 ? 2 : 0) : actual}{unit}
          </span>
          <span style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>
            vs {typeof expected === 'number' ? expected.toFixed(expected < 10 ? 2 : 0) : expected}{unit} elo
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color }}>{dispPct}</span>
        </div>
      </div>
      {/* Track */}
      <div style={{ height: 5, borderRadius: 3, background: 'var(--rp-border)', overflow: 'hidden', position: 'relative' }}>
        {/* Center marker */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--rp-text-muted)', opacity: 0.4, zIndex: 1 }} />
        <div style={{
          height: '100%', borderRadius: 3, background: color,
          width: `${fillPct}%`, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

/** Score ring */
function ScoreRing({ score, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? '#52b788' : score >= 55 ? '#f59e0b' : score >= 40 ? '#60a5fa' : '#ef4444';
  const label = score >= 80 ? 'S+' : score >= 70 ? 'S' : score >= 60 ? 'A' : score >= 50 ? 'B' : score >= 40 ? 'C' : 'D';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rp-border)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 900, color, lineHeight: 1 }}>{label}</span>
        <span style={{ fontSize: size * 0.14, color: 'var(--rp-text-muted)' }}>{score}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Tab: RESUMEN
══════════════════════════════════════════════ */

function TabResumen({ result, vsElo, vsHistory, insights, errors, performanceScore }) {
  const { localPlayer: p, gameId, durationSecs } = result;
  const win = p.win;
  const winColor = win ? '#52b788' : '#ef4444';

  const kdaColor = p.kda >= 5 ? '#52b788' : p.kda >= 3 ? 'var(--rp-gold)' : p.kda >= 2 ? 'var(--rp-text)' : '#ef4444';

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'auto', padding: '16px' }}>

      {/* Left: scorecards + performance score */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Result header */}
        <div style={{ padding: '12px 14px', borderRadius: 8,
          background: win ? '#52b78812' : '#ef444412',
          border: `1px solid ${winColor}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: winColor }}>
              {win ? 'VICTORIA' : 'DERROTA'}
            </span>
            <ScoreRing score={performanceScore} size={52} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--rp-text-muted)' }}>
            {formatTime(durationSecs)} · {p.championName}
          </div>
        </div>

        {/* Primary stats */}
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid var(--rp-border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 10, textTransform: 'uppercase' }}>
            Estadísticas
          </div>

          {/* KDA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: kdaColor }}>{p.kills}</span>
            <span style={{ color: 'var(--rp-text-muted)', fontWeight: 300 }}>/</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>{p.deaths}</span>
            <span style={{ color: 'var(--rp-text-muted)', fontWeight: 300 }}>/</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#60a5fa' }}>{p.assists}</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: kdaColor, marginBottom: 12 }}>
            {p.kda} KDA
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatValue value={p.csPerMin.toFixed(1)} label="CS/min" sub={`${p.cs} total`} />
            <StatValue value={p.goldPerMin} label="Gold/min" sub={`${(p.gold/1000).toFixed(1)}k`} />
            <StatValue value={p.visionScore} label="Visión" sub={`${p.wardsPlaced}W / ${p.wardsKilled}D`} />
            <StatValue
              value={`${Math.round((p.damageShare || 0) * 100)}%`}
              label="Daño equipo"
              color={p.damageShare >= 0.3 ? '#52b788' : undefined}
            />
          </div>
        </div>

        {/* Damage breakdown */}
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid var(--rp-border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Distribución de daño</div>
          <div style={{ marginBottom: 4, fontSize: 11, color: 'var(--rp-text)' }}>
            Total: <b>{(p.damage / 1000).toFixed(1)}k</b> · Recibido: <b>{(p.damageTaken / 1000).toFixed(1)}k</b>
          </div>
          {[
            { label: 'Físico', val: p.adDmg, color: '#f59e0b' },
            { label: 'Mágico', val: p.apDmg, color: '#60a5fa' },
            { label: 'Verdadero', val: p.trueDmg, color: '#e2e8f0' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color }}>{(val / 1000).toFixed(1)}k</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--rp-border)' }}>
                <div style={{ height: '100%', borderRadius: 2, background: color,
                  width: `${p.damage > 0 ? (val / p.damage * 100) : 0}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}

          {/* Multi-kills */}
          {(p.pentaKills + p.quadraKills + p.tripleKills + p.doubleKills) > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              {p.pentaKills > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#f59e0b22', color: '#f59e0b', fontWeight: 700, border: '1px solid #f59e0b44' }}>PENTA ×{p.pentaKills}</span>}
              {p.quadraKills > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#a855f722', color: '#a855f7', fontWeight: 700, border: '1px solid #a855f744' }}>QUADRA ×{p.quadraKills}</span>}
              {p.tripleKills > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#60a5fa22', color: '#60a5fa', fontWeight: 700, border: '1px solid #60a5fa44' }}>TRIPLE ×{p.tripleKills}</span>}
              {p.doubleKills > 0 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#52b78822', color: '#52b788', fontWeight: 700, border: '1px solid #52b78844' }}>DOBLE ×{p.doubleKills}</span>}
              {p.firstBlood && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#ef444422', color: '#ef4444', fontWeight: 700, border: '1px solid #ef444444' }}>🩸 1st Blood</span>}
            </div>
          )}
        </div>
      </div>

      {/* Center: comparison bars */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* vs Elo Average */}
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid var(--rp-border)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 12, textTransform: 'uppercase' }}>
            vs Promedio del Elo
          </div>
          {vsElo.kda && (
            <CompBar label="KDA" actual={p.kda} expected={vsElo.kda.expected} pct={vsElo.kda.pct} rating={vsElo.kda.rating} />
          )}
          {vsElo.csPerMin && (
            <CompBar label="CS/min" actual={p.csPerMin} expected={vsElo.csPerMin.expected} pct={vsElo.csPerMin.pct} rating={vsElo.csPerMin.rating} />
          )}
          {vsElo.visionPerMin && (
            <CompBar label="Visión/min" actual={p.visionPerMin} expected={vsElo.visionPerMin.expected} pct={vsElo.visionPerMin.pct} rating={vsElo.visionPerMin.rating} />
          )}
          {vsElo.goldPerMin && (
            <CompBar label="Gold/min" actual={p.goldPerMin} expected={vsElo.goldPerMin.expected} pct={vsElo.goldPerMin.pct} rating={vsElo.goldPerMin.rating} unit="" />
          )}
          {vsElo.killParticipation && (
            <CompBar label="Kill Participation" actual={Math.round(p.killParticipation * 100)} expected={Math.round(vsElo.killParticipation.expected * 100)} pct={vsElo.killParticipation.pct} rating={vsElo.killParticipation.rating} unit="%" />
          )}
          {vsElo.damageShare && (
            <CompBar label="Daño en equipo" actual={Math.round(p.damageShare * 100)} expected={Math.round(vsElo.damageShare.expected * 100)} pct={vsElo.damageShare.pct} rating={vsElo.damageShare.rating} unit="%" />
          )}
        </div>

        {/* vs Personal History */}
        {vsHistory && (
          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid var(--rp-border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 12, textTransform: 'uppercase' }}>
              vs Tu Historial Personal
            </div>
            {vsHistory.kda && <CompBar label="KDA" actual={p.kda} expected={vsHistory.kda.expected} pct={vsHistory.kda.pct} rating={vsHistory.kda.rating} />}
            {vsHistory.csPerMin && <CompBar label="CS/min" actual={p.csPerMin} expected={vsHistory.csPerMin.expected} pct={vsHistory.csPerMin.pct} rating={vsHistory.csPerMin.rating} />}
            {vsHistory.damage && <CompBar label="Daño total" actual={p.damage} expected={vsHistory.damage.expected} pct={vsHistory.damage.pct} rating={vsHistory.damage.rating} />}
          </div>
        )}
      </div>

      {/* Right: insights + errors */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Auto-insights */}
        <div style={{ flex: 1, padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid var(--rp-border)', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 10, textTransform: 'uppercase' }}>
            Insights Automáticos
          </div>
          {insights.slice(0, 7).map((ins, i) => {
            const m = SEVERITY_META[ins.severity] || SEVERITY_META.warning;
            return (
              <div key={i} style={{ marginBottom: 7, padding: '6px 8px', borderRadius: 5,
                background: m.bg, border: `1px solid ${m.color}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: m.color, fontWeight: 700 }}>{m.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.color, letterSpacing: '0.3px' }}>
                    {ins.title}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', lineHeight: 1.4 }}>
                  {ins.body}
                </div>
              </div>
            );
          })}
        </div>

        {/* Key errors */}
        {errors.length > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--rp-card)', border: '1px solid #ef444433' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.8px', marginBottom: 10, textTransform: 'uppercase' }}>
              Errores Detectados
            </div>
            {errors.slice(0, 4).map((err, i) => (
              <div key={i} style={{ marginBottom: 8, paddingBottom: 8,
                borderBottom: i < errors.length - 1 ? '1px solid var(--rp-border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 3 }}>
                  <span style={{ fontSize: 8, color: err.severity === 'critical' ? '#ef4444' : '#f59e0b',
                    fontWeight: 800, letterSpacing: '0.5px', flexShrink: 0, marginTop: 1 }}>
                    {err.severity === 'critical' ? 'CRIT' : err.severity === 'major' ? 'MAJ' : 'MIN'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text)', lineHeight: 1.3 }}>
                    {err.title}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: '#f59e0b', lineHeight: 1.4, paddingLeft: 28 }}>
                  💡 {err.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Tab: TIMELINE
══════════════════════════════════════════════ */

function TabTimeline({ events, durationSecs, summonerName }) {
  const [hovered, setHovered] = useState(null);

  const relevantEvents = useMemo(() => {
    if (!events?.length) return [];
    return events
      .filter((e) => EVENT_META[e.EventName] || e.EventName.includes('Kill'))
      .sort((a, b) => a.EventTime - b.EventTime)
      .map((e, idx) => {
        // Determine if player-related
        const isPlayer  = e.KillerName === summonerName || e.Assisters?.includes(summonerName);
        const isDeath    = e.VictimName === summonerName;
        const isDragon   = e.EventName === 'DragonKill';
        const isBaron    = e.EventName === 'BaronKill';
        const isObjective = isDragon || isBaron || e.EventName === 'HeraldKill';
        return { ...e, idx, isPlayer, isDeath, isObjective };
      });
  }, [events, summonerName]);

  const W = 900;
  const H = 160;
  const PAD = { x: 40, y: 30 };
  const trackY = H / 2;
  const dur    = durationSecs || 1800;

  // Group events into player timeline and objective timeline
  const playerEvents = relevantEvents.filter((e) => e.isPlayer || e.isDeath);
  const objEvents    = relevantEvents.filter((e) => e.isObjective);

  const xOf = (t) => PAD.x + ((t / dur) * (W - PAD.x * 2));

  // Time tick marks every 5 minutes
  const ticks = [];
  for (let t = 0; t <= dur; t += 300) ticks.push(t);

  if (!relevantEvents.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--rp-text-muted)', fontSize: 14 }}>
        Sin datos de timeline disponibles — activa el cliente antes de la partida.
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.8px', marginBottom: 12, textTransform: 'uppercase' }}>
        Timeline de la Partida
      </div>

      {/* Main SVG */}
      <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" style={{ display: 'block', maxHeight: 200 }}>
          {/* Grid lines */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={xOf(t)} y1={PAD.y} x2={xOf(t)} y2={H} stroke="var(--rp-border)" strokeWidth={0.5} />
              <text x={xOf(t)} y={H + 14} textAnchor="middle" fontSize={9} fill="var(--rp-text-muted)">
                {t / 60}'
              </text>
            </g>
          ))}

          {/* Main axis line */}
          <line x1={PAD.x} y1={trackY} x2={W - PAD.x} y2={trackY} stroke="var(--rp-border)" strokeWidth={1} />

          {/* Phase zones: early/mid/late */}
          <rect x={PAD.x} y={PAD.y} width={xOf(600) - PAD.x} height={H - PAD.y} fill="#52b78806" rx={3} />
          <rect x={xOf(600)} y={PAD.y} width={xOf(1500) - xOf(600)} height={H - PAD.y} fill="#f59e0b06" rx={3} />
          <rect x={xOf(1500)} y={PAD.y} width={W - PAD.x - xOf(1500)} height={H - PAD.y} fill="#ef444406" rx={3} />
          <text x={PAD.x + 6} y={PAD.y + 12} fontSize={8} fill="#52b78866">Early</text>
          <text x={xOf(600) + 6} y={PAD.y + 12} fontSize={8} fill="#f59e0b66">Mid</text>
          <text x={xOf(1500) + 6} y={PAD.y + 12} fontSize={8} fill="#ef444466">Late</text>

          {/* Objective events (below axis) */}
          {objEvents.map((e) => {
            const x = xOf(e.EventTime);
            const meta = EVENT_META[e.EventName] || {};
            return (
              <g key={e.EventID}
                onMouseEnter={() => setHovered(e)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <line x1={x} y1={trackY} x2={x} y2={trackY + 20} stroke={meta.color} strokeWidth={1.5} />
                <circle cx={x} cy={trackY + 25} r={7} fill={meta.color + '33'} stroke={meta.color} strokeWidth={1.5} />
                <text x={x} y={trackY + 29} textAnchor="middle" fontSize={7} fill={meta.color}>{meta.icon}</text>
              </g>
            );
          })}

          {/* Player kill/death events (above axis) */}
          {playerEvents.map((e) => {
            const x = xOf(e.EventTime);
            const isD = e.isDeath;
            const color = isD ? '#ef4444' : '#52b788';
            const icon  = isD ? '💀' : '⚔';
            return (
              <g key={e.EventID + '_p'}
                onMouseEnter={() => setHovered(e)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <line x1={x} y1={trackY} x2={x} y2={trackY - 22} stroke={color} strokeWidth={1.5} strokeDasharray={isD ? '3,2' : 'none'} />
                <circle cx={x} cy={trackY - 27} r={8} fill={color + '22'} stroke={color} strokeWidth={1.5} />
                <text x={x} y={trackY - 23} textAnchor="middle" fontSize={8} fill={color}>{icon}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered event detail */}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--rp-card)',
              border: '1px solid var(--rp-border)', marginBottom: 12, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--rp-text)' }}>
              {EVENT_META[hovered.EventName]?.icon} {EVENT_META[hovered.EventName]?.label || hovered.EventName}
            </span>
            <span style={{ color: 'var(--rp-text-muted)', marginLeft: 10 }}>
              {formatTime(hovered.EventTime)}
            </span>
            {hovered.KillerName && <span style={{ color: '#52b788', marginLeft: 8 }}>→ {hovered.KillerName}</span>}
            {hovered.VictimName && <span style={{ color: '#ef4444', marginLeft: 8 }}>✕ {hovered.VictimName}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(EVENT_META).slice(0, 7).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>{meta.icon}</span>
            <span style={{ fontSize: 10, color: meta.color }}>{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Tab: EQUIPO
══════════════════════════════════════════════ */

function TeamTable({ players, title, accentColor, localSummonerName }) {
  const cols = [
    { key: 'championName', label: 'Campeón', w: 110 },
    { key: 'kills',        label: 'K',        w: 36 },
    { key: 'deaths',       label: 'D',        w: 36 },
    { key: 'assists',      label: 'A',        w: 36 },
    { key: 'kda',          label: 'KDA',      w: 52 },
    { key: 'cs',           label: 'CS',       w: 44 },
    { key: 'csPerMin',     label: 'CS/m',     w: 50 },
    { key: 'damage',       label: 'Daño',     w: 64, fmt: (v) => `${(v/1000).toFixed(1)}k` },
    { key: 'damageShare',  label: 'Dmg%',     w: 52, fmt: (v) => v !== null ? `${Math.round(v*100)}%` : '—' },
    { key: 'visionScore',  label: 'Visión',   w: 50 },
    { key: 'gold',         label: 'Gold',     w: 56, fmt: (v) => `${(v/1000).toFixed(1)}k` },
  ];

  // Sort by damage descending
  const sorted = [...players].sort((a, b) => b.damage - a.damage);
  const maxDmg = sorted[0]?.damage || 1;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: accentColor, letterSpacing: '0.8px',
        textTransform: 'uppercase', marginBottom: 6, padding: '0 4px' }}>
        {title}
      </div>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${accentColor}33` }}>
        {/* Header */}
        <div style={{ display: 'flex', background: accentColor + '15', borderBottom: `1px solid ${accentColor}22` }}>
          {cols.map((c) => (
            <div key={c.key} style={{ width: c.w, flexShrink: 0, padding: '5px 6px',
              fontSize: 9, fontWeight: 700, color: 'var(--rp-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {c.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        {sorted.map((p, i) => {
          const isLocal = p.isLocalPlayer || p.summonerName === localSummonerName;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center',
              background: isLocal ? accentColor + '10' : i % 2 === 0 ? 'transparent' : 'var(--rp-surface)',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--rp-border)' : 'none',
              borderLeft: isLocal ? `2px solid ${accentColor}` : '2px solid transparent' }}>
              {cols.map((c) => {
                const raw = p[c.key];
                const val = c.fmt ? c.fmt(raw) : typeof raw === 'number' ? raw.toFixed(raw < 10 ? 2 : 0) : raw;
                const isChamp = c.key === 'championName';
                const isDeath = c.key === 'deaths';
                const isKDA   = c.key === 'kda';
                return (
                  <div key={c.key} style={{ width: c.w, flexShrink: 0, padding: '6px 6px',
                    fontSize: isChamp ? 11 : 12,
                    fontWeight: isChamp || isLocal ? 700 : 500,
                    color: isKDA ? (p.kda >= 3 ? '#52b788' : p.kda >= 2 ? 'var(--rp-gold)' : 'var(--rp-text)')
                      : isDeath ? '#ef4444'
                      : c.key === 'damage' ? (p.damage === maxDmg ? '#f59e0b' : 'var(--rp-text)')
                      : 'var(--rp-text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {val}
                    {isLocal && isChamp && <span style={{ marginLeft: 5, fontSize: 9, color: accentColor }}>★ TÚ</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabEquipo({ result }) {
  const { myTeam, enemyTeam, localPlayer } = result;
  const winTeam  = localPlayer.win ? myTeam : enemyTeam;
  const loseTeam = localPlayer.win ? enemyTeam : myTeam;

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>
      <TeamTable players={winTeam}  title="Equipo Ganador"  accentColor="#52b788" localSummonerName={localPlayer.summonerName} />
      <TeamTable players={loseTeam} title="Equipo Perdedor" accentColor="#ef4444" localSummonerName={localPlayer.summonerName} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */

export default function PostGameView({ eogData, liveEvents = [], playerData, ddVersion, role, onClose }) {
  const [activeTab, setActiveTab] = useState('resumen');

  const result = useMemo(() => parseFullEOG(eogData), [eogData]);

  const { ranked } = playerData || {};
  const tier = ranked?.queues?.find?.(q => q.queueType === 'RANKED_SOLO_5x5')?.tier
    || ranked?.tier || 'GOLD';
  const tierColor = TIER_COLORS[tier?.toUpperCase()] || 'var(--rp-gold)';

  const histAvg = useMemo(() =>
    buildHistoryAvg(playerData?.history?.games?.games, playerData?.summoner?.puuid),
    [playerData]
  );

  const { localPlayer } = result || {};

  const vsElo     = useMemo(() => localPlayer ? compareVsElo(localPlayer, tier, role || 'MID') : {}, [localPlayer, tier, role]);
  const vsHistory = useMemo(() => localPlayer && histAvg ? compareVsHistory(localPlayer, histAvg) : null, [localPlayer, histAvg]);
  const insights  = useMemo(() => localPlayer ? generateInsights(localPlayer, vsElo, vsHistory, liveEvents) : [], [localPlayer, vsElo, vsHistory, liveEvents]);
  const errors    = useMemo(() => localPlayer ? detectErrors(localPlayer, liveEvents, vsElo) : [], [localPlayer, liveEvents, vsElo]);
  const score     = useMemo(() => localPlayer ? calcPerformanceScore(localPlayer, vsElo) : 50, [localPlayer, vsElo]);

  if (!result) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>📊</div>
        <div style={{ fontSize: 14, color: 'var(--rp-text-muted)' }}>Cargando análisis post-partida...</div>
      </div>
    );
  }

  const tabDef = [
    { id: 'resumen',  label: '📊 Resumen'  },
    { id: 'timeline', label: '⏱ Timeline' },
    { id: 'equipo',   label: '👥 Equipo'  },
  ];

  const winColor = localPlayer.win ? '#52b788' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, flexShrink: 0,
        background: localPlayer.win ? '#52b78810' : '#ef444410',
        borderBottom: `1px solid ${winColor}33`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: winColor, letterSpacing: '1px' }}>
            {localPlayer.win ? '▲ VICTORIA' : '▼ DERROTA'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--rp-text-muted)' }}>
            {localPlayer.championName} · {formatTime(result.durationSecs)}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
            background: tierColor + '22', color: tierColor, border: `1px solid ${tierColor}44` }}>
            {tier}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {tabDef.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: activeTab === id ? 700 : 500,
              background: activeTab === id ? 'var(--rp-card)' : 'transparent',
              color: activeTab === id ? 'var(--rp-text)' : 'var(--rp-text-muted)',
              position: 'relative', transition: 'all 0.15s',
            }}>
              {label}
              {activeTab === id && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: winColor, borderRadius: '1px 1px 0 0' }} />
              )}
            </button>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'transparent',
          border: '1px solid var(--rp-border)', color: 'var(--rp-text-muted)',
          cursor: 'pointer', fontSize: 14,
        }}>✕</button>
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'resumen' && (
            <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} style={{ height: '100%' }}>
              <TabResumen result={result} vsElo={vsElo} vsHistory={vsHistory}
                insights={insights} errors={errors} performanceScore={score} />
            </motion.div>
          )}
          {activeTab === 'timeline' && (
            <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} style={{ height: '100%' }}>
              <TabTimeline events={liveEvents} durationSecs={result.durationSecs}
                summonerName={localPlayer.summonerName} />
            </motion.div>
          )}
          {activeTab === 'equipo' && (
            <motion.div key="eq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} style={{ height: '100%' }}>
              <TabEquipo result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
