import React, { useState } from "react";
import { champions } from "../data/champions";
import { getChampionUrl } from "../services/datadragon";

const ALL_ROLES = ["ALL", "TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

function ChampionImg({ champion, ddVersion, className }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = ddVersion && !imgFailed ? getChampionUrl(champion.id, ddVersion) : null;

  if (src) {
    return (
      <img
        src={src}
        alt={champion.name}
        className={className}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <span className="pool-icon-fallback">{champion.icon}</span>;
}

export default function ChampionPool({
  onSelect,
  activeSlot,
  usedChampions,
  bannedChampions,
  ddVersion,
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const visible = champions.filter((c) => {
    const matchRole = filter === "ALL" || c.role === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const isUnavailable = (c) =>
    usedChampions.includes(c.id) || bannedChampions.includes(c.id);

  const hintText = activeSlot
    ? activeSlot.type === "ban"
      ? `Banning for ${activeSlot.team === "blue" ? "🔵 Blue" : "🔴 Red"}`
      : `Picking for ${activeSlot.team === "blue" ? "🔵 Blue" : "🔴 Red"} — ${activeSlot.role}`
    : null;

  return (
    <div className="champion-pool">
      <div className="pool-header">
        <input
          className="search-input"
          type="text"
          placeholder="Search champion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="role-filters">
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              className={`role-filter-btn ${filter === role ? "active" : ""}`}
              onClick={() => setFilter(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {hintText && (
        <div className={`pool-hint ${activeSlot?.type === "ban" ? "ban-hint" : ""}`}>
          {hintText}
        </div>
      )}
      {!activeSlot && (
        <div className="pool-hint pool-hint-neutral">
          Click a slot to pick/ban — or tap a champion to view builds
        </div>
      )}

      <div className="champions-grid">
        {visible.map((champ) => {
          const unavailable = isUnavailable(champ);
          const isBanned = bannedChampions.includes(champ.id);
          return (
            <button
              key={champ.id}
              className={`pool-champion ${unavailable ? "unavailable" : ""}`}
              onClick={() => onSelect(champ)}
              title={unavailable ? "Already picked or banned" : champ.name}
            >
              <ChampionImg champion={champ} ddVersion={ddVersion} className="pool-img" />
              <span className="pool-name">{champ.name}</span>
              {isBanned && <span className="pool-banned-overlay">✕</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
