/**
 * Riot Data Dragon Service
 * Official Riot CDN — https://developer.riotgames.com/docs/lol#data-dragon
 * Free to use for any purpose per Riot's developer terms.
 */

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

let cachedVersion = null;

export async function getLatestVersion() {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    const versions = await res.json();
    cachedVersion = versions[0];
    return cachedVersion;
  } catch {
    return '15.4.1'; // fallback
  }
}

export function getChampionImageUrl(ddKey, version) {
  return `${DDRAGON_BASE}/cdn/${version}/img/champion/${ddKey}.png`;
}

export function getChampionSplashUrl(ddKey) {
  return `${DDRAGON_BASE}/cdn/img/champion/splash/${ddKey}_0.jpg`;
}

export function getItemImageUrl(itemId, version) {
  return `${DDRAGON_BASE}/cdn/${version}/img/item/${itemId}.png`;
}

export function getRuneIconUrl(iconPath) {
  return `${DDRAGON_BASE}/cdn/img/${iconPath}`;
}

export function getSpellImageUrl(spellKey, version) {
  return `${DDRAGON_BASE}/cdn/${version}/img/spell/${spellKey}.png`;
}

const SPELL_KEYS = {
  'Flash':     'SummonerFlash',
  'Teleport':  'SummonerTeleport',
  'Ignite':    'SummonerDot',
  'Ghost':     'SummonerHaste',
  'Exhaust':   'SummonerExhaust',
  'Barrier':   'SummonerBarrier',
  'Heal':      'SummonerHeal',
  'Smite':     'SummonerSmite',
  'Cleanse':   'SummonerBoost',
  'Mark':      'SummonerSnowball',
};
export function getSpellKey(name) { return SPELL_KEYS[name] ?? null; }

let cachedItemsMap = null;
export async function loadItemsData(version) {
  if (cachedItemsMap) return cachedItemsMap;
  const v = version || await getLatestVersion();
  const res = await fetch(`${DDRAGON_BASE}/cdn/${v}/data/en_US/item.json`);
  const data = await res.json();
  cachedItemsMap = {};
  for (const [id, item] of Object.entries(data.data)) {
    cachedItemsMap[item.name.toLowerCase()] = id;
  }
  return cachedItemsMap;
}

// Map internal champion IDs to Data Dragon keys
export const DD_KEYS = {
  'garen': 'Garen',
  'darius': 'Darius',
  'fiora': 'Fiora',
  'malphite': 'Malphite',
  'camille': 'Camille',
  "cho'gath": 'Chogath',
  'renekton': 'Renekton',
  'teemo': 'Teemo',
  'nasus': 'Nasus',
  'jayce': 'Jayce',
  'shen': 'Shen',
  'urgot': 'Urgot',
  'vi': 'Vi',
  'hecarim': 'Hecarim',
  'warwick': 'Warwick',
  'lee sin': 'LeeSin',
  'nidalee': 'Nidalee',
  'amumu': 'Amumu',
  'kindred': 'Kindred',
  'master yi': 'MasterYi',
  'ekko': 'Ekko',
  'graves': 'Graves',
  'nunu': 'Nunu',
  'yasuo': 'Yasuo',
  'zed': 'Zed',
  'lux': 'Lux',
  'syndra': 'Syndra',
  'annie': 'Annie',
  'ahri': 'Ahri',
  'orianna': 'Orianna',
  'veigar': 'Veigar',
  'fizz': 'Fizz',
  'viktor': 'Viktor',
  'jinx': 'Jinx',
  'caitlyn': 'Caitlyn',
  'ezreal': 'Ezreal',
  'jhin': 'Jhin',
  'ashe': 'Ashe',
  'vayne': 'Vayne',
  'miss fortune': 'MissFortune',
  'draven': 'Draven',
  'tristana': 'Tristana',
  'sivir': 'Sivir',
  'thresh': 'Thresh',
  'leona': 'Leona',
  'lulu': 'Lulu',
  'blitzcrank': 'Blitzcrank',
  'nami': 'Nami',
  'nautilus': 'Nautilus',
  'soraka': 'Soraka',
  'janna': 'Janna',
  'morgana': 'Morgana',
  'pyke': 'Pyke',
};

export function getChampionUrl(championId, version) {
  const key = DD_KEYS[championId];
  if (!key || !version) return null;
  return getChampionImageUrl(key, version);
}

// Map LCU numeric champion key → lowercase name (e.g. 86 → "garen")
let cachedKeyMap = null;
// Map LCU numeric champion key → DataDragon key (e.g. 103 → "Ahri")
let cachedKeyMapDd = null;

export async function getChampionKeyMap(version) {
  if (cachedKeyMap) return cachedKeyMap;
  try {
    const v = version || (await getLatestVersion());
    const res = await fetch(`${DDRAGON_BASE}/cdn/${v}/data/en_US/champion.json`);
    const data = await res.json();
    const map = {};
    cachedKeyMapDd = {};
    for (const champ of Object.values(data.data)) {
      const num = parseInt(champ.key);
      map[num] = champ.name.toLowerCase();
      cachedKeyMapDd[num] = champ.id; // e.g. "Ahri", "LeeSin"
    }
    cachedKeyMap = map;
    return map;
  } catch {
    return {};
  }
}

// Get champion square icon URL from numeric LCU championId
export async function getChampionIconByKey(champId, version) {
  if (!cachedKeyMapDd) await getChampionKeyMap(version);
  const ddKey = cachedKeyMapDd?.[champId];
  if (!ddKey || !version) return null;
  return getChampionImageUrl(ddKey, version);
}

// Summoner profile icon
export function getProfileIconUrl(iconId, version) {
  return `${DDRAGON_BASE}/cdn/${version}/img/profileicon/${iconId}.png`;
}

// Community Dragon role icon URL
const CDRAGON_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/positions';
export const ROLE_ICON_URLS = {
  TOP:     `${CDRAGON_BASE}/icon-position-top.svg`,
  JUNGLE:  `${CDRAGON_BASE}/icon-position-jungle.svg`,
  MID:     `${CDRAGON_BASE}/icon-position-middle.svg`,
  MIDDLE:  `${CDRAGON_BASE}/icon-position-middle.svg`,
  ADC:     `${CDRAGON_BASE}/icon-position-bottom.svg`,
  BOTTOM:  `${CDRAGON_BASE}/icon-position-bottom.svg`,
  SUPPORT: `${CDRAGON_BASE}/icon-position-utility.svg`,
  UTILITY: `${CDRAGON_BASE}/icon-position-utility.svg`,
  FILL:    `${CDRAGON_BASE}/icon-position-fill.svg`,
};

// Community Dragon ranked emblem URL
export function getRankedEmblemUrl(tier) {
  const t = tier?.toLowerCase();
  if (!t || t === 'unranked') return null;
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblems/emblem-${t}.png`;
}
