/**
 * Champion Intelligence Data
 *
 * Three datasets used by the champSelectIntel scoring engine:
 *
 *  COUNTERS   — lane matchup relationships (beats / loses_to)
 *  SYNERGIES  — champion pairs with strong in-game synergy
 *  PROFILES   — composition contribution per champion
 *               (engage, peel, cc, poke, burst, waveclear, mobility, scaling, split)
 *
 * Scores (0–3): 0 = none, 1 = low, 2 = medium, 3 = high
 * Scaling: 'early' | 'mid' | 'late'
 *
 * Data sourced from high-elo meta patterns (EUW/KR Challenger, patch 26.5).
 */

/* ══════════════════════════════════════════════════════════
   LANE COUNTERS
   beats:    this champ wins lane against these matchups
   loses_to: these champs win lane against this champ
══════════════════════════════════════════════════════════ */
export const COUNTERS = {
  // ── TOP ─────────────────────────────────────────────────
  garen:    { beats: ['teemo', 'nasus', 'urgot'],      loses_to: ['fiora', 'camille', 'darius', 'jayce'] },
  darius:   { beats: ['garen', 'nasus', 'shen'],       loses_to: ['fiora', 'camille', 'jayce', 'renekton'] },
  fiora:    { beats: ['garen', 'darius', 'malphite', 'cho\'gath', 'nasus', 'urgot'], loses_to: ['renekton', 'camille'] },
  malphite: { beats: ['yasuo', 'jayce', 'vayne', 'fiora'], loses_to: ['darius', 'cho\'gath', 'nasus'] },
  camille:  { beats: ['darius', 'garen', 'nasus', 'urgot'], loses_to: ['fiora', 'malphite', 'shen'] },
  "cho'gath": { beats: ['darius', 'renekton', 'shen'], loses_to: ['jayce', 'fiora', 'camille', 'teemo'] },
  renekton: { beats: ['nasus', 'garen', 'cho\'gath', 'urgot'], loses_to: ['fiora', 'camille', 'darius', 'jayce'] },
  teemo:    { beats: ['garen', 'darius', 'nasus', 'urgot'], loses_to: ['malphite', 'cho\'gath', 'shen', 'camille'] },
  nasus:    { beats: ['shen', 'urgot'],                loses_to: ['darius', 'garen', 'fiora', 'camille', 'renekton', 'teemo'] },
  jayce:    { beats: ['darius', 'renekton', 'cho\'gath', 'nasus', 'shen'], loses_to: ['malphite', 'urgot', 'camille'] },
  shen:     { beats: ['darius', 'teemo', 'nasus'],     loses_to: ['cho\'gath', 'fiora', 'camille', 'jayce'] },
  urgot:    { beats: ['darius', 'garen', 'teemo', 'nasus'], loses_to: ['fiora', 'camille', 'jayce', 'malphite'] },

  // ── JUNGLE ──────────────────────────────────────────────
  vi:       { beats: ['amumu', 'nunu', 'master yi'],   loses_to: ['lee sin', 'graves', 'nidalee', 'ekko'] },
  hecarim:  { beats: ['amumu', 'nunu', 'warwick'],     loses_to: ['lee sin', 'graves', 'nidalee', 'kindred'] },
  warwick:  { beats: ['master yi', 'amumu', 'vi'],     loses_to: ['lee sin', 'graves', 'kindred', 'ekko'] },
  'lee sin': { beats: ['nidalee', 'amumu', 'kindred', 'ekko'], loses_to: ['warwick', 'hecarim', 'graves', 'vi'] },
  nidalee:  { beats: ['warwick', 'amumu', 'nunu'],     loses_to: ['lee sin', 'vi', 'graves', 'hecarim'] },
  amumu:    { beats: ['master yi', 'kindred'],         loses_to: ['lee sin', 'vi', 'hecarim', 'graves', 'nidalee'] },
  kindred:  { beats: ['nidalee', 'ekko'],              loses_to: ['lee sin', 'vi', 'warwick', 'graves', 'amumu'] },
  'master yi': { beats: ['amumu', 'nunu', 'kindred'],  loses_to: ['warwick', 'vi', 'hecarim', 'lee sin'] },
  ekko:     { beats: ['warwick', 'amumu', 'nunu'],     loses_to: ['lee sin', 'graves', 'vi', 'nidalee'] },
  graves:   { beats: ['nidalee', 'ekko', 'lee sin', 'warwick'], loses_to: ['vi', 'hecarim', 'amumu'] },
  nunu:     { beats: ['master yi', 'kindred', 'nidalee'], loses_to: ['lee sin', 'vi', 'graves', 'hecarim'] },

  // ── MID ─────────────────────────────────────────────────
  yasuo:    { beats: ['annie', 'veigar', 'orianna', 'syndra'], loses_to: ['zed', 'fizz', 'ahri', 'victor'] },
  zed:      { beats: ['annie', 'veigar', 'lux', 'syndra'], loses_to: ['fizz', 'malzahar', 'lissandra', 'ahri'] },
  lux:      { beats: ['annie', 'zed', 'yasuo'],        loses_to: ['fizz', 'ahri', 'syndra', 'veigar'] },
  syndra:   { beats: ['ahri', 'lux', 'veigar'],        loses_to: ['fizz', 'zed', 'yasuo'] },
  annie:    { beats: ['yasuo', 'lux', 'fizz'],         loses_to: ['zed', 'ahri', 'syndra', 'viktor'] },
  ahri:     { beats: ['fizz', 'zed', 'yasuo', 'syndra'], loses_to: ['viktor', 'veigar', 'orianna'] },
  orianna:  { beats: ['annie', 'lux', 'veigar'],       loses_to: ['yasuo', 'zed', 'ahri', 'fizz'] },
  veigar:   { beats: ['annie', 'lux', 'ahri'],         loses_to: ['zed', 'fizz', 'yasuo'] },
  fizz:     { beats: ['veigar', 'syndra', 'orianna', 'lux', 'annie', 'yasuo'], loses_to: ['ahri', 'zed'] },
  viktor:   { beats: ['yasuo', 'zed', 'ahri', 'annie'], loses_to: ['fizz', 'orianna'] },

  // ── ADC ─────────────────────────────────────────────────
  jinx:     { beats: ['tristana', 'sivir', 'ashe'],    loses_to: ['caitlyn', 'draven', 'vayne'] },
  caitlyn:  { beats: ['jinx', 'ashe', 'sivir', 'miss fortune'], loses_to: ['draven', 'vayne', 'jhin'] },
  ezreal:   { beats: ['ashe', 'jinx', 'sivir'],        loses_to: ['caitlyn', 'draven', 'jhin', 'miss fortune'] },
  jhin:     { beats: ['ezreal', 'sivir', 'ashe'],      loses_to: ['caitlyn', 'draven', 'vayne'] },
  ashe:     { beats: ['sivir', 'tristana'],             loses_to: ['draven', 'caitlyn', 'jhin', 'vayne'] },
  vayne:    { beats: ['jinx', 'ashe', 'tristana'],     loses_to: ['caitlyn', 'draven', 'jhin'] },
  'miss fortune': { beats: ['ezreal', 'jinx', 'sivir'], loses_to: ['caitlyn', 'draven', 'vayne'] },
  draven:   { beats: ['jinx', 'caitlyn', 'ashe', 'ezreal', 'jhin', 'miss fortune', 'tristana', 'sivir'], loses_to: ['vayne'] },
  tristana: { beats: ['ashe', 'ezreal', 'sivir'],      loses_to: ['draven', 'caitlyn', 'vayne', 'jinx'] },
  sivir:    { beats: ['ashe'],                          loses_to: ['draven', 'caitlyn', 'jinx', 'jhin', 'vayne', 'miss fortune'] },

  // ── SUPPORT ─────────────────────────────────────────────
  thresh:   { beats: ['soraka', 'janna', 'nami'],      loses_to: ['blitzcrank', 'leona', 'pyke'] },
  leona:    { beats: ['thresh', 'soraka', 'janna', 'nami', 'nami'], loses_to: ['blitzcrank', 'morgana', 'nautilus'] },
  lulu:     { beats: ['janna', 'soraka', 'thresh'],    loses_to: ['leona', 'blitzcrank', 'nautilus', 'morgana'] },
  blitzcrank: { beats: ['leona', 'thresh', 'nautilus'], loses_to: ['morgana', 'janna', 'lulu', 'pyke'] },
  nami:     { beats: ['janna', 'soraka'],               loses_to: ['leona', 'blitzcrank', 'nautilus', 'morgana'] },
  nautilus: { beats: ['thresh', 'nami', 'soraka', 'janna'], loses_to: ['blitzcrank', 'pyke', 'morgana'] },
  soraka:   { beats: ['pyke', 'thresh', 'blitzcrank'], loses_to: ['leona', 'nautilus', 'morgana'] },
  janna:    { beats: ['leona', 'nautilus', 'blitzcrank', 'thresh'], loses_to: ['morgana', 'pyke', 'soraka'] },
  morgana:  { beats: ['blitzcrank', 'leona', 'nautilus', 'thresh', 'nami'], loses_to: ['pyke', 'janna'] },
  pyke:     { beats: ['blitzcrank', 'thresh', 'nami', 'leona'], loses_to: ['soraka', 'janna', 'morgana'] },
};

