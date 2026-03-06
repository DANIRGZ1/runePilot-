import React, { useState, useEffect } from 'react';
import {
  getChampionIconByKey,
  getProfileIconUrl,
  getRankedEmblemUrl,
  ROLE_ICON_URLS,
} from '../services/datadragon';

// Queue ID → display name
const QUEUE_NAMES = {
  420: 'Ranked Solo/Duo',
  440: 'Ranked Flex',
  450: 'ARAM',
  400: 'Normal Draft',
  430: 'Normal',
  700: 'Clash',
  0:   'Custom',
};

// Tier colors
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

/* ─── Role icon component ─── */
function RoleIcon({ role, size = 20, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = role ? ROLE_ICON_URLS[role.toUpperCase()] : null;

  if (!url || failed) return <span style={{ fontSize: size * 0.7, opacity: 0.4 }}>?</span>;

  return (
    <img
      src={url}
      alt={role}
      width={size}
      height={size}
      className={`role-icon-img ${className}`}
      onError={() => setFailed(true)}
      style={{ filter: 'brightness(0) invert(1)', opacity: 0.75 }}
    />
  );
}

/* ─── Ranked emblem ─── */
function RankedEmblem({ tier, size = 80 }) {
  const [failed, setFailed] = useState(false);
  const src = tier ? getRankedEmblemUrl(tier) : null;

  if (!src || failed) {
    return (
      <div className="rank-emblem-fallback" style={{ width: size, height: size }}>
        <span style={{ fontSize: size * 0.4 }}>?</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={tier}
      width={size}
      height={size}
      className="rank-emblem-img"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── Champion icon ─── */
function ChampIcon({ champId, ddVersion, size = 36 }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!champId || !ddVersion) return;
    getChampionIconByKey(champId, ddVersion).then(url => setSrc(url || null));
  }, [champId, ddVersion]);

  if (!src || failed) {
    return <div className="champ-icon-fallback" style={{ width: size, height: size }}>{champId}</div>;
  }
  return (
    <img src={src} alt="" width={size} height={size} className="champ-icon-img" onError={() => setFailed(true)} />
  );
}

/* ─── Match history row ─── */
function MatchRow({ game, ddVersion }) {
  // participants[0] is always our player when fetching by puuid
  const me = game.participants?.[0];
  if (!me) return null;

  const stats    = me.stats || {};
  const timeline = me.timeline || {};
  const win      = stats.win;
  const k = stats.kills ?? 0;
  const d = stats.deaths ?? 0;
  const a = stats.assists ?? 0;
  const kda = d === 0 ? '∞' : ((k + a) / d).toFixed(1);
  const duration = game.gameDuration
    ? `${Math.floor(game.gameDuration / 60)}:${String(game.gameDuration % 60).padStart(2, '0')}`
    : '--:--';
  const queueName = QUEUE_NAMES[game.queueId] ?? `Queue ${game.queueId}`;

  // Determine position
  const teamPos = me.teamPosition || '';
  let role = teamPos;
  if (!role) {
    const lane = timeline.lane || '';
    const r    = timeline.role || '';
    if (lane === 'JUNGLE') role = 'JUNGLE';
    else if (lane === 'TOP') role = 'TOP';
    else if (lane === 'MIDDLE') role = 'MID';
    else if (lane === 'BOTTOM' && r === 'SUPPORT') role = 'SUPPORT';
    else if (lane === 'BOTTOM') role = 'ADC';
  }

  // Map to icon key
  const roleIconKey = { UTILITY: 'SUPPORT', MIDDLE: 'MID' }[role] || role;

  return (
    <div className={`match-row ${win ? 'match-win' : 'match-loss'}`}>
      <div className={`match-result-bar ${win ? 'win' : 'loss'}`} />
      <div className="match-result-tag">
        <span className={`match-wl ${win ? 'win' : 'loss'}`}>{win ? 'V' : 'D'}</span>
      </div>
      <ChampIcon champId={me.championId} ddVersion={ddVersion} size={36} />
      <div className="match-role">
        {roleIconKey
          ? <RoleIcon role={roleIconKey} size={18} />
          : <span style={{ width: 18 }} />}
      </div>
      <div className="match-kda">
        <span className="match-kda-nums">
          <span className="match-k">{k}</span>
          <span className="match-slash"> / </span>
          <span className="match-d" style={{ color: d >= 8 ? '#e84057' : 'inherit' }}>{d}</span>
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
  const flexQ  = ranked?.queues?.find(q => q.queueType === 'RANKED_FLEX_SR');
  const queue  = soloQ || flexQ;

  const tier     = queue?.tier     || 'UNRANKED';
  const division = queue?.division || '';
  const lp       = queue?.leaguePoints ?? 0;
  const wins     = queue?.wins    ?? 0;
  const losses   = queue?.losses  ?? 0;
  const total    = wins + losses;
  const wr       = total > 0 ? ((wins / total) * 100).toFixed(0) : '--';
  const color    = TIER_COLORS[tier] || '#8fa8b0';

  const profileIconUrl = summoner?.profileIconId && ddVersion
    ? getProfileIconUrl(summoner.profileIconId, ddVersion)
    : null;

  return (
    <div className="player-card">
      <div className="player-card-left">
        <div className="player-profile-icon-wrap">
          {profileIconUrl
            ? <img src={profileIconUrl} alt="profile" className="player-profile-icon" />
            : <div className="player-profile-icon-fallback">?</div>}
          <span className="player-level">{summoner?.summonerLevel ?? '--'}</span>
        </div>
        <div className="player-info">
          <span className="player-name">{summoner?.displayName ?? 'Desconectado'}</span>
          {queue
            ? <span className="player-rank" style={{ color }}>
                {tier} {division} · {lp} LP
              </span>
            : <span className="player-rank" style={{ color: '#64748b' }}>Sin clasificar</span>}
          {total > 0 && (
            <span className="player-record">
              <span className="wins">{wins}V</span>
              <span className="losses"> {losses}D</span>
              <span className="wr"> · {wr}% WR</span>
            </span>
          )}
        </div>
      </div>
      <RankedEmblem tier={tier !== 'UNRANKED' ? tier : null} size={90} />
    </div>
  );
}

/* ─── No LCU placeholder ─── */
function NoLcu() {
  return (
    <div className="home-no-lcu">
      <div className="home-no-lcu-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3>League of Legends no detectado</h3>
      <p>Abre el cliente de LoL para ver tu perfil e historial.</p>
    </div>
  );
}

/* ─── Main HomeView ─── */
export default function HomeView({ ddVersion, playerData }) {
  const hasSummoner = !!playerData?.summoner?.displayName;
  const games = playerData?.history?.games?.games ?? [];

  return (
    <div className="home-view">
      {/* Player card */}
      {hasSummoner
        ? <PlayerCard summoner={playerData.summoner} ranked={playerData.ranked} ddVersion={ddVersion} />
        : <NoLcu />}

      {/* Match history */}
      {hasSummoner && (
        <div className="match-history-section">
          <div className="match-history-title">Historial reciente</div>
          {games.length === 0
            ? <p className="match-history-empty">Sin partidas recientes.</p>
            : <div className="match-history-list">
                {games.slice(0, 15).map((g) => (
                  <MatchRow key={g.gameId} game={g} ddVersion={ddVersion} />
                ))}
              </div>}
        </div>
      )}
    </div>
  );
}
