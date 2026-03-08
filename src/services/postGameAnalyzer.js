/**
 * Post-Game Analytics Engine
 *
 * Transforms raw LCU end-of-game data into structured metrics,
 * comparisons vs elo average + personal history, auto-insights,
 * and key error detection.
 *
 * Pipeline:
 *  1. parseEOGBlock(eog)         → normalised PlayerStats
 *  2. buildHistoryAvg(games)     → PersonalAvg (last N games)
 *  3. compareVsElo(stats, avg)   → EloComparison deltas
 *  4. compareVsHistory(stats, h) → HistoryComparison deltas
 *  5. generateInsights(...)      → Insight[] with severity + category
 *  6. detectErrors(stats, evts)  → Error[] with timing + suggestion
 */

import { getEloAvg } from '../data/eloAverages';

/* ══════════════════════════════════════════════════════════
   1. PARSE EOG STATS BLOCK
   LCU returns `stats` with ALL_CAPS field names.
   We normalise into a flat, typed object.
══════════════════════════════════════════════════════════ */

/**
 * Parse LCU /lol-end-of-game/v1/eogStatsBlock (or history game participant)
 * into a unified PlayerStats object.
 *
 * @param {object} rawPlayer — player object from EOG block or history
 * @param {number} durationSecs — game duration in seconds
 * @param {object} teamStats — { totalKills, totalDamage } aggregates
 * @returns {PlayerStats}
 */
export function parseEOGPlayer(rawPlayer, durationSecs, teamStats = {}) {
  const s = rawPlayer.stats || rawPlayer; // EOG uses .stats, history uses top-level

  // Normalise both formats: EOG (ALL_CAPS) and history (camelCase)
  const g = (key, fallback = 0) => {
    if (s[key] !== undefined) return +s[key] || 0;
    // camelCase fallback for match history
    const cc = key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    return s[cc] !== undefined ? +s[cc] || 0 : fallback;
  };

  const kills   = g('CHAMPIONS_KILLED') || g('kills');
  const deaths  = g('NUM_DEATHS')        || g('deaths');
  const assists = g('ASSISTS')           || g('assists');
  const mins    = durationSecs / 60;

  const cs          = (g('TOTAL_MINIONS_KILLED') || g('totalMinionsKilled')) + (g('NEUTRAL_MINIONS_KILLED') || g('neutralMinionsKilled'));
  const damage      = g('TOTAL_DAMAGE_DEALT_TO_CHAMPIONS') || g('totalDamageDealtToChampions');
  const damageTaken = g('TOTAL_DAMAGE_TAKEN')              || g('totalDamageTaken');
  const adDmg       = g('PHYSICAL_DAMAGE_DEALT_TO_CHAMPIONS') || g('physicalDamageDealtToChampions');
  const apDmg       = g('MAGIC_DAMAGE_DEALT_TO_CHAMPIONS')    || g('magicDamageDealtToChampions');
  const trueDmg     = g('TRUE_DAMAGE_DEALT_TO_CHAMPIONS')     || g('trueDamageDealtToChampions');
  const gold        = g('GOLD_EARNED') || g('goldEarned');
  const visionScore = g('VISION_SCORE') || g('visionScore');
  const wardsPlaced = g('WARD_PLACED')  || g('wardsPlaced');
  const wardsKilled = g('WARD_KILLED')  || g('wardsKilled');
  const cc          = g('TOTAL_TIME_CROWD_CONTROL_DEALT') || g('totalTimeCrowdControlDealt');
  const healed      = g('TOTAL_HEAL')   || g('totalHeal');
  const turrets     = g('TURRETS_KILLED') || g('turretKills');
  const firstBlood  = g('FIRST_BLOOD_KILL') || g('firstBloodKill') ? true : false;
  const doubleKills = g('DOUBLE_KILLS') || g('doubleKills');
  const tripleKills = g('TRIPLE_KILLS') || g('tripleKills');
  const quadraKills = g('QUADRA_KILLS') || g('quadraKills');
  const pentaKills  = g('PENTA_KILLS')  || g('pentaKills');
  const win         = !!(g('WIN') || s.win);

  const kda           = (kills + assists) / Math.max(deaths, 1);
  const csPerMin      = cs / Math.max(mins, 1);
  const goldPerMin    = gold / Math.max(mins, 1);
  const visionPerMin  = visionScore / Math.max(mins, 1);
  const damageShare   = teamStats.totalDamage ? damage / teamStats.totalDamage : null;
  const kp            = teamStats.totalKills ? (kills + assists) / Math.max(teamStats.totalKills, 1) : null;

  return {
    // Raw counts
    kills, deaths, assists,
    cs, gold, damage, damageTaken,
    adDmg, apDmg, trueDmg,
    visionScore, wardsPlaced, wardsKilled, cc, healed, turrets,
    firstBlood, doubleKills, tripleKills, quadraKills, pentaKills,
    // Derived rates
    kda: +kda.toFixed(2),
    csPerMin: +csPerMin.toFixed(2),
    goldPerMin: +goldPerMin.toFixed(0),
    visionPerMin: +visionPerMin.toFixed(3),
    damageShare: damageShare !== null ? +damageShare.toFixed(3) : null,
    killParticipation: kp !== null ? +kp.toFixed(3) : null,
    // Meta
    win,
    durationSecs,
    durationMins: +mins.toFixed(1),
  };
}

