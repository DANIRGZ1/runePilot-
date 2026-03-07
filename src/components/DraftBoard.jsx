import React, { useState } from "react";
import { getChampionImageUrl, getChampionSplashUrl, DD_KEYS } from "../services/datadragon";

const ROLES_ORDER = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

/* ── Iconos oficiales de rol (SVG inline)
     Orden imagen izq→der: JUNGLE, ADC, SUPPORT, MID, TOP ── */
const ROLE_SVG = {
  // JUNGLE: planta/hojas — icono 1 (izquierda)
  JUNGLE: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M32 4 C28 10 20 12 16 18 C12 24 14 32 18 37 L22 33 C19 29 19 24 22 20 C25 16 30 14 32 10 C34 14 39 16 42 20 C45 24 45 29 42 33 L46 37 C50 32 52 24 48 18 C44 12 36 10 32 4Z"/>
      <path d="M32 24 C29 28 28 33 30 38 L34 38 C36 33 35 28 32 24Z"/>
      <path d="M26 30 C22 32 20 36 21 40 L25 39 C24 37 25 34 27 33Z" opacity="0.7"/>
      <path d="M38 30 C42 32 44 36 43 40 L39 39 C40 37 39 34 37 33Z" opacity="0.7"/>
      <rect x="30" y="38" width="4" height="18" rx="2"/>
      <ellipse cx="32" cy="58" rx="8" ry="3" opacity="0.4"/>
    </svg>
  ),
  // ADC: cuadrado con diagonal (slash) — icono 2
  ADC: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <rect x="6" y="6" width="52" height="52" rx="5" fill="none" stroke="currentColor" strokeWidth="5"/>
      <line x1="16" y1="48" x2="48" y2="16" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  ),
  // SUPPORT: esquinas con cuadro interior — icono 3
  SUPPORT: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M6 6 L6 22 L11 22 L11 11 L22 11 L22 6 Z"/>
      <path d="M58 6 L42 6 L42 11 L53 11 L53 22 L58 22 Z"/>
      <path d="M6 58 L22 58 L22 53 L11 53 L11 42 L6 42 Z"/>
      <path d="M58 58 L58 42 L53 42 L53 53 L42 53 L42 58 Z"/>
      <rect x="21" y="21" width="22" height="22" rx="3"/>
    </svg>
  ),
  // MID: mariposa/insecto — icono 4
  MID: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <path d="M32 8 C32 8 24 16 20 26 C16 36 22 44 32 44 C42 44 48 36 44 26 C40 16 32 8 32 8Z" opacity="0.9"/>
      <path d="M32 8 L32 56" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M32 26 C26 20 14 18 10 24 C6 30 12 40 22 38 C28 37 32 32 32 26Z" opacity="0.75"/>
      <path d="M32 26 C38 20 50 18 54 24 C58 30 52 40 42 38 C36 37 32 32 32 26Z" opacity="0.75"/>
      <circle cx="32" cy="26" r="4"/>
    </svg>
  ),
  // TOP: cuadrado con cuadro interior (marco LoL top) — icono 5 (derecha)
  TOP: (s) => (
    <svg viewBox="0 0 64 64" width={s} height={s} fill="currentColor">
      <rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="5"/>
      <rect x="21" y="21" width="22" height="22" rx="2"/>
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
