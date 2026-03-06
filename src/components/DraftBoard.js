import React, { useState } from "react";
import { getChampionUrl } from "../services/datadragon";

const ROLES_ORDER = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const ROLE_ICONS = { TOP: "🗡️", JUNGLE: "🌿", MID: "⚡", ADC: "🏹", SUPPORT: "🛡️" };

function ChampionImg({ champion, ddVersion, className, fallbackClass }) {
  const [failed, setFailed] = useState(false);
  const src = ddVersion && !failed ? getChampionUrl(champion.id, ddVersion) : null;
  if (src) {
    return <img src={src} alt={champion.name} className={className} onError={() => setFailed(true)} />;
  }
  return <span className={fallbackClass}>{champion.icon}</span>;
}

function TeamSlot({ role, champion, onClick, isActive, onChampionClick, ddVersion }) {
  const handleClick = () => {
    if (champion && onChampionClick) {
      onChampionClick(champion);
    } else if (onClick) {
      onClick(role);
    }
  };

  return (
    <div
      className={`team-slot ${isActive ? "active-slot" : ""} ${champion ? "has-champion" : ""}`}
      onClick={handleClick}
      title={champion ? `${champion.name} — click to view build` : `Pick ${role}`}
    >
      <div className="slot-role">
        <span>{ROLE_ICONS[role]}</span>
        <span>{role}</span>
      </div>
      {champion ? (
        <div className="slot-champion">
          <ChampionImg
            champion={champion}
            ddVersion={ddVersion}
            className="slot-img"
            fallbackClass="slot-icon"
          />
          <div className="slot-champ-info">
            <span className="slot-name">{champion.name}</span>
            <span className="slot-wr">{champion.winRate}% WR</span>
          </div>
          <span className={`damage-badge ${champion.damage.toLowerCase()}`}>
            {champion.damage}
          </span>
        </div>
      ) : (
        <div className="slot-empty">
          <span>Click to pick</span>
        </div>
      )}
    </div>
  );
}

function BanSlot({ champion, onClick, index, ddVersion }) {
  return (
    <div className="ban-slot" onClick={() => !champion && onClick && onClick(index)}>
      {champion ? (
        <>
          <ChampionImg
            champion={champion}
            ddVersion={ddVersion}
            className="ban-img"
            fallbackClass="ban-icon"
          />
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
        <h2 className="team-title blue">🔵 Blue Team</h2>
        <div className="bans-row">
          {blueBans.map((ban, i) => (
            <BanSlot key={i} champion={ban} onClick={() => onBanSlotClick("blue")} index={i} ddVersion={ddVersion} />
          ))}
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <TeamSlot
              key={role}
              role={role}
              champion={blueTeam[role]}
              onClick={(r) => onSlotClick("blue", r)}
              isActive={activeSlot?.team === "blue" && activeSlot?.role === role && activeSlot?.type === "pick"}
              onChampionClick={onChampionClick}
              ddVersion={ddVersion}
            />
          ))}
        </div>
      </div>

      {/* Center */}
      <div className="draft-center">
        <div className="vs-badge">VS</div>
      </div>

      {/* Red Team */}
      <div className="team-panel red-team">
        <h2 className="team-title red">🔴 Red Team</h2>
        <div className="bans-row">
          {redBans.map((ban, i) => (
            <BanSlot key={i} champion={ban} onClick={() => onBanSlotClick("red")} index={i} ddVersion={ddVersion} />
          ))}
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <TeamSlot
              key={role}
              role={role}
              champion={redTeam[role]}
              onClick={(r) => onSlotClick("red", r)}
              isActive={activeSlot?.team === "red" && activeSlot?.role === role && activeSlot?.type === "pick"}
              onChampionClick={onChampionClick}
              ddVersion={ddVersion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