/**
 * Extract full EOG block into structured result with all 10 players.
 * Returns: { localPlayer, myTeam, enemyTeam, teamStats, gameData }
 */
export function parseFullEOG(eog) {
  if (!eog) return null;

  const durationSecs = eog.gameDuration || 0;
  const teams        = eog.teams || [];

  // Find local player across all teams
  let localRaw = null;
  let localTeamId = null;
  for (const team of teams) {
    for (const p of team.players || []) {
      if (p.isLocalPlayer) { localRaw = p; localTeamId = team.teamId; break; }
    }
    if (localRaw) break;
  }

  // Aggregate team totals for share calculations
  const myTeamPlayers    = [];
  const enemyTeamPlayers = [];

  for (const team of teams) {
    const isMyTeam = team.teamId === localTeamId;
    const players  = team.players || [];
    for (const p of players) {
      (isMyTeam ? myTeamPlayers : enemyTeamPlayers).push(p);
    }
  }

  const sumDmg  = (players) => players.reduce((acc, p) => acc + (+((p.stats||p).TOTAL_DAMAGE_DEALT_TO_CHAMPIONS || (p.stats||p).totalDamageDealtToChampions) || 0), 0);
  const sumKills= (players) => players.reduce((acc, p) => acc + (+((p.stats||p).CHAMPIONS_KILLED || (p.stats||p).kills) || 0), 0);

  const myTeamStats = {
    totalDamage: sumDmg(myTeamPlayers),
    totalKills:  sumKills(myTeamPlayers),
  };
  const enemyTeamStats = {
    totalDamage: sumDmg(enemyTeamPlayers),
    totalKills:  sumKills(enemyTeamPlayers),
  };

  const parseAll = (players, teamStats) =>
    players.map((p) => ({
      ...parseEOGPlayer(p, durationSecs, teamStats),
      summonerName: p.summonerName || p.displayName || '?',
      championName: p.championName || '?',
      championId:   p.championId   || 0,
      isLocalPlayer: p.isLocalPlayer || false,
    }));

  const myTeamParsed    = parseAll(myTeamPlayers, myTeamStats);
  const enemyTeamParsed = parseAll(enemyTeamPlayers, enemyTeamStats);

  const localPlayer = myTeamParsed.find((p) => p.isLocalPlayer) || myTeamParsed[0];

  return {
    localPlayer,
    myTeam:    myTeamParsed,
    enemyTeam: enemyTeamParsed,
    myTeamStats,
    gameId:    eog.gameId,
    queueId:   eog.queueId,
    gameCreation: eog.gameCreation,
    durationSecs,
  };
}

/* ══════════════════════════════════════════════════════════
   2. PERSONAL HISTORY AVERAGE
   Compute player's average over recent ranked games from
   LCU match history format.
══════════════════════════════════════════════════════════ */

