/**
 * Runes Service
 * Fetches DataDragon runesReforged.json and builds name→id and name→icon maps.
 */
import { getLatestVersion } from './datadragon';

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

let cachedTreeData    = null;
let cachedNameToId    = null;
let cachedIconByName  = null; // rune name → icon path
let cachedTreeIcons   = null; // tree name → icon path

export async function loadRunes() {
  if (cachedTreeData) return cachedTreeData;
  const version = await getLatestVersion();
  const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/en_US/runesReforged.json`);
  cachedTreeData  = await res.json();
  cachedNameToId  = {};
  cachedIconByName = {};
  cachedTreeIcons  = {};
  for (const tree of cachedTreeData) {
    cachedTreeIcons[tree.name] = tree.icon;
    cachedNameToId[tree.name]  = tree.id;
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        cachedNameToId[rune.name]   = rune.id;
        cachedIconByName[rune.name] = rune.icon;
      }
    }
  }
  return cachedTreeData;
}

export function getRuneIconPath(name) {
  return cachedIconByName?.[name] ?? null;
}

export function getTreeIconPath(treeName) {
  return cachedTreeIcons?.[treeName] ?? null;
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

/**
 * Convert a build rune object (from builds.js) to LCU rune page payload.
 */
export async function buildRunePayload(runeObj, championName) {
  try {
    await loadRunes();
    const primaryId   = await getTreeIdByName(runeObj.primary);
    const secondaryId = await getTreeIdByName(runeObj.secondary);
    if (!primaryId || !secondaryId) return null;

    const perks = [];
    for (const runeName of runeObj.page) {
      const id = await getRuneIdByName(runeName);
      if (id) perks.push(id);
    }

    while (perks.length < 6) perks.push(5008);
    const statShards = [5008, 5008, 5002];
    return {
      name: `RunePilot — ${championName}`,
      primaryId,
      secondaryId,
      perks: [...perks, ...statShards],
    };
  } catch {
    return null;
  }
}
