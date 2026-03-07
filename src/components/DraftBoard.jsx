import React, { useState } from "react";
import { getChampionImageUrl, getChampionSplashUrl, DD_KEYS } from "../services/datadragon";

const ROLES_ORDER = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

/* ── Iconos oficiales de rol (SVG inline) ── */
const ROLE_SVG = {
  TOP: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M32 6 L26 14 L20 14 L20 22 L14 28 L14 38 L20 44 L20 52 L26 52 L32 58 L38 52 L44 52 L44 44 L50 38 L50 28 L44 22 L44 14 L38 14 Z M32 12 L36 18 L40 18 L40 24 L46 30 L46 36 L40 42 L40 48 L36 48 L32 54 L28 48 L24 48 L24 42 L18 36 L18 30 L24 24 L24 18 L28 18 Z M32 22 L27 29 L27 35 L32 42 L37 35 L37 29 Z"/>
    </svg>
  ),
  JUNGLE: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <rect x="8" y="8" width="48" height="48" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="5"/>
      <rect x="20" y="20" width="24" height="24" rx="2" ry="2"/>
    </svg>
  ),
  MID: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M32 4 L40 16 L52 12 L46 24 L58 28 L48 34 L52 46 L40 42 L36 54 L32 42 L28 54 L24 42 L12 46 L16 34 L6 28 L18 24 L12 12 L24 16 Z M32 18 L27 26 L18 26 L24 34 L21 43 L30 38 L32 46 L34 38 L43 43 L40 34 L46 26 L37 26 Z"/>
    </svg>
  ),
  ADC: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <rect x="6" y="6" width="52" height="52" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="5"/>
      <line x1="14" y1="50" x2="50" y2="14" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  ),
  SUPPORT: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M6 6 L6 26 L12 26 L12 12 L26 12 L26 6 Z"/>
      <path d="M58 6 L38 6 L38 12 L52 12 L52 26 L58 26 Z"/>
      <path d="M6 58 L26 58 L26 52 L12 52 L12 38 L6 38 Z"/>
      <path d="M58 58 L58 38 L52 38 L52 52 L38 52 L38 58 Z"/>
      <rect x="22" y="22" width="20" height="20" rx="2" ry="2"/>
    </svg>
  ),
};

function RoleIcon({ role, size = 20, color = 'currentColor' }) {
  const fn = ROLE_SVG[role] || ROLE_SVG[role?.toUpperCase?.()];
  if (!fn) return null;
  return (
    <span style={{ display: 'inline-flex', color }} aria-label={role}>
      {fn(size)}
    </span>
  );
}

function SplashSlot({ role, champion, onClick, isActive, onChampionClick, ddVersion, team }) {
  const [splashFailed, setSplashFailed] = useState(false);
  const key = champion?.ddKey || DD_KEYS[champion?.id];
  const splashUrl = key && !splashFailed ? getChampionSplashUrl(key) : null;
  const isBlue = team === "blue";

  const handleClick = () => {
    if (champion && onChampionClick) onChampionClick(champion);
    else if (onClick) onClick(role);
  };

  return (
    <div
      className={`splash-slot ${team} ${isActive ? "active-slot" : ""} ${champion ? "has-champion" : ""}`}
      onClick={handleClick}
      title={champion ? `${champion.name} — click to view build` : `Pick ${role}`}
    >
      {champion && splashUrl && (
        <img
          src={splashUrl}
          alt={champion.name}
          className={`splash-art${isBlue ? "" : " mirror"}`}
          onError={() => setSplashFailed(true)}
        />
      )}
      <div className={`splash-gradient ${team}-gradient`} />
      <div className={`splash-content ${team}-content`}>
        <div className="splash-role">
          <RoleIcon role={role} size={22} />
          <span className="splash-role-text">{role}</span>
        </div>
        {champion ? (
          <div className="splash-champ-info">
            <span className="splash-name">{champion.name}</span>
            <div className="splash-meta">
              <span className="splash-wr">{champion.winRate}% WR</span>
              <span className={`damage-badge ${champion.damage.toLowerCase()}`}>
                {champion.damage}
              </span>
            </div>
          </div>
        ) : (
          <div className="splash-empty">
            <RoleIcon role={role} size={32} />
            <span className="splash-pick-text">Pick {role}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BanSlot({ champion, onClick, index, ddVersion }) {
  const [failed, setFailed] = useState(false);
  const key = champion?.ddKey || DD_KEYS[champion?.id];
  const src = ddVersion && key && !failed ? getChampionImageUrl(key, ddVersion) : null;

  return (
    <div className="ban-slot" onClick={() => !champion && onClick && onClick(index)}>
      {champion ? (
        <>
          {src ? (
            <img src={src} alt={champion.name} className="ban-img" onError={() => setFailed(true)} />
          ) : (
            <span className="ban-icon">{champion.icon || "⚔️"}</span>
          )}
          <span className="ban-name">{champion.name}</span>
          <div className="ban-x">✕</div>
        </>
      ) : (
        <span className="ban-empty">Ban {index + 1}</span>
      )}
    </div>
  );
}

export default function DraftBoard({
  blueTeam, redTeam, blueBans, redBans,
  activeSlot, onSlotClick, onBanSlotClick, onChampionClick, ddVersion,
}) {
  return (
    <div className="draft-board">
      {/* Blue Team */}
      <div className="team-panel blue-team">
        <div className="team-header blue-header">
          <h2 className="team-title blue">🔵 Blue Team</h2>
          <div className="bans-row">
            {blueBans.map((ban, i) => (
              <BanSlot key={i} champion={ban} onClick={() => onBanSlotClick("blue")} index={i} ddVersion={ddVersion} />
            ))}
          </div>
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <SplashSlot
              key={role}
              role={role}
              champion={blueTeam[role]}
              onClick={(r) => onSlotClick("blue", r)}
              isActive={activeSlot?.team === "blue" && activeSlot?.role === role && activeSlot?.type === "pick"}
              onChampionClick={onChampionClick}
              ddVersion={ddVersion}
              team="blue"
            />
          ))}
        </div>
      </div>

      {/* Center VS */}
      <div className="draft-center">
        <div className="vs-badge">VS</div>
      </div>

      {/* Red Team */}
      <div className="team-panel red-team">
        <div className="team-header red-header">
          <div className="bans-row">
            {redBans.map((ban, i) => (
              <BanSlot key={i} champion={ban} onClick={() => onBanSlotClick("red")} index={i} ddVersion={ddVersion} />
            ))}
          </div>
          <h2 className="team-title red">🔴 Red Team</h2>
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <SplashSlot
              key={role}
              role={role}
              champion={redTeam[role]}
              onClick={(r) => onSlotClick("red", r)}
              isActive={activeSlot?.team === "red" && activeSlot?.role === role && activeSlot?.type === "pick"}
              onChampionClick={onChampionClick}
              ddVersion={ddVersion}
              team="red"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