/* ══════════════════════════════════════════════════════════
   SYNERGIES
   Strong in-game combinations (engage+follow-up, AoE+AoE,
   protect-the-carry, poke+execute, etc.)
══════════════════════════════════════════════════════════ */
export const SYNERGIES = {
  // ── TOP ─────────────────────────────────────────────────
  malphite: ['orianna', 'yasuo', 'miss fortune', 'amumu'],  // AoE ult combo
  shen:     ['jinx', 'vayne', 'miss fortune', 'caitlyn'],   // global ult on hypercarry
  darius:   ['hecarim', 'amumu', 'leona'],                  // AoE CC + execute
  garen:    ['amumu', 'orianna', 'malphite'],               // CC chain
  urgot:    ['amumu', 'hecarim', 'orianna'],                // AoE + ult setup
  fiora:    ['thresh', 'lulu'],                              // splitpush + peel
  camille:  ['orianna', 'ahri'],                            // cage + AoE
  nasus:    ['lulu', 'soraka', 'janna'],                    // protect-the-juggernaut

  // ── JUNGLE ──────────────────────────────────────────────
  vi:       ['orianna', 'amumu', 'yasuo'],                  // CC chain, ball → R
  hecarim:  ['orianna', 'miss fortune', 'amumu'],           // engage + AoE
  amumu:    ['orianna', 'miss fortune', 'malphite', 'yasuo', 'jinx'], // AoE chain
  'lee sin': ['yasuo', 'orianna', 'thresh'],                // kick into cc/ult
  ekko:     ['orianna', 'amumu'],                           // AoE stun
  warwick:  ['leona', 'nautilus', 'jinx'],                  // lockdown + hyper
  graves:   ['thresh', 'leona'],                            // lane dominance
  nunu:     ['jinx', 'caitlyn'],                            // enable hypercarries

  // ── MID ─────────────────────────────────────────────────
  orianna:  ['malphite', 'amumu', 'hecarim', 'vi', 'yasuo', 'lee sin'], // ball delivery
  yasuo:    ['malphite', 'amumu', 'hecarim', 'vi', 'lee sin'],  // knock-up comp
  lux:      ['ezreal', 'blitzcrank', 'thresh'],             // bind + execute/hook
  ahri:     ['vi', 'lee sin', 'nautilus'],                  // pick comp
  zed:      ['hecarim', 'vi', 'lee sin'],                   // burst carry
  veigar:   ['leona', 'nautilus', 'blitzcrank'],            // CC jail + burst
  annie:    ['hecarim', 'amumu', 'malphite'],               // Tibbers in engage
  syndra:   ['leona', 'nautilus'],                          // lockdown + burst
  viktor:   ['hecarim', 'malphite', 'amumu'],               // sustained AoE
  fizz:     ['miss fortune', 'ashe'],                       // ult setup

  // ── ADC ─────────────────────────────────────────────────
  jinx:     ['thresh', 'nami', 'lulu', 'shen', 'nautilus'], // protect + explosive
  caitlyn:  ['blitzcrank', 'thresh', 'lux'],                // hook + trap + execute
  vayne:    ['lulu', 'janna', 'soraka', 'shen'],            // protect-the-vayne
  'miss fortune': ['amumu', 'hecarim', 'malphite', 'leona', 'nautilus'], // AoE ult comp
  draven:   ['leona', 'nautilus', 'blitzcrank'],            // early all-in
  jinx:     ['thresh', 'nami', 'lulu'],                     // scale comp
  ashe:     ['blitzcrank', 'thresh', 'nautilus'],           // CC chain
  jhin:     ['blitzcrank', 'morgana', 'thresh'],            // root → 4th shot
  ezreal:   ['thresh', 'nami', 'janna'],                    // poke + safety

  // ── SUPPORT ─────────────────────────────────────────────
  thresh:   ['draven', 'jhin', 'jinx', 'ezreal', 'lee sin'], // hook → follow up
  leona:    ['miss fortune', 'draven', 'annie', 'amumu'],   // all-in chain
  nami:     ['ezreal', 'jinx', 'caitlyn'],                  // empower + heal
  blitzcrank: ['caitlyn', 'jhin', 'draven', 'lux'],         // hook → punish
  lulu:     ['vayne', 'jinx', 'tristana'],                  // hypercarry protection
  janna:    ['vayne', 'jinx', 'caitlyn'],                   // disengage + peel
  morgana:  ['caitlyn', 'jinx', 'jhin'],                    // root + ult chain
  nautilus: ['jhin', 'draven', 'miss fortune'],             // lockdown all-in
  soraka:   ['vayne', 'jinx', 'caitlyn'],                   // healing + silence
  pyke:     ['draven', 'jhin', 'caitlyn'],                  // gold generation, roam
};

