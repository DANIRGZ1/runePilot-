import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { champions } from "../data/champions";
import { getChampionUrl } from "../services/datadragon";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ALL_ROLES = ["ALL", "TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.018 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 22 } },
};

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
        <Input
          className="search-input bg-[var(--rp-card)] border-[var(--rp-border)] text-[var(--text)] placeholder:text-[var(--rp-muted)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] h-8 text-xs"
          type="text"
          placeholder="Search champion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="role-filters">
          {ALL_ROLES.map((role) => (
            <motion.button
              key={role}
              className={`role-filter-btn ${filter === role ? "active" : ""}`}
              onClick={() => setFilter(role)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {role}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {hintText ? (
          <motion.div
            key="hint-active"
            className={`pool-hint ${activeSlot?.type === "ban" ? "ban-hint" : ""}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {hintText}
          </motion.div>
        ) : (
          <motion.div
            key="hint-neutral"
            className="pool-hint pool-hint-neutral"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            Click a slot to pick/ban — or tap a champion to view builds
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="champions-grid"
        key={filter + search}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visible.map((champ) => {
          const unavailable = isUnavailable(champ);
          const isBanned = bannedChampions.includes(champ.id);
          return (
            <motion.button
              key={champ.id}
              className={`pool-champion ${unavailable ? "unavailable" : ""}`}
              onClick={() => onSelect(champ)}
              title={unavailable ? "Already picked or banned" : champ.name}
              variants={cardVariants}
              whileHover={!unavailable ? { scale: 1.08, y: -3 } : {}}
              whileTap={!unavailable ? { scale: 0.94 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ChampionImg champion={champ} ddVersion={ddVersion} className="pool-img" />
              <span className="pool-name">{champ.name}</span>
              {isBanned && <span className="pool-banned-overlay">✕</span>}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
