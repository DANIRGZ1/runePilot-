import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getChampionIconByKey,
  getProfileIconUrl,
  getRankedEmblemUrl,
  ROLE_ICON_URLS,
} from '../services/datadragon';

const QUEUE_NAMES = {
  420: 'Ranked Solo/Duo',
  440: 'Ranked Flex',
  450: 'ARAM',
  400: 'Normal Draft',
  430: 'Normal',
  700: 'Clash',
  0:   'Custom',
};

const TIER_COLORS = {
  IRON:        '#8d7154',
  BRONZE:      '#a0522d',
  SILVER:      '#8fa8b0',
  GOLD:        '#c89b3c',
  PLATINUM:    '#3fa58a',
  EMERALD:     '#3fa565',
  DIAMOND:     '#4fa8e0',
  MASTER:      '#9550c0',
  GRANDMASTER: '#cf3f3f',
  CHALLENGER:  '#f4c874',
};

/* ─── Role icon ─── */
function RoleIcon({ role, size = 20 }) {
  const [failed, setFailed] = useState(false);
  const url = role ? ROLE_ICON_URLS[role.toUpperCase()] : null;
  if (!url || failed) return <span style={{ width: size, height: size, display: 'inline-block', opacity: 0.3 }}>—</span>;
  return (
    <img
      src={url} alt={role} width={size} height={size}
      className="role-icon-img"
      onError={() => setFailed(true)}
      style={{ filter: 'brightness(0) invert(0.4)', opacity: 0.85 }}
    />
  );
}

/* ─── Ranked emblem ─── */
function RankedEmblem({ tier, size = 80 }) {
  const [failed, setFailed] = useState(false);
  const src = tier ? getRankedEmblemUrl(tier) : null;
  if (!src || failed) return null;
  return <img src={src} alt={tier} width={size} height={size} className="rank-emblem-img" onError={() => setFailed(true)} />;
}

/* ─── Champion icon ─── */
function ChampIcon({ champId, ddVersion, size = 36 }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!champId || !ddVersion) return;
    getChampionIconByKey(champId, ddVersion).then(url => setSrc(url || null));
  }, [champId, ddVersion]);
  if (!src || failed) return <div className="champ-icon-fallback" style={{ width: size, height: size }} />;
  return <img src={src} alt="" width={size} height={size} className="champ-icon-img" onError={() => setFailed(true)} />;
}

/* ─── Match row ─── */
function MatchRow({ game, ddVersion }) {
  const me = game.participants?.[0];
  if (!me) return null;

  const stats = me.stats || {};
  const win   = stats.win;
  const k = stats.kills ?? 0, d = stats.deaths ?? 0, a = stats.assists ?? 0;
  const kda = d === 0 ? '∞' : ((k + a) / d).toFixed(1);
  const mins = game.gameDuration ? Math.floor(game.gameDuration / 60) : 0;
  const secs = game.gameDuration ? game.gameDuration % 60 : 0;
  const duration  = game.gameDuration ? `${mins}:${String(secs).padStart(2,'0')}` : '--:--';
  const queueName = QUEUE_NAMES[game.queueId] ?? `Cola ${game.queueId}`;

  const teamPos = me.teamPosition || '';
  let role = teamPos;
  if (!role) {
    const lane = (me.timeline?.lane || '').toUpperCase();
    const r    = (me.timeline?.role || '').toUpperCase();
    if (lane === 'JUNGLE') role = 'JUNGLE';
    else if (lane === 'TOP') role = 'TOP';
    else if (lane === 'MIDDLE') role = 'MIDDLE';
    else if (lane === 'BOTTOM' && r === 'SUPPORT') role = 'UTILITY';
    else if (lane === 'BOTTOM') role = 'BOTTOM';
  }

  return (
    <div className={`match-row ${win ? 'match-win' : 'match-loss'}`}>
      <div className={`match-result-bar ${win ? 'win' : 'loss'}`} />
      <span className={`match-wl ${win ? 'win' : 'loss'}`}>{win ? 'V' : 'D'}</span>
      <ChampIcon champId={me.championId} ddVersion={ddVersion} size={36} />
      <div className="match-role">
        <RoleIcon role={role || 'FILL'} size={16} />
      </div>
      <div className="match-kda">
        <span className="match-kda-nums">
          <span className="match-k">{k}</span>
          <span className="match-slash"> / </span>
          <span className="match-d" style={{ color: d >= 8 ? '#e84057' : undefined }}>{d}</span>
          <span className="match-slash"> / </span>
          <span className="match-a">{a}</span>
        </span>
        <span className="match-kda-ratio">{kda} KDA</span>
      </div>
      <div className="match-meta">
        <span className="match-queue">{queueName}</span>
        <span className="match-duration">{duration}</span>
      </div>
    </div>
  );
}