export function buildHistoryAvg(historyGames = [], puuid, limit = 20) {
  const games = (Array.isArray(historyGames) ? historyGames : historyGames?.games?.games || [])
    .filter((g) => g.queueId === 420 || g.queueId === 440) // ranked only
    .slice(0, limit);

  if (!games.length) return null;

  const rows = games.map((game) => {
    const me = (game.participantIdentities || game.participants || []).find(
      (p) => p.player?.puuid === puuid || p.puuid === puuid
    );
    if (!me) return null;
    const stats = me.stats || me;
    return parseEOGPlayer(stats, game.gameDuration || 1800);
  }).filter(Boolean);

  if (!rows.length) return null;

  const avg = (key) => rows.reduce((a, r) => a + (r[key] || 0), 0) / rows.length;

  return {
    games: rows.length,
    kda:              +avg('kda').toFixed(2),
    csPerMin:         +avg('csPerMin').toFixed(2),
    goldPerMin:       +avg('goldPerMin').toFixed(0),
    visionPerMin:     +avg('visionPerMin').toFixed(3),
    kills:            +avg('kills').toFixed(1),
    deaths:           +avg('deaths').toFixed(1),
    assists:          +avg('assists').toFixed(1),
    damage:           +avg('damage').toFixed(0),
    visionScore:      +avg('visionScore').toFixed(1),
    wardsPlaced:      +avg('wardsPlaced').toFixed(1),
    wr:               +(rows.filter((r) => r.win).length / rows.length * 100).toFixed(1),
  };
}

/* ══════════════════════════════════════════════════════════
   3. COMPARISON HELPERS
   Returns { delta, pct, rating } for each metric.
   rating: 'excellent' | 'good' | 'average' | 'below' | 'poor'
══════════════════════════════════════════════════════════ */

function rate(pct) {
  if (pct >= 30)  return 'excellent';
  if (pct >= 10)  return 'good';
  if (pct >= -10) return 'average';
  if (pct >= -25) return 'below';
  return 'poor';
}

function cmp(actual, expected) {
  if (!expected || expected === 0) return { delta: 0, pct: 0, rating: 'average' };
  const delta = actual - expected;
  const pct   = +((delta / expected) * 100).toFixed(1);
  return { actual, expected, delta: +delta.toFixed(2), pct, rating: rate(pct) };
}

export function compareVsElo(stats, tier, role) {
  const avg = getEloAvg(tier, role);
  return {
    kda:              cmp(stats.kda,              avg.kda),
    csPerMin:         cmp(stats.csPerMin,         avg.csPerMin),
    visionPerMin:     cmp(stats.visionPerMin,     avg.visionScorePerMin),
    goldPerMin:       cmp(stats.goldPerMin,       avg.goldPerMin),
    killParticipation: stats.killParticipation !== null
      ? cmp(stats.killParticipation, avg.killParticipation) : null,
    damageShare:      stats.damageShare !== null
      ? cmp(stats.damageShare, avg.damageShare) : null,
    deaths:           cmp(avg.deathsPerGame, stats.deaths), // inverted: lower is better
  };
}

export function compareVsHistory(stats, histAvg) {
  if (!histAvg) return null;
  return {
    kda:          cmp(stats.kda,          histAvg.kda),
    csPerMin:     cmp(stats.csPerMin,     histAvg.csPerMin),
    visionPerMin: cmp(stats.visionPerMin, histAvg.visionPerMin),
    kills:        cmp(stats.kills,        histAvg.kills),
    deaths:       cmp(histAvg.deaths,     stats.deaths), // inverted
    damage:       cmp(stats.damage,       histAvg.damage),
  };
}

/* ══════════════════════════════════════════════════════════
   4. INSIGHT GENERATION
   Rule-based system producing actionable insight cards.
══════════════════════════════════════════════════════════ */

/**
 * @typedef {object} Insight
 * @property {'strength'|'warning'|'error'} severity
 * @property {'farming'|'vision'|'fighting'|'objectives'|'deaths'|'damage'|'macro'} category
 * @property {string} title
 * @property {string} body
 * @property {number} priority — lower = more important
 */

