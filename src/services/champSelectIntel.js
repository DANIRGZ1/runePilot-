/**
 * Champion Select Intelligence Engine
 *
 * Produces ranked champion recommendations based on four weighted dimensions:
 *
 *  COUNTER score  (0–30 pts) — how well this champ fares vs enemy picks
 *  SYNERGY score  (0–25 pts) — how well this champ pairs with allied picks
 *  NEED score     (0–25 pts) — what the team composition is missing
 *  META score     (0–20 pts) — win-rate + tier standing in current patch
 *
 * Total: 0–100 pts, displayed as a colour-coded breakdown bar.
 *
 * Secondary outputs:
 *  analyzeComp(team)  — power curve, damage split, engage/peel scores
 *  getThreatLevel(enemy, candidate) — HIGH / MED / LOW threat badge
 *  getSynergyLabel(ally, candidate) — synergy indicator for allied picks
 */

import { COUNTERS, SYNERGIES, PROFILES } from '../data/counters';
import { getBuild }                       from '../data/builds';

/* ══════════════════════════════════════════════════════════
   Weights (sum = 100)
══════════════════════════════════════════════════════════ */
const W = { counter: 30, synergy: 25, need: 25, meta: 20 };

/* ══════════════════════════════════════════════════════════
   Utility helpers
══════════════════════════════════════════════════════════ */

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Flat array of champion objects from a team map { TOP: champ|null, ... } */
function teamPicks(teamMap) {
  return Object.values(teamMap || {}).filter(Boolean);
}

/** Normalised champion id for data lookups (lowercase, no accents) */
const normId = (c) => c?.id?.toLowerCase() ?? '';

/* ══════════════════════════════════════════════════════════
   1. COUNTER SCORE
   Measures how well `candidate` performs against the enemy team.
   +10  per enemy pick this champ hard-counters
   -15  per enemy pick that hard-counters this champ
   Partial credit (+4/-6) for tag-based soft counters when
   no explicit matchup data exists.
══════════════════════════════════════════════════════════ */
export function calcCounterScore(candidate, enemies) {
  const picks  = teamPicks(enemies);
  if (!picks.length) return 0;

  const cid   = normId(candidate);
  const cdata = COUNTERS[cid] || {};
  const beats      = new Set(cdata.beats    || []);
  const loses_to   = new Set(cdata.loses_to || []);

  let raw = 0;
  for (const enemy of picks) {
    const eid = normId(enemy);
    if (beats.has(eid))    raw += 10;
    else if (loses_to.has(eid)) raw -= 15;
    else {
      // Tag-based soft heuristics
      // Tanks beat assassins in lane; poke beats melees, etc.
      const cTags  = candidate.tags || [];
      const eTags  = enemy.tags     || [];
      if (cTags.includes('tank') && eTags.includes('assassin'))  raw += 4;
      if (cTags.includes('ranged') && !eTags.includes('ranged')) raw += 3;
      if (eTags.includes('tank') && cTags.includes('mage') && candidate.damage === 'AP') raw += 2;
    }
  }

  // Normalise to 0..W.counter
  const max = picks.length * 10;  // best case: beats every enemy
  return clamp(Math.round((raw / max) * W.counter + W.counter / 2), 0, W.counter);
}

/* ══════════════════════════════════════════════════════════
   2. SYNERGY SCORE
   Measures how well `candidate` pairs with allied picks.
   +8 per explicit synergy match
   +3 for tag-based soft synergy (engage pairs with follow-up, etc.)
══════════════════════════════════════════════════════════ */
export function calcSynergyScore(candidate, allies) {
  const picks = teamPicks(allies);
  if (!picks.length) return W.synergy / 2; // neutral when no allies yet

  const cid     = normId(candidate);
  const cSynSet = new Set(SYNERGIES[cid] || []);

  let pts = 0;
  for (const ally of picks) {
    const aid = normId(ally);
    // Explicit synergy in either direction
    if (cSynSet.has(aid)) { pts += 8; continue; }
    const aSynSet = new Set(SYNERGIES[aid] || []);
    if (aSynSet.has(cid)) { pts += 8; continue; }

    // Tag-based soft synergy
    const cp = PROFILES[cid] || {};
    const ap = PROFILES[aid] || {};
    if (cp.engage >= 2 && ap.burst >= 2) pts += 3;  // engage + burst follow
    if (cp.peel  >= 2 && ally.role === 'ADC') pts += 3;  // protector + carry
    if (cp.cc    >= 2 && ap.burst >= 2) pts += 2;   // lockdown + execute
  }

  const max = picks.length * 8;
  return clamp(Math.round((pts / max) * W.synergy + W.synergy * 0.3), 0, W.synergy);
}