/* ══════════════════════════════════════════════════════════
   COMPOSITION PROFILES
   Contribution each champion makes to the team composition.
══════════════════════════════════════════════════════════ */
export const PROFILES = {
  // engage: 0-3   peel: 0-3   cc: 0-3   poke: 0-3
  // burst: 0-3    waveclear: 0-3   mobility: 0-3
  // scaling: 'early'|'mid'|'late'   split: boolean

  // ── TOP ─────────────────────────────────────────────────
  garen:      { engage: 1, peel: 0, cc: 1, poke: 0, burst: 0, waveclear: 2, mobility: 1, scaling: 'mid',   split: true  },
  darius:     { engage: 2, peel: 0, cc: 2, poke: 0, burst: 1, waveclear: 1, mobility: 0, scaling: 'early', split: false },
  fiora:      { engage: 0, peel: 0, cc: 1, poke: 1, burst: 2, waveclear: 1, mobility: 3, scaling: 'mid',   split: true  },
  malphite:   { engage: 3, peel: 1, cc: 3, poke: 2, burst: 2, waveclear: 1, mobility: 0, scaling: 'mid',   split: false },
  camille:    { engage: 2, peel: 0, cc: 2, poke: 1, burst: 2, waveclear: 1, mobility: 3, scaling: 'mid',   split: true  },
  "cho'gath": { engage: 2, peel: 1, cc: 3, poke: 1, burst: 2, waveclear: 2, mobility: 0, scaling: 'late',  split: false },
  renekton:   { engage: 2, peel: 0, cc: 2, poke: 0, burst: 2, waveclear: 2, mobility: 2, scaling: 'early', split: false },
  teemo:      { engage: 0, peel: 0, cc: 1, poke: 3, burst: 1, waveclear: 1, mobility: 1, scaling: 'mid',   split: true  },
  nasus:      { engage: 1, peel: 0, cc: 2, poke: 0, burst: 0, waveclear: 3, mobility: 0, scaling: 'late',  split: true  },
  jayce:      { engage: 1, peel: 0, cc: 1, poke: 3, burst: 2, waveclear: 2, mobility: 1, scaling: 'mid',   split: true  },
  shen:       { engage: 2, peel: 3, cc: 2, poke: 0, burst: 0, waveclear: 1, mobility: 1, scaling: 'mid',   split: false },
  urgot:      { engage: 1, peel: 0, cc: 2, poke: 2, burst: 2, waveclear: 2, mobility: 0, scaling: 'mid',   split: false },

  // ── JUNGLE ──────────────────────────────────────────────
  vi:         { engage: 3, peel: 0, cc: 3, poke: 0, burst: 2, waveclear: 1, mobility: 2, scaling: 'mid',   split: false },
  hecarim:    { engage: 3, peel: 0, cc: 2, poke: 0, burst: 1, waveclear: 2, mobility: 3, scaling: 'mid',   split: false },
  warwick:    { engage: 2, peel: 0, cc: 2, poke: 0, burst: 1, waveclear: 1, mobility: 2, scaling: 'mid',   split: false },
  'lee sin':  { engage: 2, peel: 0, cc: 2, poke: 0, burst: 2, waveclear: 1, mobility: 3, scaling: 'early', split: false },
  nidalee:    { engage: 0, peel: 0, cc: 1, poke: 3, burst: 2, waveclear: 2, mobility: 3, scaling: 'early', split: false },
  amumu:      { engage: 3, peel: 0, cc: 3, poke: 0, burst: 1, waveclear: 2, mobility: 1, scaling: 'mid',   split: false },
  kindred:    { engage: 0, peel: 1, cc: 1, poke: 2, burst: 1, waveclear: 2, mobility: 3, scaling: 'late',  split: false },
  'master yi': { engage: 1, peel: 0, cc: 0, poke: 0, burst: 3, waveclear: 2, mobility: 2, scaling: 'late', split: true  },
  ekko:       { engage: 2, peel: 0, cc: 2, poke: 1, burst: 3, waveclear: 2, mobility: 3, scaling: 'mid',   split: false },
  graves:     { engage: 1, peel: 0, cc: 1, poke: 2, burst: 2, waveclear: 2, mobility: 2, scaling: 'early', split: false },
  nunu:       { engage: 2, peel: 0, cc: 2, poke: 1, burst: 1, waveclear: 2, mobility: 2, scaling: 'mid',   split: false },

  // ── MID ─────────────────────────────────────────────────
  yasuo:      { engage: 1, peel: 0, cc: 1, poke: 1, burst: 2, waveclear: 2, mobility: 3, scaling: 'late',  split: false },
  zed:        { engage: 2, peel: 0, cc: 0, poke: 1, burst: 3, waveclear: 2, mobility: 3, scaling: 'mid',   split: false },
  lux:        { engage: 0, peel: 1, cc: 2, poke: 3, burst: 2, waveclear: 2, mobility: 0, scaling: 'mid',   split: false },
  syndra:     { engage: 0, peel: 0, cc: 2, poke: 2, burst: 3, waveclear: 2, mobility: 0, scaling: 'mid',   split: false },
  annie:      { engage: 2, peel: 0, cc: 2, poke: 1, burst: 3, waveclear: 2, mobility: 0, scaling: 'early', split: false },
  ahri:       { engage: 1, peel: 0, cc: 2, poke: 2, burst: 3, waveclear: 2, mobility: 3, scaling: 'mid',   split: false },
  orianna:    { engage: 1, peel: 1, cc: 2, poke: 2, burst: 2, waveclear: 2, mobility: 0, scaling: 'mid',   split: false },
  veigar:     { engage: 0, peel: 0, cc: 2, poke: 2, burst: 3, waveclear: 1, mobility: 0, scaling: 'late',  split: false },
  fizz:       { engage: 2, peel: 0, cc: 2, poke: 0, burst: 3, waveclear: 1, mobility: 3, scaling: 'mid',   split: false },
  viktor:     { engage: 0, peel: 0, cc: 2, poke: 2, burst: 2, waveclear: 3, mobility: 0, scaling: 'late',  split: false },

  // ── ADC ─────────────────────────────────────────────────
  jinx:       { engage: 0, peel: 0, cc: 1, poke: 1, burst: 1, waveclear: 3, mobility: 0, scaling: 'late',  split: false },
  caitlyn:    { engage: 0, peel: 0, cc: 2, poke: 3, burst: 1, waveclear: 2, mobility: 1, scaling: 'early', split: false },
  ezreal:     { engage: 0, peel: 0, cc: 0, poke: 3, burst: 1, waveclear: 1, mobility: 3, scaling: 'mid',   split: false },
  jhin:       { engage: 1, peel: 0, cc: 2, poke: 2, burst: 2, waveclear: 1, mobility: 0, scaling: 'mid',   split: false },
  ashe:       { engage: 2, peel: 0, cc: 3, poke: 2, burst: 0, waveclear: 1, mobility: 0, scaling: 'late',  split: false },
  vayne:      { engage: 0, peel: 0, cc: 1, poke: 0, burst: 2, waveclear: 1, mobility: 2, scaling: 'late',  split: false },
  'miss fortune': { engage: 1, peel: 0, cc: 1, poke: 2, burst: 3, waveclear: 2, mobility: 0, scaling: 'mid', split: false },
  draven:     { engage: 0, peel: 0, cc: 1, poke: 1, burst: 3, waveclear: 1, mobility: 0, scaling: 'early', split: false },
  tristana:   { engage: 1, peel: 0, cc: 1, poke: 1, burst: 2, waveclear: 2, mobility: 2, scaling: 'late',  split: false },
  sivir:      { engage: 0, peel: 2, cc: 0, poke: 2, burst: 0, waveclear: 3, mobility: 1, scaling: 'mid',   split: false },

  // ── SUPPORT ─────────────────────────────────────────────
  thresh:     { engage: 2, peel: 3, cc: 3, poke: 1, burst: 0, waveclear: 0, mobility: 1, scaling: 'mid',   split: false },
  leona:      { engage: 3, peel: 1, cc: 3, poke: 0, burst: 1, waveclear: 0, mobility: 1, scaling: 'early', split: false },
  lulu:       { engage: 0, peel: 3, cc: 2, poke: 2, burst: 0, waveclear: 0, mobility: 0, scaling: 'late',  split: false },
  blitzcrank: { engage: 3, peel: 1, cc: 3, poke: 0, burst: 1, waveclear: 0, mobility: 1, scaling: 'early', split: false },
  nami:       { engage: 1, peel: 2, cc: 2, poke: 2, burst: 0, waveclear: 0, mobility: 0, scaling: 'mid',   split: false },
  nautilus:   { engage: 3, peel: 1, cc: 3, poke: 0, burst: 1, waveclear: 0, mobility: 0, scaling: 'mid',   split: false },
  soraka:     { engage: 0, peel: 3, cc: 1, poke: 1, burst: 0, waveclear: 0, mobility: 0, scaling: 'late',  split: false },
  janna:      { engage: 0, peel: 3, cc: 2, poke: 1, burst: 0, waveclear: 0, mobility: 1, scaling: 'late',  split: false },
  morgana:    { engage: 1, peel: 2, cc: 3, poke: 2, burst: 1, waveclear: 1, mobility: 0, scaling: 'mid',   split: false },
  pyke:       { engage: 2, peel: 0, cc: 2, poke: 1, burst: 3, waveclear: 0, mobility: 3, scaling: 'mid',   split: false },
};
