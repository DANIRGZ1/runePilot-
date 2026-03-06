import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuild } from '../data/builds';

const RUNE_COLORS = {
  Precision: '#c89b3c',
  Domination: '#c9453a',
  Sorcery: '#4a9eff',
  Resolve: '#52b788',
  Inspiration: '#5bc0de',
};

const TIER_COLORS = {
  S: '#ff4444',
  A: '#ff8c00',
  B: '#4a9eff',
  C: '#64748b',
};

const tabContentVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.12 } },
};

function RunePage({ runes }) {
  const color = RUNE_COLORS[runes.primary] || '#c89b3c';
  return (
    <div className="build-runes">
      <div className="build-rune-header" style={{ color }}>
        <span className="rune-tree">{runes.primary}</span>
        <span className="rune-keystone">{runes.keystone}</span>
      </div>
      <div className="rune-list">
        {runes.page.map((r, i) => (
          <motion.span
            key={i}
            className={`rune-pill ${i < 4 ? 'primary-rune' : 'secondary-rune'}`}
            style={i < 4 ? { borderColor: color + '66', color } : {}}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 22 }}
          >
            {r}
          </motion.span>
        ))}
      </div>
      <div className="rune-secondary-tree">
        <span style={{ color: RUNE_COLORS[runes.secondary] || '#64748b' }}>
          {runes.secondary}
        </span>
      </div>
    </div>
  );
}

function ItemRow({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="build-item-row">
      <span className="build-item-label">{label}</span>
      <div className="build-item-list">
        {items.map((item, i) => (
          <motion.span
            key={i}
            className="item-pill"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function BuildPanel({ champion, onClose }) {
  const [tab, setTab] = useState('build');

  if (!champion) return null;
  const build = getBuild(champion.id);

  if (!build) {
    return (
      <motion.div
        className="build-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        <div className="build-panel-header">
          <span className="build-champ-name">{champion.name}</span>
          <button className="build-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="build-no-data">No build data yet for this champion.</p>
      </motion.div>
    );
  }

  const tierColor = TIER_COLORS[build.tier] || '#c89b3c';

  return (
    <motion.div
      className="build-panel"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    >
      <div className="build-panel-header">
        <div className="build-champ-info">
          <motion.span
            className="build-champ-icon"
            initial={{ scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.08 }}
          >
            {champion.icon}
          </motion.span>
          <div>
            <span className="build-champ-name">{champion.name}</span>
            <div className="build-meta">
              <span className="build-tier" style={{ color: tierColor, borderColor: tierColor + '55' }}>
                Tier {build.tier}
              </span>
              <span className="build-patch">Patch {build.patch}</span>
              <span className="build-source">{build.source}</span>
            </div>
          </div>
        </div>
        <motion.button
          className="build-close-btn"
          onClick={onClose}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          ✕
        </motion.button>
      </div>

      <div className="build-tabs">
        {['build', 'runes', 'tips'].map((t) => (
          <motion.button
            key={t}
            className={`build-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {t === 'build' ? '🛡️ Items' : t === 'runes' ? '🔮 Runes' : '💡 Tips'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'build' && (
          <motion.div
            key="build"
            className="build-items-section"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="build-spells">
              <span className="build-item-label">Summoner Spells</span>
              <div className="build-item-list">
                {build.summonerSpells.map((s, i) => (
                  <motion.span
                    key={i}
                    className="spell-pill"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
            <ItemRow label="Mythic" items={[build.items.mythic]} />
            <ItemRow label="Boots" items={[build.items.boots]} />
            <ItemRow label="Core" items={build.items.core} />
            <ItemRow label="Situational" items={build.items.situational} />
            <div className="build-skill-order">
              <span className="build-item-label">Skill Order</span>
              <div className="skill-order-display">
                <span className="skill-order-text">{build.skillOrder.order}</span>
                <div className="skill-maxes">
                  <span className="skill-pill skill-1">Max 1st: {build.skillOrder.maxFirst}</span>
                  <span className="skill-pill skill-2">Max 2nd: {build.skillOrder.maxSecond}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'runes' && (
          <motion.div
            key="runes"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <RunePage runes={build.runes} />
          </motion.div>
        )}

        {tab === 'tips' && (
          <motion.div
            key="tips"
            className="build-tips"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {build.tips.map((tip, i) => (
              <motion.div
                key={i}
                className="build-tip"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 380, damping: 26 }}
              >
                <span className="tip-num">{i + 1}</span>
                <span className="tip-text">{tip}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
