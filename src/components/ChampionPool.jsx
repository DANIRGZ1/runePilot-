import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChampionImageUrl } from "../services/datadragon";
import { Input } from "./ui/input";
import { RoleIcon } from "./RoleIcons";

const ALL_ROLES = ["ALL", "TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.012 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 22 } },
};

function ChampionImg({ champion, ddVersion, className }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = ddVersion && champion.ddKey && !imgFailed
    ? getChampionImageUrl(champion.ddKey, ddVersion)
    : null;

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
  return <span className="pool-icon-fallback">{champion.icon || '⚔️'}</span>;
}

function WinRateBadge({ winRate }) {
  if (winRate == null) return null;
  const color =
    winRate >= 53 ? '#52b788' :
    winRate >= 50 ? '#c89b3c' :
    '#ef4444';
  return (
    <span className="pool-wr-badge" style={{ color, borderColor: color + '44' }}>
      {winRate.toFixed(1)}%
    </span>
  );
}

export default function ChampionPool({
  champions = [],
  onSelect,
  activeSlot,
  usedChampions,
  bannedChampions,
  ddVersion,
  assignedPosition,
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // When assignedPosition arrives, default the filter to that role
  React.useEffect(() => {
    if (assignedPosition) setFilter(assignedPosition);
  }, [assignedPosition]);

  const visible = useMemo(() => {
    return champions.filter((c) => {
      const matchRole = filter === "ALL" || c.role === filter;
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [champions, filter, search]);

  // Top picks for assigned position: sorted by winRate desc
  const topPicks = useMemo(() => {
    if (!assignedPosition || filter !== assignedPosition) return [];
    return [...visible]
      .filter((c) => c.winRate != null && !usedChampions.includes(c.id) && !bannedChampions.includes(c.id))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 6);
  }, [assignedPosition, filter, visible, usedChampions, bannedChampions]);

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
              className={`role-filter-btn ${filter === role ? "active" : ""} ${role === assignedPosition ? "assigned-role" : ""}`}
              onClick={() => setFilter(role)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {role === 'ALL' ? (
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>ALL</span>
          ) : (
            <>
              <RoleIcon role={role} size={14} gold={filter === role} style={{ opacity: filter === role ? 1 : 0.55 }} />
              {role === assignedPosition && <span style={{ fontSize: 8, marginLeft: 2 }}>★</span>}
            </>
          )}
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
            {assignedPosition
              ? `Your role: ${assignedPosition} — click a champion to view builds`
              : "Click a slot to pick/ban — or tap a champion to view builds"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended picks for assigned position */}
      {topPicks.length > 0 && (
        <div className="pool-recommendations">
          <div className="pool-rec-title">⭐ Top picks for {assignedPosition}</div>
          <div className="pool-rec-grid">
            {topPicks.map((champ) => (
              <motion.button
                key={champ.id}
                className="pool-champion pool-champion-rec"
                onClick={() => onSelect(champ)}
                title={`${champ.name} — ${champ.winRate}% WR`}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ChampionImg champion={champ} ddVersion={ddVersion} className="pool-img" />
                <span className="pool-name">{champ.name}</span>
                <WinRateBadge winRate={champ.winRate} />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <motion.div
        className="champions-grid"
        key={filter + search}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visible.map((champ) => {
          const unavailable = isUnavailable(champ);
          return (
            <motion.button
              key={champ.id}
              className={`pool-champion ${unavailable ? "unavailable" : ""}`}
              onClick={() => onSelect(champ)}
              title={unavailable ? "Already picked or banned" : `${champ.name}${champ.winRate ? ` — ${champ.winRate}% WR` : ''}`}
              variants={cardVariants}
              whileHover={!unavailable ? { scale: 1.08, y: -3 } : {}}
              whileTap={!unavailable ? { scale: 0.94 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ChampionImg champion={champ} ddVersion={ddVersion} className="pool-img" />
              <span className="pool-name">{champ.name}</span>
              <WinRateBadge winRate={champ.winRate} />
              {bannedChampions.includes(champ.id) && <span className="pool-banned-overlay">✕</span>}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
