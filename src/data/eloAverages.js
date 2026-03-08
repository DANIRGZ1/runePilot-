/**
 * Elo-tier benchmark statistics
 *
 * Source: aggregated high-elo data from u.gg / lolalytics patterns (patch 26.x).
 * Used by postGameAnalyzer to compare a player's performance against their tier's
 * expected numbers.
 *
 * Metrics per role per tier:
 *   csPerMin          — farm efficiency
 *   kda               — (kills + assists) / max(deaths, 1)
 *   killParticipation — (kills + assists) / team total kills
 *   damageShare       — player damage / total team damage (non-support)
 *   visionScorePerMin — wards placed / game minutes
 *   goldPerMin        — gold income efficiency
 *   deathsPerGame     — expected deaths
 *   killsPerGame      — expected kills
 *   firstDeathMin     — avg first death time (minutes)
 *   objectiveParticip — % team objectives player is present for
 */

const BASE = {
  TOP: {
    IRON:        { csPerMin: 4.0, kda: 1.7, killParticipation: 0.45, damageShare: 0.22, visionScorePerMin: 0.40, goldPerMin: 280, deathsPerGame: 7.2, killsPerGame: 3.5, firstDeathMin: 6.5,  objectiveParticip: 0.45 },
    BRONZE:      { csPerMin: 4.8, kda: 1.9, killParticipation: 0.47, damageShare: 0.23, visionScorePerMin: 0.45, goldPerMin: 300, deathsPerGame: 6.5, killsPerGame: 3.8, firstDeathMin: 7.0,  objectiveParticip: 0.50 },
    SILVER:      { csPerMin: 5.5, kda: 2.1, killParticipation: 0.50, damageShare: 0.24, visionScorePerMin: 0.50, goldPerMin: 320, deathsPerGame: 5.8, killsPerGame: 4.1, firstDeathMin: 7.5,  objectiveParticip: 0.55 },
    GOLD:        { csPerMin: 6.2, kda: 2.4, killParticipation: 0.52, damageShare: 0.24, visionScorePerMin: 0.58, goldPerMin: 345, deathsPerGame: 5.2, killsPerGame: 4.5, firstDeathMin: 8.2,  objectiveParticip: 0.60 },
    PLATINUM:    { csPerMin: 6.8, kda: 2.7, killParticipation: 0.54, damageShare: 0.25, visionScorePerMin: 0.68, goldPerMin: 365, deathsPerGame: 4.8, killsPerGame: 4.9, firstDeathMin: 8.8,  objectiveParticip: 0.65 },
    EMERALD:     { csPerMin: 7.2, kda: 2.9, killParticipation: 0.55, damageShare: 0.25, visionScorePerMin: 0.76, goldPerMin: 385, deathsPerGame: 4.4, killsPerGame: 5.2, firstDeathMin: 9.2,  objectiveParticip: 0.68 },
    DIAMOND:     { csPerMin: 7.8, kda: 3.2, killParticipation: 0.57, damageShare: 0.26, visionScorePerMin: 0.88, goldPerMin: 405, deathsPerGame: 4.0, killsPerGame: 5.6, firstDeathMin: 9.8,  objectiveParticip: 0.72 },
    MASTER:      { csPerMin: 8.5, kda: 3.8, killParticipation: 0.60, damageShare: 0.27, visionScorePerMin: 1.05, goldPerMin: 430, deathsPerGame: 3.5, killsPerGame: 6.2, firstDeathMin: 10.5, objectiveParticip: 0.78 },
    GRANDMASTER: { csPerMin: 9.0, kda: 4.2, killParticipation: 0.62, damageShare: 0.27, visionScorePerMin: 1.15, goldPerMin: 450, deathsPerGame: 3.2, killsPerGame: 6.8, firstDeathMin: 11.0, objectiveParticip: 0.82 },
    CHALLENGER:  { csPerMin: 9.5, kda: 4.8, killParticipation: 0.64, damageShare: 0.28, visionScorePerMin: 1.25, goldPerMin: 470, deathsPerGame: 2.9, killsPerGame: 7.3, firstDeathMin: 11.5, objectiveParticip: 0.85 },
  },

  JUNGLE: {
    IRON:        { csPerMin: 3.5, kda: 1.6, killParticipation: 0.52, damageShare: 0.18, visionScorePerMin: 0.45, goldPerMin: 265, deathsPerGame: 6.5, killsPerGame: 4.2, firstDeathMin: 5.5,  objectiveParticip: 0.60 },
    BRONZE:      { csPerMin: 4.2, kda: 1.8, killParticipation: 0.54, damageShare: 0.19, visionScorePerMin: 0.50, goldPerMin: 285, deathsPerGame: 5.8, killsPerGame: 4.6, firstDeathMin: 6.0,  objectiveParticip: 0.65 },
    SILVER:      { csPerMin: 4.8, kda: 2.0, killParticipation: 0.57, damageShare: 0.20, visionScorePerMin: 0.58, goldPerMin: 305, deathsPerGame: 5.2, killsPerGame: 5.0, firstDeathMin: 6.5,  objectiveParticip: 0.70 },
    GOLD:        { csPerMin: 5.4, kda: 2.3, killParticipation: 0.60, damageShare: 0.20, visionScorePerMin: 0.68, goldPerMin: 325, deathsPerGame: 4.7, killsPerGame: 5.5, firstDeathMin: 7.2,  objectiveParticip: 0.75 },
    PLATINUM:    { csPerMin: 6.0, kda: 2.6, killParticipation: 0.62, damageShare: 0.21, visionScorePerMin: 0.80, goldPerMin: 345, deathsPerGame: 4.3, killsPerGame: 5.9, firstDeathMin: 7.8,  objectiveParticip: 0.80 },
    EMERALD:     { csPerMin: 6.5, kda: 2.8, killParticipation: 0.64, damageShare: 0.21, visionScorePerMin: 0.90, goldPerMin: 365, deathsPerGame: 4.0, killsPerGame: 6.3, firstDeathMin: 8.3,  objectiveParticip: 0.83 },
    DIAMOND:     { csPerMin: 7.0, kda: 3.1, killParticipation: 0.66, damageShare: 0.22, visionScorePerMin: 1.00, goldPerMin: 385, deathsPerGame: 3.6, killsPerGame: 6.8, firstDeathMin: 8.8,  objectiveParticip: 0.87 },
    MASTER:      { csPerMin: 7.8, kda: 3.6, killParticipation: 0.70, damageShare: 0.23, visionScorePerMin: 1.15, goldPerMin: 410, deathsPerGame: 3.2, killsPerGame: 7.4, firstDeathMin: 9.5,  objectiveParticip: 0.91 },
    GRANDMASTER: { csPerMin: 8.2, kda: 4.0, killParticipation: 0.72, damageShare: 0.23, visionScorePerMin: 1.25, goldPerMin: 430, deathsPerGame: 2.9, killsPerGame: 8.0, firstDeathMin: 10.0, objectiveParticip: 0.93 },
    CHALLENGER:  { csPerMin: 8.8, kda: 4.5, killParticipation: 0.74, damageShare: 0.24, visionScorePerMin: 1.35, goldPerMin: 450, deathsPerGame: 2.6, killsPerGame: 8.6, firstDeathMin: 10.5, objectiveParticip: 0.95 },
  },

  MID: {
    IRON:        { csPerMin: 4.5, kda: 1.8, killParticipation: 0.48, damageShare: 0.24, visionScorePerMin: 0.38, goldPerMin: 290, deathsPerGame: 7.0, killsPerGame: 4.0, firstDeathMin: 6.0,  objectiveParticip: 0.52 },
    BRONZE:      { csPerMin: 5.2, kda: 2.0, killParticipation: 0.50, damageShare: 0.25, visionScorePerMin: 0.42, goldPerMin: 310, deathsPerGame: 6.3, killsPerGame: 4.4, firstDeathMin: 6.5,  objectiveParticip: 0.56 },
    SILVER:      { csPerMin: 6.0, kda: 2.2, killParticipation: 0.52, damageShare: 0.26, visionScorePerMin: 0.48, goldPerMin: 335, deathsPerGame: 5.6, killsPerGame: 4.9, firstDeathMin: 7.2,  objectiveParticip: 0.61 },
    GOLD:        { csPerMin: 6.8, kda: 2.5, killParticipation: 0.55, damageShare: 0.27, visionScorePerMin: 0.56, goldPerMin: 360, deathsPerGame: 5.0, killsPerGame: 5.4, firstDeathMin: 7.9,  objectiveParticip: 0.65 },
    PLATINUM:    { csPerMin: 7.3, kda: 2.8, killParticipation: 0.57, damageShare: 0.28, visionScorePerMin: 0.66, goldPerMin: 385, deathsPerGame: 4.6, killsPerGame: 5.9, firstDeathMin: 8.5,  objectiveParticip: 0.70 },
    EMERALD:     { csPerMin: 7.8, kda: 3.0, killParticipation: 0.58, damageShare: 0.28, visionScorePerMin: 0.75, goldPerMin: 405, deathsPerGame: 4.2, killsPerGame: 6.3, firstDeathMin: 9.0,  objectiveParticip: 0.73 },
    DIAMOND:     { csPerMin: 8.2, kda: 3.3, killParticipation: 0.60, damageShare: 0.29, visionScorePerMin: 0.88, goldPerMin: 425, deathsPerGame: 3.8, killsPerGame: 6.8, firstDeathMin: 9.5,  objectiveParticip: 0.77 },
    MASTER:      { csPerMin: 9.0, kda: 3.9, killParticipation: 0.63, damageShare: 0.30, visionScorePerMin: 1.05, goldPerMin: 450, deathsPerGame: 3.3, killsPerGame: 7.5, firstDeathMin: 10.2, objectiveParticip: 0.82 },
    GRANDMASTER: { csPerMin: 9.5, kda: 4.3, killParticipation: 0.65, damageShare: 0.31, visionScorePerMin: 1.15, goldPerMin: 470, deathsPerGame: 3.0, killsPerGame: 8.0, firstDeathMin: 10.8, objectiveParticip: 0.85 },
    CHALLENGER:  { csPerMin: 10.0,kda: 4.8, killParticipation: 0.67, damageShare: 0.32, visionScorePerMin: 1.25, goldPerMin: 490, deathsPerGame: 2.7, killsPerGame: 8.6, firstDeathMin: 11.2, objectiveParticip: 0.88 },
  },

  ADC: {
    IRON:        { csPerMin: 4.8, kda: 2.0, killParticipation: 0.42, damageShare: 0.28, visionScorePerMin: 0.30, goldPerMin: 295, deathsPerGame: 6.0, killsPerGame: 4.5, firstDeathMin: 6.8,  objectiveParticip: 0.48 },
    BRONZE:      { csPerMin: 5.5, kda: 2.2, killParticipation: 0.44, damageShare: 0.29, visionScorePerMin: 0.34, goldPerMin: 315, deathsPerGame: 5.4, killsPerGame: 4.9, firstDeathMin: 7.3,  objectiveParticip: 0.52 },
    SILVER:      { csPerMin: 6.2, kda: 2.5, killParticipation: 0.46, damageShare: 0.30, visionScorePerMin: 0.40, goldPerMin: 340, deathsPerGame: 4.8, killsPerGame: 5.4, firstDeathMin: 7.9,  objectiveParticip: 0.57 },
    GOLD:        { csPerMin: 7.0, kda: 2.8, killParticipation: 0.48, damageShare: 0.31, visionScorePerMin: 0.47, goldPerMin: 368, deathsPerGame: 4.3, killsPerGame: 6.0, firstDeathMin: 8.6,  objectiveParticip: 0.62 },
    PLATINUM:    { csPerMin: 7.6, kda: 3.1, killParticipation: 0.50, damageShare: 0.32, visionScorePerMin: 0.56, goldPerMin: 395, deathsPerGame: 3.9, killsPerGame: 6.5, firstDeathMin: 9.2,  objectiveParticip: 0.66 },
    EMERALD:     { csPerMin: 8.1, kda: 3.4, killParticipation: 0.51, damageShare: 0.32, visionScorePerMin: 0.63, goldPerMin: 415, deathsPerGame: 3.5, killsPerGame: 7.0, firstDeathMin: 9.7,  objectiveParticip: 0.70 },
    DIAMOND:     { csPerMin: 8.7, kda: 3.7, killParticipation: 0.53, damageShare: 0.33, visionScorePerMin: 0.73, goldPerMin: 440, deathsPerGame: 3.2, killsPerGame: 7.5, firstDeathMin: 10.2, objectiveParticip: 0.74 },
    MASTER:      { csPerMin: 9.5, kda: 4.3, killParticipation: 0.56, damageShare: 0.34, visionScorePerMin: 0.88, goldPerMin: 465, deathsPerGame: 2.8, killsPerGame: 8.2, firstDeathMin: 11.0, objectiveParticip: 0.79 },
    GRANDMASTER: { csPerMin: 10.0,kda: 4.7, killParticipation: 0.58, damageShare: 0.35, visionScorePerMin: 0.96, goldPerMin: 485, deathsPerGame: 2.5, killsPerGame: 8.8, firstDeathMin: 11.5, objectiveParticip: 0.82 },
    CHALLENGER:  { csPerMin: 10.6,kda: 5.2, killParticipation: 0.60, damageShare: 0.36, visionScorePerMin: 1.05, goldPerMin: 505, deathsPerGame: 2.3, killsPerGame: 9.4, firstDeathMin: 12.0, objectiveParticip: 0.85 },
  },

  SUPPORT: {
    IRON:        { csPerMin: 0.5, kda: 2.0, killParticipation: 0.55, damageShare: 0.08, visionScorePerMin: 0.85, goldPerMin: 195, deathsPerGame: 7.0, killsPerGame: 1.5, firstDeathMin: 5.8,  objectiveParticip: 0.65 },
    BRONZE:      { csPerMin: 0.6, kda: 2.2, killParticipation: 0.57, damageShare: 0.09, visionScorePerMin: 0.95, goldPerMin: 210, deathsPerGame: 6.4, killsPerGame: 1.7, firstDeathMin: 6.3,  objectiveParticip: 0.70 },
    SILVER:      { csPerMin: 0.7, kda: 2.5, killParticipation: 0.60, damageShare: 0.09, visionScorePerMin: 1.05, goldPerMin: 225, deathsPerGame: 5.8, killsPerGame: 1.9, firstDeathMin: 6.9,  objectiveParticip: 0.74 },
    GOLD:        { csPerMin: 0.8, kda: 2.8, killParticipation: 0.63, damageShare: 0.10, visionScorePerMin: 1.18, goldPerMin: 242, deathsPerGame: 5.2, killsPerGame: 2.2, firstDeathMin: 7.6,  objectiveParticip: 0.79 },
    PLATINUM:    { csPerMin: 0.9, kda: 3.2, killParticipation: 0.66, damageShare: 0.10, visionScorePerMin: 1.32, goldPerMin: 258, deathsPerGame: 4.7, killsPerGame: 2.4, firstDeathMin: 8.2,  objectiveParticip: 0.83 },
    EMERALD:     { csPerMin: 1.0, kda: 3.5, killParticipation: 0.68, damageShare: 0.11, visionScorePerMin: 1.45, goldPerMin: 272, deathsPerGame: 4.3, killsPerGame: 2.6, firstDeathMin: 8.7,  objectiveParticip: 0.86 },
    DIAMOND:     { csPerMin: 1.1, kda: 3.8, killParticipation: 0.70, damageShare: 0.11, visionScorePerMin: 1.60, goldPerMin: 288, deathsPerGame: 3.9, killsPerGame: 2.9, firstDeathMin: 9.3,  objectiveParticip: 0.89 },
    MASTER:      { csPerMin: 1.2, kda: 4.4, killParticipation: 0.73, damageShare: 0.12, visionScorePerMin: 1.80, goldPerMin: 308, deathsPerGame: 3.4, killsPerGame: 3.2, firstDeathMin: 10.0, objectiveParticip: 0.92 },
    GRANDMASTER: { csPerMin: 1.3, kda: 4.9, killParticipation: 0.75, damageShare: 0.12, visionScorePerMin: 1.95, goldPerMin: 325, deathsPerGame: 3.1, killsPerGame: 3.5, firstDeathMin: 10.5, objectiveParticip: 0.94 },
    CHALLENGER:  { csPerMin: 1.4, kda: 5.4, killParticipation: 0.77, damageShare: 0.13, visionScorePerMin: 2.10, goldPerMin: 342, deathsPerGame: 2.8, killsPerGame: 3.8, firstDeathMin: 11.0, objectiveParticip: 0.96 },
  },
};

/** Alias: SUPPORT for players in the SUPPORT role slot */
BASE.SUPPORT_ROLE = BASE.SUPPORT;

/**
 * Get benchmark stats for a given tier and role.
 * Falls back gracefully for missing combinations.
 */
export function getEloAvg(tier = 'GOLD', role = 'MID') {
  const normTier = tier?.toUpperCase() || 'GOLD';
  const normRole = role?.toUpperCase() || 'MID';

  // Map role aliases
  const roleKey = normRole === 'ADC' ? 'ADC'
    : normRole === 'JUNGLE' ? 'JUNGLE'
    : normRole === 'TOP'    ? 'TOP'
    : normRole === 'SUPPORT' ? 'SUPPORT'
    : 'MID';

  return (BASE[roleKey]?.[normTier]) || BASE.MID.GOLD;
}

/**
 * Tier display order for UI rank selectors
 */
export const TIERS_ORDERED = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD',
  'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
];

export default BASE;
