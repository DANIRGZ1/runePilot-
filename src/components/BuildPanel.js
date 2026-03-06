import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuild } from '../data/builds';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

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
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-destructive">✕</Button>
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
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{ color: tierColor, borderColor: tierColor + '55' }}
              >
                Tier {build.tier}
              </Badge>
              <span className="build-patch">Patch {build.patch}</span>
              <span className="build-source">{build.source}</span>
            </div>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            ✕
          </Button>
        </motion.div>
      </div>

      <Tabs defaultValue="build" className="w-full">
        <TabsList className="w-full rounded-none border-b border-[var(--rp-border)] bg-[var(--rp-card)] h-10">
          <TabsTrigger
            value="build"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs"
          >
            🛡️ Items
          </TabsTrigger>
          <TabsTrigger
            value="runes"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs"
          >
            🔮 Runes
          </TabsTrigger>
          <TabsTrigger
            value="tips"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs"
          >
            💡 Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build" asChild>
          <motion.div
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
        </TabsContent>

        <TabsContent value="runes" asChild>
          <motion.div
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <RunePage runes={build.runes} />
          </motion.div>
        </TabsContent>

        <TabsContent value="tips" asChild>
          <motion.div
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
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
