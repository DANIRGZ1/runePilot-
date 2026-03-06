import React, { useState } from "react";
import { champions } from "../data/champions";
import ChampionCard from "./ChampionCard";

const ALL_ROLES = ["ALL", "TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

export default function ChampionPool({
  onSelect,
  activeSlot,
  usedChampions,
  bannedChampions,
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

      {activeSlot && (
        <div className="pool-hint">
          Selecting for: <strong>{activeSlot.team === "blue" ? "🔵 Blue" : "🔴 Red"}</strong> —{" "}
          <strong>{activeSlot.role || "Ban"}</strong>
        </div>
      )}

      <div className="champions-grid">
        {visible.map((champ) => (
          <button
            key={champ.id}
            className={`pool-champion ${isUnavailable(champ) ? "unavailable" : ""}`}
            onClick={() => !isUnavailable(champ) && onSelect(champ)}
            disabled={isUnavailable(champ)}
            title={isUnavailable(champ) ? "Already picked or banned" : champ.name}
          >
            <span className="pool-icon">{champ.icon}</span>
            <span className="pool-name">{champ.name}</span>
            {bannedChampions.includes(champ.id) && (
              <span className="pool-banned-overlay">✕</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
