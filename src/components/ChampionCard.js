import React from "react";

export default function ChampionCard({ champion, onClick, selected, banned, small }) {
  if (!champion) return null;

  const baseClass = small
    ? "champion-card-small"
    : "champion-card";

  return (
    <button
      className={`${baseClass} ${selected ? "selected" : ""} ${banned ? "banned" : ""}`}
      onClick={() => onClick && onClick(champion)}
      title={`${champion.name} — ${champion.role} | WR: ${champion.winRate}%`}
    >
      <span className="champion-icon">{champion.icon}</span>
      {!small && (
        <>
          <span className="champion-name">{champion.name}</span>
          <span className="champion-role">{champion.role}</span>
          <div className="champion-stats">
            <span className={`damage-badge ${champion.damage.toLowerCase()}`}>{champion.damage}</span>
            <span className="winrate">{champion.winRate}%</span>
          </div>
        </>
      )}
      {small && <span className="champion-name-small">{champion.name}</span>}
    </button>
  );
}