export function generateInsights(stats, vsElo, vsHistory, events = []) {
  const insights = [];

  const add = (severity, category, title, body, priority = 50) => {
    insights.push({ severity, category, title, body, priority });
  };

  const eloKDA        = vsElo?.kda;
  const eloCS         = vsElo?.csPerMin;
  const eloVision     = vsElo?.visionPerMin;
  const eloKP         = vsElo?.killParticipation;
  const eloDmg        = vsElo?.damageShare;

  /* ── KDA ── */
  if (eloKDA?.pct >= 35)
    add('strength', 'fighting', 'KDA excepcional', `${stats.kills}/${stats.deaths}/${stats.assists} — top 15% en tu elo. Excelente control de muertes.`, 5);
  else if (eloKDA?.pct >= 15)
    add('strength', 'fighting', 'Buen KDA', `${stats.kda} KDA, por encima de la media de tu elo (${eloKDA.expected}).`, 15);
  else if (eloKDA?.pct <= -25)
    add('error', 'fighting', 'KDA muy bajo', `${stats.kda} KDA vs ${eloKDA.expected} esperado en tu elo. Demasiadas muertes o poca participación.`, 2);
  else if (eloKDA?.pct <= -12)
    add('warning', 'fighting', 'KDA por debajo', `${stats.kda} KDA (${eloKDA.pct}% bajo la media). Enfócate en reducir muertes o ganar peleas.`, 10);

  /* ── CS / Farm ── */
  if (stats.durationMins >= 20) {
    if (eloCS?.pct >= 20)
      add('strength', 'farming', 'Farmeo eficiente', `${stats.csPerMin.toFixed(1)} CS/min — por encima de la media de tu elo (${eloCS.expected}).`, 20);
    else if (eloCS?.pct <= -20)
      add('error', 'farming', 'CS muy bajo', `${stats.csPerMin.toFixed(1)} CS/min vs ${eloCS.expected} esperado. Estás perdiendo recursos significativos en línea.`, 3);
    else if (eloCS?.pct <= -12)
      add('warning', 'farming', 'CS por debajo del promedio', `${stats.csPerMin.toFixed(1)} CS/min (${eloCS.pct}% bajo la media). Trabaja en no perder oleadas.`, 12);
  }

  /* ── Visión ── */
  if (eloVision?.pct >= 30)
    add('strength', 'vision', 'Control de visión sobresaliente', `${stats.visionScore} puntos de visión — top en tu elo. Excelente mapa controlado.`, 18);
  else if (eloVision?.pct <= -30)
    add('error', 'vision', 'Visión muy baja', `${stats.visionScore} puntos de visión (${eloVision.pct}% bajo la media). Coloca más wards y desactiva los rivales.`, 4);
  else if (eloVision?.pct <= -15)
    add('warning', 'vision', 'Visión por debajo del elo', `${stats.visionScore} puntos de visión. Añade wards de control y participa en desactivaciones.`, 14);

  /* ── Participación en kills ── */
  if (eloKP) {
    if (eloKP.pct >= 20)
      add('strength', 'fighting', 'Alta participación en peleas', `${Math.round((stats.killParticipation || 0) * 100)}% KP — estás en las peleas claves.`, 22);
    else if (eloKP.pct <= -20)
      add('warning', 'macro', 'Baja participación en kills', `${Math.round((stats.killParticipation || 0) * 100)}% KP. Acompaña más al equipo y rota cuando el mapa lo permita.`, 16);
  }

  /* ── Damage share ── */
  if (eloDmg) {
    if (eloDmg.pct >= 25)
      add('strength', 'damage', 'Daño dominante', `Hiciste el ${Math.round((stats.damageShare || 0) * 100)}% del daño de tu equipo — carry de la partida.`, 8);
    else if (eloDmg.pct <= -25)
      add('warning', 'damage', 'Bajo daño relativo', `Solo el ${Math.round((stats.damageShare || 0) * 100)}% del daño del equipo. Busca más trade pressure en línea y teamfights.`, 13);
  }

  /* ── Multi-kills ── */
  if (stats.pentaKills > 0)
    add('strength', 'fighting', '¡PENTA KILL!', 'Una de las mayores hazañas individuales en el juego. Momento decisivo.', 1);
  else if (stats.quadraKills > 0)
    add('strength', 'fighting', 'Quadra kill conseguida', 'Eliminación masiva que definió el ritmo de la partida.', 3);
  else if (stats.tripleKills >= 2)
    add('strength', 'fighting', `${stats.tripleKills} triple kills`, 'Consistencia en teamfights.', 12);

  /* ── First blood ── */
  if (stats.firstBlood)
    add('strength', 'fighting', 'First Blood', 'Conseguiste el primer kill — ventaja psicológica y económica en la línea.', 20);

  /* ── Deaths early (from events) ── */
  const deathEvents = events.filter((e) => e.EventName === 'ChampionKill' && e.victim === 'me');
  const earlyDeaths = deathEvents.filter((e) => e.EventTime < 600).length; // before min 10
  if (earlyDeaths >= 2)
    add('error', 'deaths', `${earlyDeaths} muertes antes del minuto 10`, 'Las muertes en early game aceleran el tempo enemigo y frenan tu experiencia y gold.', 6);
  else if (earlyDeaths === 1)
    add('warning', 'deaths', 'Muerte antes del minuto 10', 'Una muerte early retrasa el primer back óptimo. Juega más seguro en la next partida.', 25);

  /* ── Objective comparison vs history ── */
  if (vsHistory) {
    if (vsHistory.kda?.pct >= 25)
      add('strength', 'fighting', 'Mejor KDA que tu promedio personal', `${stats.kda} KDA vs tu media de ${vsHistory.kda.expected}. Partida por encima de tu nivel habitual.`, 30);
    if (vsHistory.csPerMin?.pct <= -20)
      add('warning', 'farming', 'Farm bajo para ti', `${stats.csPerMin.toFixed(1)} CS/min vs tu media de ${vsHistory.csPerMin.expected}. Día por debajo de tu propio nivel.`, 28);
  }

  /* ── Turrets ── */
  if (stats.turrets >= 3)
    add('strength', 'objectives', 'Presión de torres fuerte', `${stats.turrets} torres destruidas — excelente conversión de ventaja en estructura.`, 25);

  /* ── Multikill de barones/dragones (from events if available) ── */
  const objEvents = events.filter((e) => ['DragonKill','BaronKill','HeraldKill'].includes(e.EventName));
  if (objEvents.length >= 5)
    add('strength', 'objectives', 'Dominio de objetivos', `Participación en ${objEvents.length} objetivos del mapa. Excelente macro.`, 18);

  /* ── Sort by priority (ascending = most important first) ── */
  insights.sort((a, b) => a.priority - b.priority);
  return insights;
}