/* ══════════════════════════════════════════════════════════
   3. COMPOSITION NEED SCORE
   What the team is missing — and does this champion fill it?
══════════════════════════════════════════════════════════ */
export function calcNeedScore(candidate, allies) {
  const picks  = teamPicks(allies);
  const cp     = PROFILES[normId(candidate)] || {};

  let pts = 0;

  if (!picks.length) return W.need / 2;

  const allProfiles = picks.map((c) => PROFILES[normId(c)] || {});
  const sum = (key) => allProfiles.reduce((acc, p) => acc + (p[key] || 0), 0);

  const totalEngage   = sum('engage');
  const totalPeel     = sum('peel');
  const totalCC       = sum('cc');
  const totalWaveclear = sum('waveclear');
  const totalMobility = sum('mobility');

  const adCount  = picks.filter((c) => c.damage === 'AD').length;
  const apCount  = picks.filter((c) => c.damage === 'AP').length;

  // Damage balance need
  if (adCount >= 3 && candidate.damage === 'AP') pts += 8;
  if (apCount >= 3 && candidate.damage === 'AD') pts += 8;

  // Engage need
  if (totalEngage < 2 && cp.engage >= 2) pts += 7;
  else if (totalEngage < 1 && cp.engage >= 1) pts += 4;

  // Peel need
  if (totalPeel < 1 && cp.peel >= 2) pts += 5;

  // CC need
  if (totalCC < 3 && cp.cc >= 2) pts += 4;

  // Waveclear need
  if (totalWaveclear < 2 && cp.waveclear >= 2) pts += 3;

  // Mobility need (escape tools)
  if (totalMobility < 2 && cp.mobility >= 2) pts += 3;

  // Scaling balance
  const latePicks = allProfiles.filter((p) => p.scaling === 'late').length;
  const earlyPicks = allProfiles.filter((p) => p.scaling === 'early').length;
  if (latePicks === 0 && cp.scaling === 'late')  pts += 4;
  if (earlyPicks === 0 && cp.scaling === 'early') pts += 3;

  return clamp(pts, 0, W.need);
}

/* ══════════════════════════════════════════════════════════
   4. META SCORE
   Based on win-rate in current patch and build tier.
══════════════════════════════════════════════════════════ */
export function calcMetaScore(candidate) {
  const wr    = candidate.winRate || 50;
  const tier  = getBuild(candidate.id)?.tier || 'B';

  // winRate contribution: 50% WR → ~10 pts, 54% → max, below 48% → near 0
  const wrPts = clamp(Math.round((wr - 47) * 2.5), 0, 15);

  const tierPts = { S: 5, A: 4, B: 2, C: 0 }[tier] ?? 2;

  return clamp(wrPts + tierPts, 0, W.meta);
}

/* ══════════════════════════════════════════════════════════
   RECOMMENDATION ENGINE
   Returns top-N champions with score breakdown for `role`,
   excluding already-picked or banned champions.
══════════════════════════════════════════════════════════ */
export function getRecommendations({ role, allies, enemies, banned = new Set(), allChamps, count = 5 }) {
  const usedIds = new Set([
    ...teamPicks(allies).map(normId),
    ...teamPicks(enemies).map(normId),
    ...[...banned].map((id) => id.toLowerCase()),
  ]);

  const pool = allChamps.filter(
    (c) => c.role === role && !usedIds.has(normId(c))
  );

  const scored = pool.map((c) => {
    const counter = calcCounterScore(c, enemies);
    const synergy = calcSynergyScore(c, allies);
    const need    = calcNeedScore(c, allies);
    const meta    = calcMetaScore(c);
    const total   = counter + synergy + need + meta;
    return { champion: c, total, breakdown: { counter, synergy, need, meta } };
  });

  return scored
    .sort((a, b) => b.total - a.total)
    .slice(0, count);
}

