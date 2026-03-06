import React from "react";
import ChampionCard from "./ChampionCard";

const ROLES_ORDER = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const ROLE_ICONS = {
  TOP: "🗡️",
  JUNGLE: "🌿",
  MID: "⚡",
  ADC: "🏹",
  SUPPORT: "🛡️",
};

function TeamSlot({ role, champion, onClick, isActive }) {
  return (
    <div
      className={`team-slot ${isActive ? "active-slot" : ""}`}
      onClick={() => !champion && onClick && onClick(role)}
    >
      <div className="slot-role">
        <span>{ROLE_ICONS[role]}</span>
        <span>{role}</span>
      </div>
      {champion ? (
        <div className="slot-champion">
          <span className="slot-icon">{champion.icon}</span>
          <span className="slot-name">{champion.name}</span>
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

function BanSlot({ champion, onClick, index }) {
  return (
    <div className="ban-slot" onClick={() => !champion && onClick && onClick(index)}>
      {champion ? (
        <>
          <span className="ban-icon">{champion.icon}</span>
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
  blueTeam,
  redTeam,
  blueBans,
  redBans,
  activeSlot,
  onSlotClick,
  onBanSlotClick,
}) {
  return (
    <div className="draft-board">
      {/* Blue Team */}
      <div className="team-panel blue-team">
        <h2 className="team-title blue">🔵 Blue Team</h2>
        <div className="bans-row">
          {blueBans.map((ban, i) => (
            <BanSlot
              key={i}
              champion={ban}
              onClick={(idx) => onBanSlotClick("blue", idx)}
              index={i}
            />
          ))}
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <TeamSlot
              key={role}
              role={role}
              champion={blueTeam[role]}
              onClick={(r) => onSlotClick("blue", r)}
              isActive={activeSlot?.team === "blue" && activeSlot?.role === role}
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
            <BanSlot
              key={i}
              champion={ban}
              onClick={(idx) => onBanSlotClick("red", idx)}
              index={i}
            />
          ))}
        </div>
        <div className="picks-list">
          {ROLES_ORDER.map((role) => (
            <TeamSlot
              key={role}
              role={role}
              champion={redTeam[role]}
              onClick={(r) => onSlotClick("red", r)}
              isActive={activeSlot?.team === "red" && activeSlot?.role === role}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