/* ══════════════════════════════════════════════════════════
   5. ERROR DETECTION
   Identifies specific, correctable mistakes.
══════════════════════════════════════════════════════════ */

/**
 * @typedef {object} GameError
 * @property {'critical'|'major'|'minor'} severity
 * @property {string} category
 * @property {string} title
 * @property {string} detail
 * @property {string} suggestion
 * @property {number|null} timestamp — event time in seconds, if applicable
 */

export function detectErrors(stats, events = [], vsElo = {}) {
  const errors = [];

  const add = (severity, category, title, detail, suggestion, timestamp = null) => {
    errors.push({ severity, category, title, detail, suggestion, timestamp });
  };

  const mins = stats.durationMins;

  /* ── Death timing analysis ── */
  const deathEvents = events.filter((e) => e.EventName === 'ChampionKill' && e.victim === 'me');
  deathEvents.slice(0, 3).forEach((e) => {
    const t = Math.round(e.EventTime);
    if (t < 480) // before min 8
      add('critical', 'deaths', 'Muerte muy temprana en línea', `Muriste en el minuto ${(t/60).toFixed(1)} — antes del primer recall óptimo.`,
        'Juega más seguro en los primeros 8 minutos. Prioriza CS sobre trades agresivos hasta tener nivel de habilidad ventajoso.', t);
    else if (t < 900) // 8-15 min
      add('major', 'deaths', 'Muerte en fase de línea', `Muerte en el minuto ${(t/60).toFixed(1)}.`,
        'Analiza si el intercambio valió la pena. En esta ventana, cada muerte regala un wave + XP a tu rival.', t);
  });

  /* ── Excess deaths ── */
  if (stats.deaths >= 10)
    add('critical', 'deaths', `${stats.deaths} muertes — demasiadas`, 'Más de 10 muertes genera una ventaja de oro brutal para el equipo rival.',
      'Cuando lleves 5+ muertes, juega muy conservador. La supervivencia vale más que el daño adicional.');

  else if (vsElo.deaths?.actual !== undefined) {
    const eloAvgDeaths = vsElo.deaths.expected; // note: inverted field
    if (stats.deaths > eloAvgDeaths * 1.5)
      add('major', 'deaths', 'Muertes por encima de la media del elo', `${stats.deaths} muertes vs ${eloAvgDeaths.toFixed(1)} esperadas.`,
        'Revisa las posiciones antes de pelear. Usa el mapa (visión) para evitar encantamientos.');
  }

  /* ── CS gaps ── */
  if (vsElo.csPerMin?.pct !== undefined && vsElo.csPerMin.pct <= -25 && mins > 20) {
    const missed = Math.round((vsElo.csPerMin.expected - stats.csPerMin) * mins);
    add('major', 'farming', 'Pérdida significativa de recursos por CS', `Perdiste ~${missed} CS vs el promedio de tu elo (${missed * 18}g estimados).`,
      'Enfócate en limpiar cada oleada. Usa slow push para crear presión y bases rentables.');
  }

  /* ── Vision ── */
  if (stats.wardsPlaced < 3 && mins > 15)
    add('major', 'vision', 'Muy pocos wards colocados', `Solo ${stats.wardsPlaced} wards en ${mins.toFixed(0)} minutos.`,
      'Intenta mantener un ward en el objetivo siguiente (dragon/baron) y trackea al jungler rival con los trinkets.');

  if (stats.wardsKilled === 0 && mins > 20)
    add('minor', 'vision', 'Sin wards desactivados', 'No destruiste ningún ward rival.',
      'Llevar un Sweeper (trinket de barrido) y desactivar wards rivales antes de pelear mejora mucho los outcomes.');

  /* ── Objective detection from events ── */
  const baronEvents  = events.filter((e) => e.EventName === 'BaronKill');
  const dragonEvents = events.filter((e) => e.EventName === 'DragonKill');

  if (baronEvents.length === 0 && mins > 30)
    add('minor', 'objectives', 'Sin barón en partida larga', `Partida de ${mins.toFixed(0)} min sin barón tomado.`,
      'En partidas largas, el Barón es clave para hacer push y cerrar. Agrupa tras conseguir ventaja.');

  /* ── Damage efficiency ── */
  if (stats.durationMins > 25 && stats.turrets === 0)
    add('minor', 'objectives', 'Sin daño a estructuras', '0 torres derribadas en partida larga.',
      'Convierte las victorias de teamfight en presión de torre inmediata. Esa gold es permanente.');

  return errors;
}

/* ══════════════════════════════════════════════════════════
   6. PERFORMANCE SCORE (0–100)
   Single composite number for quick feedback display.
══════════════════════════════════════════════════════════ */

export function calcPerformanceScore(stats, vsElo) {
  let score = 50; // baseline

  const nudge = (comparison, weight) => {
    if (!comparison) return;
    score += (comparison.pct / 100) * weight;
  };

  nudge(vsElo?.kda,          20);
  nudge(vsElo?.csPerMin,     15);
  nudge(vsElo?.visionPerMin, 10);
  nudge(vsElo?.damageShare,  10);
  nudge(vsElo?.killParticipation, 10);
  nudge(vsElo?.deaths,        -10); // already inverted in compareVsElo

  // Multi-kill bonuses
  score += stats.pentaKills  * 8;
  score += stats.quadraKills * 4;
  score += stats.tripleKills * 2;
  score += stats.firstBlood  ? 2 : 0;
  score += stats.win         ? 5 : 0;

  return Math.min(100, Math.max(0, Math.round(score)));
}
