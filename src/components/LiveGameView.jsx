/**
 * LiveGameView — In-Game Real-Time Overlay
 *
 * Displays live game data from the Live Client Data API (port 2999):
 *  - Scoreboard with KDA, CS, gold, items for all 10 players
 *  - Active player detailed stats (level, abilities, XP)
 *  - Game clock and recent events ticker
 *  - Team gold graph and objective tracking
 *
 * Props:
 *  liveGameData  — snapshot from live_game_update (allgamedata)
 *  liveEvents    — accumulated events from live_game_events
 *  playerData    — { summoner } for identifying local player
 *  ddVersion     — DataDragon version for icons
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getItemImageUrl, getChampionImageUrl } from '../services/datadragon';

/* ══════════════════════════════════════════════
   Constants & helpers
══════════════════════════════════════════════ */

const DRAGON_COLORS = {
  Fire:    '#ef4444',
  Water:   '#60a5fa',
  Earth:   '#92400e',
  Air:     '#a3e635',
  Hextech: '#818cf8',
  Chemtech:'#84cc16',
  Cloud:   '#e2e8f0',
  Ocean:   '#22d3ee',
  Infernal:'#f97316',
  Mountain:'#a8a29e',
  Elder:   '#f59e0b',
};

const EVENT_ICONS = {
  ChampionKill:    { icon: '⚔', color: '#ef4444' },
  DragonKill:      { icon: '🐉', color: '#f59e0b' },
  BaronKill:       { icon: '🟣', color: '#a855f7' },
  HeraldKill:      { icon: '👁', color: '#6b7280' },
  TurretKilled:    { icon: '🏰', color: '#94a3b8' },
  InhibitorKilled: { icon: '💥', color: '#ef4444' },
  GameStart:       { icon: '▶', color: '#52b788'  },
  FirstBlood:      { icon: '🩸', color: '#ef4444' },
  Ace:             { icon: '⭐', color: '#f59e0b' },
};

function formatTime(secs) {
  if (!secs && secs !== 0) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatGold(g) {
  if (!g && g !== 0) return '0';
  if (g >= 1000) return `${(g / 1000).toFixed(1)}k`;
  return String(Math.round(g));
}

function kda(kills = 0, deaths = 0, assists = 0) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */

/** Champion portrait with level badge */
function ChampPortrait({ name, level, ddVersion, size = 40, isLocal = false }) {
  const [failed, setFailed] = useState(false);
  // Live Client uses champion names like "Ahri", "Orianna", etc.
  const ddKey = name?.replace(/[^a-zA-Z0-9]/g, '') || '';
  const src = ddKey && ddVersion && !failed
    ? getChampionImageUrl(ddKey, ddVersion)
    : null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {src
        ? <img src={src} alt={name} width={size} height={size}
            style={{ borderRadius: 6, objectFit: 'cover', border: isLocal ? '2px solid var(--rp-gold)' : '1px solid var(--rp-border)' }}
            onError={() => setFailed(true)} />
        : <div style={{ width: size, height: size, borderRadius: 6, background: 'var(--rp-surface)',
            border: isLocal ? '2px solid var(--rp-gold)' : '1px solid var(--rp-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35,
            color: 'var(--rp-text-muted)', fontWeight: 700 }}>
            {name?.[0] || '?'}
          </div>
      }
      {level != null && (
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          background: isLocal ? 'var(--rp-gold)' : 'var(--rp-bg)',
          border: '1px solid var(--rp-border)',
          borderRadius: 4, fontSize: 9, fontWeight: 800,
          color: isLocal ? 'var(--rp-bg)' : 'var(--rp-text)',
          padding: '0 3px', lineHeight: '14px', minWidth: 14, textAlign: 'center',
        }}>{level}</div>
      )}
    </div>
  );
}

