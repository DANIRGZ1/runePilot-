export const ROLES = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  ADC: "ADC",
  SUPPORT: "Support",
};

export const DAMAGE_TYPES = {
  AD: "AD",
  AP: "AP",
  MIXED: "Mixed",
};

export const champions = [
  // TOP
  { id: "garen", name: "Garen", role: "TOP", damage: "AD", tags: ["tank", "fighter"], difficulty: 1, winRate: 52.1, pickRate: 8.3, banRate: 3.1, icon: "⚔️" },
  { id: "darius", name: "Darius", role: "TOP", damage: "AD", tags: ["fighter", "juggernaut"], difficulty: 2, winRate: 50.8, pickRate: 9.1, banRate: 12.4, icon: "⚔️" },
  { id: "fiora", name: "Fiora", role: "TOP", damage: "AD", tags: ["fighter", "duelist"], difficulty: 3, winRate: 51.3, pickRate: 5.2, banRate: 8.1, icon: "⚔️" },
  { id: "malphite", name: "Malphite", role: "TOP", damage: "AP", tags: ["tank"], difficulty: 1, winRate: 53.2, pickRate: 7.8, banRate: 9.2, icon: "🪨" },
  { id: "camille", name: "Camille", role: "TOP", damage: "AD", tags: ["fighter", "duelist"], difficulty: 3, winRate: 50.1, pickRate: 4.3, banRate: 11.3, icon: "⚔️" },
  { id: "cho'gath", name: "Cho'Gath", role: "TOP", damage: "MIXED", tags: ["tank"], difficulty: 2, winRate: 54.1, pickRate: 3.9, banRate: 2.1, icon: "👾" },
  { id: "renekton", name: "Renekton", role: "TOP", damage: "AD", tags: ["fighter"], difficulty: 2, winRate: 49.7, pickRate: 6.1, banRate: 4.2, icon: "🐊" },
  { id: "teemo", name: "Teemo", role: "TOP", damage: "AP", tags: ["marksman", "mage"], difficulty: 2, winRate: 50.9, pickRate: 5.7, banRate: 14.2, icon: "🍄" },
  { id: "nasus", name: "Nasus", role: "TOP", damage: "AD", tags: ["fighter", "juggernaut"], difficulty: 1, winRate: 52.6, pickRate: 5.4, banRate: 2.8, icon: "🐕" },
  { id: "jayce", name: "Jayce", role: "TOP", damage: "AD", tags: ["fighter", "ranged"], difficulty: 3, winRate: 49.3, pickRate: 3.8, banRate: 3.1, icon: "⚡" },
  { id: "shen", name: "Shen", role: "TOP", damage: "AD", tags: ["tank"], difficulty: 2, winRate: 51.8, pickRate: 5.9, banRate: 3.4, icon: "🥷" },
  { id: "urgot", name: "Urgot", role: "TOP", damage: "AD", tags: ["fighter", "juggernaut"], difficulty: 2, winRate: 52.3, pickRate: 4.1, banRate: 4.7, icon: "🦞" },

  // JUNGLE
  { id: "vi", name: "Vi", role: "JUNGLE", damage: "AD", tags: ["fighter"], difficulty: 2, winRate: 52.4, pickRate: 5.8, banRate: 3.2, icon: "👊" },
  { id: "hecarim", name: "Hecarim", role: "JUNGLE", damage: "AD", tags: ["fighter", "tank"], difficulty: 2, winRate: 51.6, pickRate: 7.2, banRate: 5.1, icon: "🐎" },
  { id: "warwick", name: "Warwick", role: "JUNGLE", damage: "AD", tags: ["fighter", "tank"], difficulty: 1, winRate: 53.1, pickRate: 6.9, banRate: 4.3, icon: "🐺" },
  { id: "lee sin", name: "Lee Sin", role: "JUNGLE", damage: "AD", tags: ["fighter", "assassin"], difficulty: 3, winRate: 48.2, pickRate: 11.3, banRate: 8.9, icon: "🥊" },
  { id: "nidalee", name: "Nidalee", role: "JUNGLE", damage: "AP", tags: ["assassin", "skirmisher"], difficulty: 3, winRate: 49.1, pickRate: 4.2, banRate: 2.8, icon: "🐆" },
  { id: "amumu", name: "Amumu", role: "JUNGLE", damage: "AP", tags: ["tank"], difficulty: 1, winRate: 54.3, pickRate: 7.1, banRate: 7.8, icon: "🪆" },
  { id: "kindred", name: "Kindred", role: "JUNGLE", damage: "AD", tags: ["marksman"], difficulty: 3, winRate: 49.8, pickRate: 3.9, banRate: 6.2, icon: "🏹" },
  { id: "master yi", name: "Master Yi", role: "JUNGLE", damage: "AD", tags: ["assassin", "fighter"], difficulty: 2, winRate: 51.9, pickRate: 9.4, banRate: 13.1, icon: "⚡" },
  { id: "ekko", name: "Ekko", role: "JUNGLE", damage: "AP", tags: ["assassin", "fighter"], difficulty: 3, winRate: 51.2, pickRate: 5.6, banRate: 4.1, icon: "⏱️" },
  { id: "graves", name: "Graves", role: "JUNGLE", damage: "AD", tags: ["marksman", "fighter"], difficulty: 2, winRate: 50.7, pickRate: 6.8, banRate: 5.3, icon: "🔫" },
  { id: "nunu", name: "Nunu & Willump", role: "JUNGLE", damage: "AP", tags: ["tank", "fighter"], difficulty: 1, winRate: 53.8, pickRate: 5.2, banRate: 3.7, icon: "⛄" },

  // MID
  { id: "yasuo", name: "Yasuo", role: "MID", damage: "AD", tags: ["fighter", "duelist"], difficulty: 3, winRate: 49.4, pickRate: 14.2, banRate: 18.7, icon: "🌪️" },
  { id: "zed", name: "Zed", role: "MID", damage: "AD", tags: ["assassin"], difficulty: 3, winRate: 50.1, pickRate: 7.8, banRate: 16.2, icon: "💀" },
  { id: "lux", name: "Lux", role: "MID", damage: "AP", tags: ["mage", "support"], difficulty: 2, winRate: 52.8, pickRate: 8.9, banRate: 6.1, icon: "✨" },
  { id: "syndra", name: "Syndra", role: "MID", damage: "AP", tags: ["mage"], difficulty: 3, winRate: 51.3, pickRate: 4.1, banRate: 4.8, icon: "🔮" },
  { id: "annie", name: "Annie", role: "MID", damage: "AP", tags: ["mage"], difficulty: 1, winRate: 53.4, pickRate: 3.8, banRate: 3.2, icon: "🔥" },
  { id: "ahri", name: "Ahri", role: "MID", damage: "AP", tags: ["assassin", "mage"], difficulty: 2, winRate: 52.1, pickRate: 9.3, banRate: 5.4, icon: "🦊" },
  { id: "orianna", name: "Orianna", role: "MID", damage: "AP", tags: ["mage"], difficulty: 3, winRate: 51.7, pickRate: 5.2, banRate: 3.9, icon: "⚽" },
  { id: "veigar", name: "Veigar", role: "MID", damage: "AP", tags: ["mage"], difficulty: 2, winRate: 53.6, pickRate: 6.7, banRate: 7.3, icon: "🎩" },
  { id: "fizz", name: "Fizz", role: "MID", damage: "AP", tags: ["assassin", "fighter"], difficulty: 3, winRate: 51.9, pickRate: 4.9, banRate: 9.8, icon: "🐟" },
  { id: "viktor", name: "Viktor", role: "MID", damage: "AP", tags: ["mage"], difficulty: 3, winRate: 50.8, pickRate: 5.1, banRate: 4.2, icon: "🤖" },

  // ADC
  { id: "jinx", name: "Jinx", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 2, winRate: 52.9, pickRate: 10.8, banRate: 7.2, icon: "💥" },
  { id: "caitlyn", name: "Caitlyn", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 2, winRate: 51.4, pickRate: 9.7, banRate: 4.8, icon: "🎯" },
  { id: "ezreal", name: "Ezreal", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 3, winRate: 49.8, pickRate: 13.2, banRate: 3.1, icon: "🧙" },
  { id: "jhin", name: "Jhin", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 3, winRate: 51.2, pickRate: 8.9, banRate: 5.6, icon: "🎭" },
  { id: "ashe", name: "Ashe", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 1, winRate: 52.3, pickRate: 7.4, banRate: 2.9, icon: "🏹" },
  { id: "vayne", name: "Vayne", role: "ADC", damage: "AD", tags: ["marksman", "fighter"], difficulty: 3, winRate: 51.7, pickRate: 6.8, banRate: 12.4, icon: "🌙" },
  { id: "miss fortune", name: "Miss Fortune", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 1, winRate: 52.7, pickRate: 8.3, banRate: 4.1, icon: "🔫" },
  { id: "draven", name: "Draven", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 3, winRate: 50.9, pickRate: 5.1, banRate: 6.3, icon: "🪃" },
  { id: "tristana", name: "Tristana", role: "ADC", damage: "AD", tags: ["marksman", "fighter"], difficulty: 2, winRate: 51.1, pickRate: 5.8, banRate: 3.4, icon: "💣" },
  { id: "sivir", name: "Sivir", role: "ADC", damage: "AD", tags: ["marksman"], difficulty: 1, winRate: 52.4, pickRate: 4.6, banRate: 2.1, icon: "🪃" },

  // SUPPORT
  { id: "thresh", name: "Thresh", role: "SUPPORT", damage: "AD", tags: ["support", "tank"], difficulty: 3, winRate: 50.3, pickRate: 11.2, banRate: 7.8, icon: "⛓️" },
  { id: "leona", name: "Leona", role: "SUPPORT", damage: "AD", tags: ["support", "tank"], difficulty: 2, winRate: 52.8, pickRate: 8.4, banRate: 6.2, icon: "☀️" },
  { id: "lulu", name: "Lulu", role: "SUPPORT", damage: "AP", tags: ["support", "mage"], difficulty: 2, winRate: 53.1, pickRate: 9.1, banRate: 5.4, icon: "🌟" },
  { id: "blitzcrank", name: "Blitzcrank", role: "SUPPORT", damage: "AP", tags: ["support", "tank"], difficulty: 2, winRate: 52.4, pickRate: 7.8, banRate: 13.9, icon: "🤖" },
  { id: "nami", name: "Nami", role: "SUPPORT", damage: "AP", tags: ["support", "mage"], difficulty: 2, winRate: 52.9, pickRate: 8.2, banRate: 4.3, icon: "🧜" },
  { id: "nautilus", name: "Nautilus", role: "SUPPORT", damage: "AP", tags: ["support", "tank"], difficulty: 2, winRate: 51.6, pickRate: 9.4, banRate: 8.7, icon: "⚓" },
  { id: "soraka", name: "Soraka", role: "SUPPORT", damage: "AP", tags: ["support", "healer"], difficulty: 1, winRate: 53.8, pickRate: 6.9, banRate: 5.1, icon: "🌟" },
  { id: "janna", name: "Janna", role: "SUPPORT", damage: "AP", tags: ["support", "enchanter"], difficulty: 2, winRate: 54.1, pickRate: 5.3, banRate: 4.2, icon: "💨" },
  { id: "morgana", name: "Morgana", role: "SUPPORT", damage: "AP", tags: ["support", "mage"], difficulty: 2, winRate: 53.2, pickRate: 7.1, banRate: 9.3, icon: "🦋" },
  { id: "pyke", name: "Pyke", role: "SUPPORT", damage: "AD", tags: ["support", "assassin"], difficulty: 3, winRate: 49.7, pickRate: 5.8, banRate: 11.2, icon: "🔱" },
];

