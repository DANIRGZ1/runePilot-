import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuild } from '../data/builds';
import { buildRunePayload, loadRunes, getRuneIconPath, getTreeIconPath } from '../services/runesService';
import { loadItemsData, getItemImageUrl, getSpellImageUrl, getSpellKey, getRuneIconUrl } from '../services/datadragon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const RUNE_COLORS = {
  Precision:   '#c89b3c',
  Domination:  '#c9453a',
  Sorcery:     '#4a9eff',
  Resolve:     '#52b788',
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
  exit:    { opacity: 0, x: -16, transition: { duration: 0.12 } },
};

/* ─── Icon primitives ─── */

function RuneIcon({ name, size = 28, isKeystone = false, ready }) {
  const [failed, setFailed] = useState(false);
  const path = ready ? getRuneIconPath(name) : null;
  const src  = path && !failed ? getRuneIconUrl(path) : null;
  return (
    <div className={`rune-icon-wrap${isKeystone ? ' keystone' : ''}`} title={name}>
      {src
        ? <img src={src} alt={name} width={size} height={size} className="rune-icon-img" onError={() => setFailed(true)} />
        : <span className="rune-fallback">◈</span>}
    </div>
  );
}

function TreeIcon({ treeName, ready }) {
  const [failed, setFailed] = useState(false);
  const path = ready ? getTreeIconPath(treeName) : null;
  const src  = path && !failed ? getRuneIconUrl(path) : null;
  return (
    <div className="tree-icon-wrap" title={treeName}>
      {src
        ? <img src={src} alt={treeName} width={20} height={20} className="tree-icon-img" onError={() => setFailed(true)} />
        : <span>🔮</span>}
    </div>
  );
}

function SpellIcon({ name, ddVersion }) {
  const [failed, setFailed] = useState(false);
  const key = getSpellKey(name);
  const src = key && ddVersion && !failed ? getSpellImageUrl(key, ddVersion) : null;
  return (
    <div className="spell-icon-wrap" title={name}>
      {src
        ? <img src={src} alt={name} className="spell-icon-img" onError={() => setFailed(true)} />
        : <span className="spell-text">{name}</span>}
    </div>
  );
}

function ItemIcon({ name, itemsMap, ddVersion }) {
  const [failed, setFailed] = useState(false);
  const id  = itemsMap?.[name?.toLowerCase()];
  const src = id && ddVersion && !failed ? getItemImageUrl(id, ddVersion) : null;
  return (
    <div className="item-icon-wrap" title={name}>
      {src
        ? <img src={src} alt={name} className="item-icon-img" onError={() => setFailed(true)} />
        : <span className="item-text">{name}</span>}
    </div>
  );
}

/* ─── Rune page visual ─── */