/* ══════════════════════════════════════════════════════════
   THREAT LEVEL
   For a specific enemy pick: how dangerous is it for `candidate`?
══════════════════════════════════════════════════════════ */
export function getThreatLevel(enemy, candidate) {
  if (!enemy || !candidate) return 'LOW';
  const cid    = normId(candidate);
  const eid    = normId(enemy);
  const cdata  = COUNTERS[cid] || {};

  if ((cdata.loses_to || []).includes(eid)) return 'HIGH';

  // Check if the enemy counters any common champ similar to candidate
  const enemyData = COUNTERS[eid] || {};
  if ((enemyData.beats || []).includes(cid)) return 'HIGH';

  // Tag-based
  const eTags = enemy.tags || [];
  const cTags = candidate?.tags || [];
  if (eTags.includes('assassin') && cTags.includes('mage')) return 'MED';
  if (!cTags.includes('tank') && eTags.includes('juggernaut'))   return 'MED';

  return 'LOW';
}

/* ══════════════════════════════════════════════════════════
   COMPOSITION ANALYSIS
   Evaluates a partial or complete team composition and
   returns structured data for the UI bars.
══════════════════════════════════════════════════════════ */
export function analyzeComp(teamMap) {
  const picks = teamPicks(teamMap);
  if (!picks.length) return null;

  const profiles = picks.map((c) => PROFILES[normId(c)] || {});
  const sum = (key) => profiles.reduce((acc, p) => acc + (p[key] || 0), 0);

  // Damage split
  const adCount    = picks.filter((c) => c.damage === 'AD').length;
  const apCount    = picks.filter((c) => c.damage === 'AP').length;
  const mixedCount = picks.filter((c) => c.damage === 'MIXED').length;

  // Power curve (weighted average toward early/mid/late)
  const scaleMap   = { early: 1, mid: 2, late: 3 };
  const avgScale   = profiles.reduce((acc, p) => acc + (scaleMap[p.scaling] || 2), 0) / (profiles.length || 1);
  const powerCurve = avgScale < 1.7 ? 'early' : avgScale > 2.3 ? 'late' : 'mid';

  // Team aggregate traits (0-1 normalised per pick)
  const n = picks.length || 1;
  const engage    = sum('engage')    / (n * 3);
  const peel      = sum('peel')      / (n * 3);
  const cc        = sum('cc')        / (n * 3);
  const poke      = sum('poke')      / (n * 3);
  const burst     = sum('burst')     / (n * 3);
  const waveclear = sum('waveclear') / (n * 3);
  const mobility  = sum('mobility')  / (n * 3);

  // Average winrate
  const avgWinRate = picks.reduce((acc, c) => acc + (c.winRate || 50), 0) / n;

  // Named strengths / weaknesses for tooltip
  const strengths  = [];
  const weaknesses = [];

  if (engage >= 0.6)     strengths.push('Fuerte engage');
  else if (engage < 0.2) weaknesses.push('Sin engage');
  if (peel >= 0.5)       strengths.push('Buen peel');
  if (cc >= 0.6)         strengths.push('Mucho CC');
  else if (cc < 0.2)     weaknesses.push('Poco CC');
  if (adCount >= 4)      weaknesses.push('Muy AD — armadura countera al equipo');
  if (apCount >= 4)      weaknesses.push('Muy AP — RM countera al equipo');
  if (adCount >= 2 && apCount >= 2) strengths.push('Daño mixto');
  if (poke >= 0.5)       strengths.push('Alto poke');
  if (powerCurve === 'late' && engage < 0.3) weaknesses.push('Sin forza de engage para late');
  if (burst >= 0.6)      strengths.push('Alta capacidad de burst');
  if (mobility < 0.2)    weaknesses.push('Equipo lento — vulnerable a kite');

  return {
    adCount, apCount, mixedCount,
    powerCurve,
    engage, peel, cc, poke, burst, waveclear, mobility,
    avgWinRate: +avgWinRate.toFixed(1),
    strengths, weaknesses,
  };
}

/* ══════════════════════════════════════════════════════════
   SYNERGY LABEL
   Does candidate synergise with a specific ally?
══════════════════════════════════════════════════════════ */
export function getSynergyLabel(ally, candidate) {
  if (!ally || !candidate) return null;
  const cid = normId(candidate);
  const aid = normId(ally);
  const cSyn = SYNERGIES[cid] || [];
  const aSyn = SYNERGIES[aid] || [];
  if (cSyn.includes(aid) || aSyn.includes(cid)) return 'STRONG';
  return null;
}