/** Item grid (6 slots) */
function ItemRow({ items = [], ddVersion }) {
  const slots = Array(6).fill(null);
  (items || []).forEach((item, i) => { if (i < 6) slots[i] = item; });

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {slots.map((item, i) => {
        const id = item?.itemID || item?.id;
        const [failed, setFailed] = useState(false);
        const src = id && ddVersion && !failed ? getItemImageUrl(id, ddVersion) : null;
        return (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 3,
            background: 'var(--rp-surface)',
            border: '1px solid var(--rp-border)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {src && (
              <img src={src} alt="" width={22} height={22}
                style={{ objectFit: 'cover', display: 'block' }}
                onError={() => setFailed(true)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Single player row in scoreboard */
function PlayerRow({ player, isLocal, ddVersion, rank }) {
  const scores = player.scores || {};
  const kills   = scores.kills   ?? 0;
  const deaths  = scores.deaths  ?? 0;
  const assists = scores.assists ?? 0;
  const cs      = scores.creepScore ?? 0;
  const gold    = player.currentGold ?? 0;
  const level   = player.level ?? 1;
  const kdaStr  = kda(kills, deaths, assists);

  const kdaColor = deaths === 0 ? '#c89b3c'
    : parseFloat(kdaStr) >= 4 ? '#52b788'
    : parseFloat(kdaStr) >= 2 ? 'var(--rp-text)'
    : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px',
        borderBottom: '1px solid var(--rp-border)',
        background: isLocal ? 'var(--rp-gold)0d' : 'transparent',
        borderLeft: isLocal ? '2px solid var(--rp-gold)' : '2px solid transparent',
      }}
    >
      {/* Champion portrait */}
      <ChampPortrait
        name={player.championName}
        level={level}
        ddVersion={ddVersion}
        size={32}
        isLocal={isLocal}
      />

      {/* Summoner name */}
      <div style={{ width: 120, minWidth: 80, overflow: 'hidden' }}>
        <div style={{
          fontSize: 12, fontWeight: isLocal ? 700 : 500,
          color: isLocal ? 'var(--rp-gold)' : 'var(--rp-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player.summonerName}
        </div>
        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>
          {player.position || '—'}
        </div>
      </div>

      {/* KDA */}
      <div style={{ width: 80, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)' }}>
          <span style={{ color: '#52b788' }}>{kills}</span>
          <span style={{ color: 'var(--rp-text-muted)', margin: '0 2px' }}>/</span>
          <span style={{ color: '#ef4444' }}>{deaths}</span>
          <span style={{ color: 'var(--rp-text-muted)', margin: '0 2px' }}>/</span>
          <span style={{ color: '#60a5fa' }}>{assists}</span>
        </div>
        <div style={{ fontSize: 9, color: kdaColor, fontWeight: 700 }}>
          {kdaStr} KDA
        </div>
      </div>

      {/* CS */}
      <div style={{ width: 44, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--rp-text)' }}>{cs}</div>
        <div style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>CS</div>
      </div>

      {/* Gold */}
      <div style={{ width: 44, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#c89b3c' }}>{formatGold(gold)}</div>
        <div style={{ fontSize: 9, color: 'var(--rp-text-muted)' }}>ORO</div>
      </div>

      {/* Items */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <ItemRow items={player.items} ddVersion={ddVersion} />
      </div>
    </motion.div>
  );
}

/** Team block (blue or red) */
function TeamBlock({ players = [], localName, ddVersion, isBlue }) {
  const teamColor = isBlue ? '#60a5fa' : '#f87171';
  const label = isBlue ? 'EQUIPO AZUL' : 'EQUIPO ROJO';

  const totals = players.reduce((acc, p) => {
    const s = p.scores || {};
    acc.kills   += s.kills   ?? 0;
    acc.deaths  += s.deaths  ?? 0;
    acc.assists += s.assists ?? 0;
    acc.gold    += p.currentGold ?? p.totalGold ?? 0;
    return acc;
  }, { kills: 0, deaths: 0, assists: 0, gold: 0 });

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Team header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px',
        background: teamColor + '18',
        borderBottom: `2px solid ${teamColor}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: teamColor, letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
          <span style={{ color: '#52b788', fontWeight: 700 }}>{totals.kills}K</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{totals.deaths}D</span>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>{totals.assists}A</span>
          <span style={{ color: '#c89b3c', fontWeight: 700 }}>{formatGold(totals.gold)}</span>
        </div>
      </div>

      {/* Players */}
      {players.map((p, i) => (
        <PlayerRow
          key={p.summonerName || i}
          player={p}
          isLocal={p.summonerName === localName || p.riotId === localName}
          ddVersion={ddVersion}
          rank={i}
        />
      ))}
    </div>
  );
}

/** Compact game clock + phase */
function GameClock({ gameTime }) {
  const secs = Math.floor(gameTime || 0);
  const phase = secs < 900 ? 'EARLY' : secs < 1800 ? 'MID' : 'LATE';
  const phaseColors = { EARLY: '#52b788', MID: '#f59e0b', LATE: '#ef4444' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--rp-text)', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(secs)}
      </div>
      <span style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '1px',
        padding: '2px 6px', borderRadius: 3,
        background: phaseColors[phase] + '22',
        color: phaseColors[phase],
        border: `1px solid ${phaseColors[phase]}44`,
      }}>{phase}</span>
    </div>
  );
}

/** Dragon soul tracker */
function DragonSoul({ dragonList = [] }) {
  if (!dragonList.length) return null;
  const last = dragonList[dragonList.length - 1];
  const color = DRAGON_COLORS[last] || '#f59e0b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 14 }}>🐉</span>
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>
        Alma {last}
      </span>
    </div>
  );
}

/** Recent events ticker (last 5) */
function EventTicker({ events = [] }) {
  const recent = useMemo(() => {
    return [...events].reverse().slice(0, 6);
  }, [events]);

  if (!recent.length) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      maxHeight: 140, overflow: 'hidden',
    }}>
      <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 2 }}>
        EVENTOS RECIENTES
      </div>
      <AnimatePresence mode="popLayout">
        {recent.map((evt, i) => {
          const meta = EVENT_ICONS[evt.EventName] || { icon: '•', color: 'var(--rp-text-muted)' };
          return (
            <motion.div
              key={evt.EventID || i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1 - i * 0.15, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
            >
              <span style={{ fontSize: 13 }}>{meta.icon}</span>
              <span style={{ color: meta.color, fontWeight: 600 }}>
                {evt.KillerName || evt.Assisters?.[0] || '—'}
              </span>
              {evt.VictimName && (
                <span style={{ color: 'var(--rp-text-muted)' }}>→ {evt.VictimName}</span>
              )}
              <span style={{ color: 'var(--rp-text-sub)', marginLeft: 'auto', fontSize: 10 }}>
                {formatTime(evt.EventTime)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Gold difference bar between teams */
function GoldBar({ blueGold, redGold }) {
  const total = blueGold + redGold;
  if (!total) return null;
  const bluePct = (blueGold / total) * 100;
  const diff = Math.abs(blueGold - redGold);
  const leader = blueGold >= redGold ? 'Azul' : 'Rojo';
  const leaderColor = blueGold >= redGold ? '#60a5fa' : '#f87171';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
        <span style={{ color: '#60a5fa', fontWeight: 700 }}>{formatGold(blueGold)}</span>
        <span style={{ color: leaderColor, fontWeight: 700, fontSize: 10 }}>
          {leader} +{formatGold(diff)}
        </span>
        <span style={{ color: '#f87171', fontWeight: 700 }}>{formatGold(redGold)}</span>
      </div>
      <div style={{ height: 6, background: '#f87171', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${bluePct}%`, background: '#60a5fa', borderRadius: '3px 0 0 3px',
          transition: 'width 0.6s ease',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: 0, height: '100%',
          width: 2, background: 'var(--rp-bg)', transform: 'translateX(-50%)',
        }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main component
══════════════════════════════════════════════ */

export default function LiveGameView({ liveGameData, liveEvents = [], playerData, ddVersion }) {
  const [tab, setTab] = useState('scoreboard'); // 'scoreboard' | 'events'

  const data = liveGameData;
  const localSummoner = playerData?.summoner?.displayName || playerData?.summoner?.gameName || '';

  /* ── Derived data ── */
  const { blueTeam, redTeam, activePlayer, gameTime, dragonList, blueGold, redGold } = useMemo(() => {
    if (!data) return { blueTeam: [], redTeam: [], activePlayer: null, gameTime: 0, dragonList: [], blueGold: 0, redGold: 0 };

    const allPlayers = data.allPlayers || [];
    const blue = allPlayers.filter(p => p.team === 'ORDER');
    const red  = allPlayers.filter(p => p.team === 'CHAOS');

    const goldSum = (team) => team.reduce((s, p) => s + (p.currentGold ?? p.totalGold ?? 0), 0);

    return {
      blueTeam:    blue,
      redTeam:     red,
      activePlayer: data.activePlayer || null,
      gameTime:    data.gameData?.gameTime ?? 0,
      dragonList:  data.gameData?.dragonKilledList || [],
      blueGold:    goldSum(blue),
      redGold:     goldSum(red),
    };
  }, [data]);

  /* ── Loading state ── */
  if (!data) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        color: 'var(--rp-text-muted)', fontSize: 14,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid var(--rp-border)',
            borderTopColor: 'var(--rp-gold)',
          }}
        />
        <div>Conectando con el cliente en partida...</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>Disponible una vez cargue el mapa</div>
      </div>
    );
  }

  const TABS = [
    { id: 'scoreboard', label: 'Marcador' },
    { id: 'events',     label: 'Eventos'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Top bar: clock + gold ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--rp-border)',
        background: 'var(--rp-surface)', flexShrink: 0, gap: 20,
        flexWrap: 'wrap',
      }}>
        <GameClock gameTime={gameTime} />

        {/* Gold bar center */}
        <div style={{ flex: 1, minWidth: 180, maxWidth: 360 }}>
          <GoldBar blueGold={blueGold} redGold={redGold} />
        </div>

        {/* Dragon souls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {dragonList.length > 0 && <DragonSoul dragonList={dragonList} />}
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  background: tab === t.id ? 'var(--rp-gold)' : 'var(--rp-border)',
                  color: tab === t.id ? 'var(--rp-bg)' : 'var(--rp-text-muted)',
                  transition: 'all 0.15s',
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <AnimatePresence mode="wait">
        {tab === 'scoreboard' ? (
          <motion.div
            key="scoreboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            {/* Active player quick stats */}
            {activePlayer && (
              <div style={{
                padding: '8px 16px', background: 'var(--rp-gold)0a',
                borderBottom: '1px solid var(--rp-border)',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 11, color: 'var(--rp-gold)', fontWeight: 800, letterSpacing: '0.5px' }}>TÚ</span>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                  <span>Nivel <strong style={{ color: 'var(--rp-text)' }}>{activePlayer.level ?? '—'}</strong></span>
                  <span>Oro <strong style={{ color: '#c89b3c' }}>{formatGold(activePlayer.currentGold)}</strong></span>
                  {activePlayer.championStats && <>
                    <span>AP <strong style={{ color: '#818cf8' }}>{Math.round(activePlayer.championStats.abilityPower ?? 0)}</strong></span>
                    <span>AD <strong style={{ color: '#f87171' }}>{Math.round(activePlayer.championStats.attackDamage ?? 0)}</strong></span>
                    <span>Vida <strong style={{ color: '#52b788' }}>{Math.round(activePlayer.championStats.currentHealth ?? 0)}/{Math.round(activePlayer.championStats.maxHealth ?? 0)}</strong></span>
                    <span>Armadura <strong style={{ color: 'var(--rp-text)' }}>{Math.round(activePlayer.championStats.armor ?? 0)}</strong></span>
                    <span>RM <strong style={{ color: 'var(--rp-text)' }}>{Math.round(activePlayer.championStats.magicResist ?? 0)}</strong></span>
                  </>}
                </div>
              </div>
            )}

            {/* Scoreboard columns */}
            <div style={{ flex: 1, display: 'flex', overflow: 'auto' }}>
              <TeamBlock
                players={blueTeam}
                localName={localSummoner}
                ddVersion={ddVersion}
                isBlue={true}
              />
              <div style={{ width: 1, background: 'var(--rp-border)', flexShrink: 0 }} />
              <TeamBlock
                players={redTeam}
                localName={localSummoner}
                ddVersion={ddVersion}
                isBlue={false}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ flex: 1, overflow: 'auto', padding: 16 }}
          >
            {liveEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--rp-text-muted)', padding: 40, fontSize: 13 }}>
                Sin eventos todavía...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...liveEvents].reverse().map((evt, i) => {
                  const meta = EVENT_ICONS[evt.EventName] || { icon: '•', color: 'var(--rp-text-muted)' };
                  return (
                    <motion.div
                      key={evt.EventID ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.18 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 12px',
                        background: 'var(--rp-surface)', borderRadius: 8,
                        border: '1px solid var(--rp-border)',
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{meta.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)' }}>
                          {evt.EventName.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>
                          {evt.KillerName && <span style={{ color: meta.color }}>{evt.KillerName}</span>}
                          {evt.VictimName && <span> eliminó a <span style={{ color: '#ef4444' }}>{evt.VictimName}</span></span>}
                          {evt.Assisters?.length > 0 && <span style={{ color: '#60a5fa' }}> (+{evt.Assisters.join(', ')})</span>}
                          {evt.DragonType && <span> ({evt.DragonType})</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--rp-text-sub)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(evt.EventTime)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
