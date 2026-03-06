import React, { useState } from "react";
import { getChampionImageUrl, getChampionSplashUrl, DD_KEYS } from "../services/datadragon";

const ROLES_ORDER = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const ROLE_ICONS = { TOP: "🗡️", JUNGLE: "🌿", MID: "⚡", ADC: "🏹", SUPPORT: "🛡️" };

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
          <span className="splash-role-icon">{ROLE_ICONS[role]}</span>
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
            <span className="splash-role-icon-lg">{ROLE_ICONS[role]}</span>
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
