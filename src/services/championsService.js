/**
 * Champions Service
 * Loads the full champion roster from Riot Data Dragon and merges
 * with static data (roles, winrates) where available.
 */

import { getLatestVersion } from './datadragon';
import { champions as staticChampions } from '../data/champions';

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

// Prefer these roles for DD tags when no static data available
const TAG_ROLE_PRIORITY = [
  ['Marksman', 'ADC'],
  ['Support', 'SUPPORT'],
  ['Mage', 'MID'],
  ['Assassin', 'JUNGLE'],
  ['Fighter', 'TOP'],
  ['Tank', 'TOP'],
];

function guessRole(tags = []) {
  for (const [tag, role] of TAG_ROLE_PRIORITY) {
    if (tags.includes(tag)) return role;
  }
  return 'TOP';
}

let cachedAll = null;
// Map numeric LCU key → champion object
let cachedByLcuKey = null;

export async function getAllChampions() {
  if (cachedAll) return cachedAll;

  try {
    const version = await getLatestVersion();
    const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/en_US/champion.json`);
    const data = await res.json();

    // Build static lookup by lowercase name
    const staticMap = {};
    for (const c of staticChampions) {
      staticMap[c.name.toLowerCase()] = c;
    }

    const result = [];
    for (const champ of Object.values(data.data)) {
      const nameLower = champ.name.toLowerCase();
      const s = staticMap[nameLower];
      result.push({
        // Core identity
        id: nameLower,
        name: champ.name,
        ddKey: champ.id,           // DataDragon image key e.g. "LeeSin"
        lcuKey: parseInt(champ.key), // LCU numeric id e.g. 64
        // Role & stats — from static data when available
        role: s?.role || guessRole(champ.tags),
        damage: s?.damage || (champ.tags.includes('Mage') ? 'AP' : 'AD'),
        tags: champ.tags.map(t => t.toLowerCase()),
        winRate: s?.winRate ?? null,
        pickRate: s?.pickRate ?? null,
        banRate: s?.banRate ?? null,
        difficulty: s?.difficulty ?? 2,
        icon: s?.icon ?? '⚔️',
        // Position-specific winrates (extend later)
        roleWinRates: s?.roleWinRates ?? null,
      });
    }

    result.sort((a, b) => a.name.localeCompare(b.name));
    cachedAll = result;

    // Build fast LCU-key lookup
    cachedByLcuKey = {};
    for (const c of result) cachedByLcuKey[c.lcuKey] = c;

    return result;
  } catch {
    // Fallback: enrich static list with ddKey from DD_KEYS
    const { DD_KEYS } = await import('./datadragon');
    cachedAll = staticChampions.map(c => ({
      ...c,
      ddKey: DD_KEYS[c.id] || c.name.replace(/\s+/g, '').replace(/'/g, ''),
      lcuKey: null,
    }));
    return cachedAll;
  }
}

export async function getChampionByLcuKey(lcuKey) {
  if (!cachedByLcuKey) await getAllChampions();
  return cachedByLcuKey?.[lcuKey] ?? null;
}