export const getChampionById = (id) => champions.find((c) => c.id === id);

export const getChampionsByRole = (role) => champions.filter((c) => c.role === role);

export const analyzeTeamComp = (team) => {
  const picks = team.filter(Boolean);
  if (picks.length === 0) return null;

  const damageTypes = picks.map((c) => c.damage);
  const adCount = damageTypes.filter((d) => d === "AD").length;
  const apCount = damageTypes.filter((d) => d === "AP").length;
  const mixedCount = damageTypes.filter((d) => d === "MIXED").length;

  const tags = picks.flatMap((c) => c.tags);
  const tankCount = tags.filter((t) => t === "tank" || t === "fighter").length;
  const assassinCount = tags.filter((t) => t === "assassin").length;
  const enchanterCount = tags.filter((t) => ["support", "healer", "enchanter"].includes(t)).length;
  const mageCount = tags.filter((t) => t === "mage").length;

  const strengths = [];
  const weaknesses = [];
  const winConditions = [];

  // Damage balance analysis
  if (adCount >= 4) {
    weaknesses.push("Heavily AD — enemy armor stacking counters entire team");
  } else if (apCount >= 4) {
    weaknesses.push("Heavily AP — enemy MR stacking is a concern");
  } else if (adCount >= 2 && apCount >= 2) {
    strengths.push("Balanced damage (AD + AP) — hard to itemize against");
  }

  // Tankiness
  if (tankCount >= 3) {
    strengths.push("High durability — excellent at front-lining and sustaining fights");
  } else if (tankCount === 0) {
    weaknesses.push("No tanks — vulnerable to heavy burst damage");
  }

  // Assassin presence
  if (assassinCount >= 2) {
    strengths.push("High kill threat — multiple pick threats");
    winConditions.push("Isolate and eliminate priority targets before teamfights");
  }

  // Engage potential
  const engageChamps = ["leona", "malphite", "amumu", "nautilus", "vi", "hecarim"];
  const hasEngage = picks.some((c) => engageChamps.includes(c.id));
  if (hasEngage) {
    strengths.push("Strong engage — can force fights on your terms");
    winConditions.push("Force teamfights with your engage tools");
  } else {
    weaknesses.push("Lacks reliable engage — may struggle to start fights");
  }

  // Peel/enchanter presence
  if (enchanterCount >= 2) {
    strengths.push("Excellent peel and sustain — hard to burst carries");
    winConditions.push("Protect ADC and scale into lategame");
  }

  // Scaling
  const scalingChamps = ["nasus", "veigar", "jinx", "vayne", "tristana"];
  const hasScaling = picks.some((c) => scalingChamps.includes(c.id));
  if (hasScaling) {
    winConditions.push("Scale to lategame and win extended teamfights");
  }

  // Split push
  const splitChamps = ["fiora", "camille", "tryndamere", "jax"];
  const hasSplit = picks.some((c) => splitChamps.includes(c.id));
  if (hasSplit) {
    winConditions.push("Apply split-push pressure and force 1-3-1 macro");
  }

  // Average win rate
  const avgWinRate =
    picks.reduce((acc, c) => acc + c.winRate, 0) / picks.length;

  return {
    adCount,
    apCount,
    mixedCount,
    tankCount,
    assassinCount,
    enchanterCount,
    mageCount,
    strengths,
    weaknesses,
    winConditions,
    avgWinRate: avgWinRate.toFixed(1),
  };
};