/* ─── Player card ─── */
function PlayerCard({ summoner, ranked, ddVersion }) {
  const soloQ = ranked?.queues?.find(q => q.queueType === 'RANKED_SOLO_5x5');
  const queue  = soloQ || ranked?.queues?.find(q => q.queueType === 'RANKED_FLEX_SR');

  const tier     = queue?.tier     || 'UNRANKED';
  const division = queue?.division || '';
  const lp       = queue?.leaguePoints ?? 0;
  const wins     = queue?.wins    ?? 0;
  const losses   = queue?.losses  ?? 0;
  const total    = wins + losses;
  const wr       = total > 0 ? ((wins / total) * 100).toFixed(0) : null;
  const color    = TIER_COLORS[tier] || '#8fa8b0';
  const profileIconUrl = summoner?.profileIconId && ddVersion
    ? getProfileIconUrl(summoner.profileIconId, ddVersion) : null;

  return (
    <motion.div className="player-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
      <div className="player-card-left">
        <div className="player-profile-icon-wrap">
          {profileIconUrl
            ? <img src={profileIconUrl} alt="profile" className="player-profile-icon" />
            : <div className="player-profile-icon-fallback">?</div>}
          <span className="player-level">{summoner?.summonerLevel ?? '--'}</span>
        </div>
        <div className="player-info">
          <span className="player-name">{summoner?.displayName ?? '---'}</span>
          <span className="player-rank" style={{ color }}>
            {tier !== 'UNRANKED' ? `${tier} ${division} · ${lp} LP` : 'Sin clasificar'}
          </span>
          {wr && (
            <span className="player-record">
              <span className="wins">{wins}V</span>
              <span className="losses"> {losses}D</span>
              <span className="wr"> · {wr}% WR</span>
            </span>
          )}
        </div>
      </div>
      {tier !== 'UNRANKED' && <RankedEmblem tier={tier} size={90} />}
    </motion.div>
  );
}

/* ─── Connecting animation ─── */
function ConnectingScreen() {
  return (
    <div className="home-connecting">
      <div className="connecting-animation">
        <motion.div
          className="connecting-ring connecting-ring-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="connecting-ring connecting-ring-2"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="connecting-ring connecting-ring-3"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="connecting-logo">RP</div>
      </div>
      <motion.p
        className="connecting-title"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Esperando a League of Legends…
      </motion.p>
      <p className="connecting-sub">Abre el cliente de LoL para continuar</p>
    </div>
  );
}

/* ─── Loading spinner (connected but fetching data) ─── */
function LoadingData() {
  return (
    <div className="home-connecting">
      <div className="connecting-animation">
        <motion.div
          className="connecting-ring connecting-ring-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="connecting-logo" style={{ fontSize: 11, color: '#c89b3c' }}>RP</div>
      </div>
      <p className="connecting-title">Cargando perfil…</p>
    </div>
  );
}

/* ─── Main ─── */
export default function HomeView({ ddVersion, playerData, lcuStatus }) {
  const connected   = lcuStatus === 'connected';
  const hasSummoner = !!playerData?.summoner?.displayName;
  const games       = playerData?.history?.games?.games ?? [];

  // Not connected to LCU → show connecting animation
  if (!connected && !hasSummoner) return <ConnectingScreen />;

  // Connected but data not yet loaded
  if (connected && playerData === null) return <LoadingData />;

  return (
    <div className="home-view">
      {hasSummoner
        ? <PlayerCard summoner={playerData.summoner} ranked={playerData.ranked} ddVersion={ddVersion} />
        : (
          <div className="home-no-lcu">
            <div className="home-no-lcu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3>No se encontraron datos de perfil</h3>
            <p>Comprueba que el cliente de LoL ha terminado de cargar.</p>
          </div>
        )}

      {hasSummoner && (
        <div className="match-history-section">
          <div className="match-history-title">Historial reciente</div>
          {games.length === 0
            ? <p className="match-history-empty">Sin partidas recientes.</p>
            : (
              <div className="match-history-list">
                {games.slice(0, 15).map(g => (
                  <MatchRow key={g.gameId} game={g} ddVersion={ddVersion} />
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
