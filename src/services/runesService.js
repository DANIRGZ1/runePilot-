/**
 * Runes Service
 * Fetches DataDragon runesReforged.json and builds a name→id map,
 * then maps our build rune names to LCU perk IDs for import.
 */
import { getLatestVersion } from './datadragon';

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

let cachedTreeData = null;
let cachedNameToId = null;

async function loadRunes() {
  if (cachedTreeData) return cachedTreeData;
  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/en_US/runesReforged.json`);
  cachedTreeData = await res.json();
  // Build name → id map
  cachedNameToId = {};
  for (const tree of cachedTreeData) {
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        cachedNameToId[rune.name] = rune.id;
      }
    }
  }
  return cachedTreeData;
}

export async function getRuneIdByName(name) {
  if (!cachedNameToId) await loadRunes();
  return cachedNameToId[name] ?? null;
}

export async function getTreeIdByName(name) {
  if (!cachedTreeData) await loadRunes();
  const tree = cachedTreeData.find(t => t.name === name);
  return tree?.id ?? null;
}

// Tree display names used in our builds.js
const TREE_DISPLAY = {
  Precision: 'Precision',
  Domination: 'Domination',
  Sorcery: 'Sorcery',
  Resolve: 'Resolve',
  Inspiration: 'Inspiration',
};

/**
 * Convert a build rune object (from builds.js) to LCU rune page payload.
 * Returns null if IDs can't be resolved.
 */
export async function buildRunePayload(runeObj, championName) {
  try {
    await loadRunes();
    const primaryId = await getTreeIdByName(TREE_DISPLAY[runeObj.primary]);
    const secondaryId = await getTreeIdByName(TREE_DISPLAY[runeObj.secondary]);
    if (!primaryId || !secondaryId) return null;

    const perks = [];
    for (const runeName of runeObj.page) {
      const id = await getRuneIdByName(runeName);
      if (id) perks.push(id);
    }

    // LCU needs exactly 9 perks (6 keystones/perks + 3 stat shards)
    // Stat shards: 5008 (Adaptive), 5008, 5003 (Armor) or 5002 — pad with adaptive
    while (perks.length < 6) perks.push(5008);
    const statShards = [5008, 5008, 5002]; // Adaptive, Adaptive, Armor (common)
    const allPerks = [...perks, ...statShards];

    return {
      name: `RunePilot — ${championName}`,
      primaryId,
      secondaryId,
      perks: allPerks,
    };
  } catch {
    return null;
  }
}