function RunePage({ runes, runesReady }) {
  const primaryColor   = RUNE_COLORS[runes.primary]   || '#c89b3c';
  const secondaryColor = RUNE_COLORS[runes.secondary] || '#64748b';
  // page: [keystone, prim1, prim2, prim3, sec1, sec2]
  const [keystone, ...rest] = runes.page;
  const primaryRunes   = rest.slice(0, 3);
  const secondaryRunes = rest.slice(3);

  return (
    <div className="rune-page">
      {/* Primary tree */}
      <div className="rune-tree-section">
        <div className="rune-tree-label" style={{ color: primaryColor }}>
          <TreeIcon treeName={runes.primary} ready={runesReady} />
          <span>{runes.primary}</span>
        </div>
        <div className="rune-keystone-row">
          <RuneIcon name={keystone} size={42} isKeystone ready={runesReady} />
          <span className="rune-keystone-name" style={{ color: primaryColor }}>{keystone}</span>
        </div>
        <div className="rune-row">
          {primaryRunes.map((r, i) => (
            <motion.div key={i} className="rune-entry"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 380, damping: 24 }}
            >
              <RuneIcon name={r} size={28} ready={runesReady} />
              <span className="rune-entry-name">{r}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rune-tree-divider" />

      {/* Secondary tree */}
      <div className="rune-tree-section secondary">
        <div className="rune-tree-label" style={{ color: secondaryColor }}>
          <TreeIcon treeName={runes.secondary} ready={runesReady} />
          <span>{runes.secondary}</span>
        </div>
        <div className="rune-row">
          {secondaryRunes.map((r, i) => (
            <motion.div key={i} className="rune-entry"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 380, damping: 24 }}
            >
              <RuneIcon name={r} size={28} ready={runesReady} />
              <span className="rune-entry-name">{r}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Items section ─── */

function ItemsSection({ build, ddVersion, itemsMap }) {
  const itemsReady = !!itemsMap;

  function ItemGroup({ label, names }) {
    const list = Array.isArray(names) ? names : [names];
    if (!list.length || list.every(n => !n)) return null;
    return (
      <div className="build-item-group">
        <span className="build-item-label">{label}</span>
        <div className="build-item-icons">
          {list.map((name, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 380, damping: 22 }}
            >
              <ItemIcon name={name} itemsMap={itemsReady ? itemsMap : null} ddVersion={ddVersion} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="build-items-section">
      <div className="build-spells">
        <span className="build-item-label">Hechizos de invocador</span>
        <div className="build-spell-icons">
          {build.summonerSpells.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 380, damping: 22 }}
            >
              <SpellIcon name={s} ddVersion={ddVersion} />
            </motion.div>
          ))}
        </div>
      </div>
      <ItemGroup label="Mítico"        names={[build.items.mythic]} />
      <ItemGroup label="Botas"         names={[build.items.boots]} />
      <ItemGroup label="Core"          names={build.items.core} />
      <ItemGroup label="Situacional"   names={build.items.situational} />
      <div className="build-skill-order">
        <span className="build-item-label">Orden de habilidades</span>
        <div className="skill-order-display">
          <span className="skill-order-text">{build.skillOrder.order}</span>
          <div className="skill-maxes">
            <span className="skill-pill skill-1">Max 1º: {build.skillOrder.maxFirst}</span>
            <span className="skill-pill skill-2">Max 2º: {build.skillOrder.maxSecond}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function BuildPanel({ champion, onClose, ddVersion }) {
  const [runeImportState, setRuneImportState] = useState('idle');
  const [runesReady, setRunesReady]           = useState(false);
  const [itemsMap, setItemsMap]               = useState(null);

  useEffect(() => {
    loadRunes().then(() => setRunesReady(true)).catch(() => setRunesReady(true));
  }, []);

  useEffect(() => {
    if (!ddVersion) return;
    loadItemsData(ddVersion).then(m => setItemsMap(m)).catch(() => {});
  }, [ddVersion]);

  if (!champion) return null;
  const build = getBuild(champion.id);

  async function handleImportRunes() {
    if (!build) return;
    setRuneImportState('loading');
    try {
      const payload = await buildRunePayload(build.runes, champion.name);
      if (!payload) { setRuneImportState('err'); return; }
      const res = await fetch('http://localhost:3001/lcu/runes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setRuneImportState(res.ok ? 'ok' : 'err');
      setTimeout(() => setRuneImportState('idle'), 3000);
    } catch {
      setRuneImportState('err');
      setTimeout(() => setRuneImportState('idle'), 3000);
    }
  }

  if (!build) {
    return (
      <motion.div className="build-panel"
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        <div className="build-panel-header">
          <span className="build-champ-name">{champion.name}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <p className="build-no-data">Sin datos de build para este campeón.</p>
      </motion.div>
    );
  }

  const tierColor = TIER_COLORS[build.tier] || '#c89b3c';

  return (
    <motion.div className="build-panel"
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    >
      <div className="build-panel-header">
        <div className="build-champ-info">
          <motion.span className="build-champ-icon"
            initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.08 }}
          >
            {champion.icon}
          </motion.span>
          <div>
            <span className="build-champ-name">{champion.name}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0"
                style={{ color: tierColor, borderColor: tierColor + '55' }}>
                Tier {build.tier}
              </Badge>
              <span className="build-patch">Patch {build.patch}</span>
              <span className="build-source">{build.source}</span>
            </div>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <Button variant="ghost" size="icon" onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">✕</Button>
        </motion.div>
      </div>

      <Tabs defaultValue="build" className="w-full">
        <TabsList className="w-full rounded-none border-b border-[var(--rp-border)] bg-[var(--rp-card)] h-10">
          <TabsTrigger value="build"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs">
            🛡️ Items
          </TabsTrigger>
          <TabsTrigger value="runes"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs">
            🔮 Runas
          </TabsTrigger>
          <TabsTrigger value="tips"
            className="flex-1 data-[state=active]:text-[var(--gold)] data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--gold)] rounded-none text-[var(--rp-muted)] text-xs">
            💡 Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build" asChild>
          <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
            <ItemsSection build={build} ddVersion={ddVersion} itemsMap={itemsMap} />
          </motion.div>
        </TabsContent>

        <TabsContent value="runes" asChild>
          <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
            <RunePage runes={build.runes} runesReady={runesReady} />
            <div className="build-rune-import">
              <Button size="sm" onClick={handleImportRunes}
                disabled={runeImportState === 'loading'} className="build-import-btn">
                {runeImportState === 'loading' ? '⏳ Importando...' :
                 runeImportState === 'ok'      ? '✅ Importado!' :
                 runeImportState === 'err'     ? '❌ Error' :
                 '📥 Importar al cliente'}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="tips" asChild>
          <motion.div className="build-tips" variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
            {build.tips.map((tip, i) => (
              <motion.div key={i} className="build-tip"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
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
