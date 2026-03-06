export const metaBuilds = {
  // ─── TOP LANE ────────────────────────────────────────────────────────────────

  garen: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Presence of Mind', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Unflinching'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ["Sterak's Gage", 'Black Cleaver'],
      situational: ["Dead Man's Plate", 'Spirit Visage', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Stack passive in brushes before engaging to gain bonus resistances.',
      'Use Q silence to interrupt key enemy abilities before all-ins.',
      'R executes low-HP enemies — save it until the target is below 25% HP for the true-damage execute.',
    ],
  },

  darius: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Presence of Mind', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', "Sterak's Gage"],
      situational: ['Heartsteel', 'Spirit Visage', "Dead Man's Plate"],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxLast: 'Q', order: 'R > E > W > Q' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Land the outer edge of Q to heal — missing the center is fine as long as you hit the blade.',
      'Stack 5 Hemorrhage passive before ulting to maximise Noxian Might bonus damage.',
      'Ghost can replace Teleport in stomp matchups to prevent enemy escapes.',
    ],
  },

  fiora: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Ravenous Hydra', "Sterak's Gage"],
      situational: ['Wit\'s End', 'Death\'s Dance', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Parry (W) enemy key abilities such as Darius E or Malphite R to turn fights completely.',
      'Activate vitals on all four sides during Grand Challenge for maximum healing.',
      'Q resets on kill — use it to chain assassinations in teamfights.',
    ],
  },

  malphite: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Resolve',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Iceborn Gauntlet', 'Thornmail'],
      situational: ['Force of Nature', 'Warmog\'s Armor', 'Abyssal Mask'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Ult into the largest cluster of enemy carries — Unstoppable Force is a game-winning engage.',
      'Build full armor against AD-heavy teams; swap to Abyssal Mask for AP-heavy comps.',
      'Q poke with Arcane Comet in lane to shove opponents off the wave.',
    ],
  },

  camille: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ["Sterak's Gage", 'Black Cleaver'],
      situational: ['Death\'s Dance', 'Guardian Angel', 'Wit\'s End'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Always proc both Q hits — the second hit heals you based on bonus AD.',
      'Use E hookshot to escape or gap-close; angle it off walls for unpredictable entries.',
      'R isolates a single target — use it on the most dangerous carry and ignore everyone else.',
    ],
  },

  "cho'gath": {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Grasp of the Undying',
      primary: 'Resolve',
      secondary: 'Sorcery',
      page: ['Grasp of the Undying', 'Shield Bash', 'Conditioning', 'Overgrowth', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Iceborn Gauntlet', 'Warmog\'s Armor'],
      situational: ['Thornmail', 'Abyssal Mask', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Use R on minions in the late game to stack Feast and become unkillable.',
      'W silence is critical before E landing — combo W into E for reliable CC.',
      'Grasp procs scale off max HP, so stack Feast as much as possible.',
    ],
  },

  renekton: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Unflinching'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', "Sterak's Gage"],
      situational: ["Dead Man's Plate", 'Spirit Visage', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxLast: 'E', order: 'R > W > Q > E' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Always generate 50 Fury before using empowered W for the stun.',
      'Early levels 1-6 are your power spike — play aggressively and dominate lane.',
      'Ult gives HP and AOE damage — use it to survive burst and extend fights.',
    ],
  },

  teemo: {
    tier: 'B',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Domination',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch', 'Cheap Shot', 'Ultimate Hunter'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Demonic Embrace'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxLast: 'W', order: 'R > E > Q > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Place shrooms in tribush and pixel brush at dragon/baron to deny vision.',
      'Blind (Q) counters AA-reliant champions — use it as an interrupt on auto-attackers.',
      'Go invisible (W) in brushes and wait for enemies to step on shrooms rather than engaging directly.',
    ],
  },

  nasus: {
    tier: 'B',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Frozen Heart', 'Spirit Visage'],
      situational: ['Warmog\'s Armor', 'Force of Nature', 'Gargoyle Stoneplate'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Farm Q on every single last hit — 200+ stacks by level 11 is the minimum target.',
      'Use W slow to guarantee Q hits in fights when fully stacked.',
      'Split push in the late game; your stacked Q one-shots towers.',
    ],
  },

  jayce: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Precision',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Gathering Storm', 'Presence of Mind', 'Legend: Alacrity'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', 'Manamune'],
      situational: ['Serpent\'s Fang', "Sterak's Gage", 'Mortal Reminder'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Poke with ranged form, then transform and burst with melee form Thundering Blow.',
      'Use E (Acceleration Gate) to speed up and extend combo range.',
      'Rotate cannon form EQ through minion waves to poke opponents from safety.',
    ],
  },

  shen: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Grasp of the Undying',
      primary: 'Resolve',
      secondary: 'Precision',
      page: ['Grasp of the Undying', 'Shield Bash', 'Conditioning', 'Overgrowth', 'Triumph', 'Legend: Tenacity'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Heartsteel', 'Frozen Heart'],
      situational: ['Warmog\'s Armor', 'Force of Nature', 'Thornmail'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Track ally HP bars constantly — a well-timed Stand United can win a teamfight elsewhere.',
      'Activate W spirit blade dash to empower autos and deal bonus damage during Q.',
      'E taunt has extended range going through a wall; practice wall-E in side lanes.',
    ],
  },

  urgot: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Unflinching'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', 'Heartsteel'],
      situational: ["Sterak's Gage", "Dead Man's Plate", 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxLast: 'W', order: 'R > E > Q > W' },
    summonerSpells: ['Flash', 'Teleport'],
    tips: [
      'Hit W shield before engaging — it gives you time to proc shotgun knees.',
      'E dash resets on kills; use it to execute multiple low-HP targets in teamfights.',
      'R execute can be body-blocked — make sure you are close before activating.',
    ],
  },

  // ─── JUNGLE ──────────────────────────────────────────────────────────────────

  vi: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Unflinching'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', "Sterak's Gage"],
      situational: ["Dead Man's Plate", 'Force of Nature', 'Serpent\'s Fang'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Q charge can be held — use it to dodge incoming skill shots while closing distance.',
      'R pin prevents the target from dashing away; chain with CC from teammates.',
      'Clear red side first into early bot lane gank thanks to Q engage.',
    ],
  },

  hecarim: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Phase Rush',
      primary: 'Sorcery',
      secondary: 'Resolve',
      page: ['Phase Rush', 'Nimbus Cloak', 'Celerity', 'Waterwalking', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', "Sterak's Gage"],
      situational: ["Dead Man's Plate", 'Spirit Visage', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Phase Rush procs off three rapid autos — activate before entering a fight for the movement speed.',
      'Ravage (E) fear pushes enemies toward your team — angle your approach carefully.',
      'Onslaught of Shadows is best used to enter fights from unexpected angles, not just straight-on.',
    ],
  },

  warwick: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Conqueror', 'Triumph', 'Legend: Tenacity', 'Last Stand', 'Bone Plating', 'Overgrowth'],
    },
    items: {
      mythic: 'Divine Sunderer',
      boots: 'Plated Steelcaps',
      core: ["Sterak's Gage", 'Black Cleaver'],
      situational: ['Spirit Visage', 'Force of Nature', 'Warmog\'s Armor'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Infinite Duress (R) suppression is uninterruptable — use it to lock down carries.',
      'W passive doubles your movement speed when chasing low-HP targets; avoid disengaging.',
      'Build Spirit Visage to amplify your healing from Q and passive.',
    ],
  },

  'lee sin': {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Sudden Impact', 'Ultimate Hunter'],
    },
    items: {
      mythic: 'Eclipse',
      boots: 'Plated Steelcaps',
      core: ['Black Cleaver', "Sterak's Gage"],
      situational: ['Death\'s Dance', 'Serpent\'s Fang', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Ward-hop with W to extend Q range and escape dangerous situations.',
      'Dragon Kick (R) insec combo: Q a target, ward-hop behind them, R to kick them into your team.',
      'Energy management is key — do not spam abilities; weave two autos between each ability.',
    ],
  },

  nidalee: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Dark Harvest',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Dark Harvest', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Absolute Focus', 'Gathering Storm'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', "Zhonya's Hourglass"],
      situational: ['Rabadon\'s Deathcap', 'Void Staff', 'Cosmic Drive'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Land long-range Javelin Toss to mark targets and enable Pounce resets in cougar form.',
      'Set traps (W human) in your own jungle to detect invaders and deny deep wards.',
      'Bushwhack-Pounce-Takedown (W-cat-Q) is the standard burst combo on marked targets.',
    ],
  },

  amumu: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Inspiration',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Abyssal Mask', 'Frozen Heart'],
      situational: ['Warmog\'s Armor', 'Thornmail', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxLast: 'Q', order: 'R > E > W > Q' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Double Q bandage allows you to chain two gap-closes — flash the second Q if needed.',
      'Ult hits the entire team in a circle — wait in the middle of a clustered fight.',
      'W aura deals magic damage around you while active; stay inside the enemy team.',
    ],
  },

  kindred: {
    tier: 'B',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down', 'Sudden Impact', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Runaan\'s Hurricane', 'Wit\'s End'],
      situational: ['Blade of the Ruined King', 'Phantom Dancer', 'Guinsoo\'s Rageblade'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Hunt marked camps on time — each stack permanently increases your damage and range.',
      'Lamb\'s Respite (R) saves your whole team; cast it just before multiple people would die.',
      'Q mid-dash through enemies then auto-cancel to reset the dash cooldown.',
    ],
  },

  'master yi': {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Cut Down', 'Sudden Impact', 'Ultimate Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ["Blade of the Ruined King", 'Guinsoo\'s Rageblade'],
      situational: ['Wit\'s End', 'Death\'s Dance', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Alpha Strike (Q) dodges all incoming CC while active — use it to avoid key crowd control.',
      'R Highlander resets on kills; chain kills to extend the duration indefinitely.',
      'Meditate (W) reduces incoming damage by 90% — use it to tank tower shots while diving.',
    ],
  },

  ekko: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Dark Harvest',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Dark Harvest', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Transcendence', 'Gathering Storm'],
    },
    items: {
      mythic: 'Hextech Rocketbelt',
      boots: 'Sorcerer\'s Shoes',
      core: ["Zhonya's Hourglass", "Shadowflame"],
      situational: ['Rabadon\'s Deathcap', 'Void Staff', "Lich Bane"],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Third-hit passive Z-Drive Resonance deals bonus damage and slows — proc it before your burst combo.',
      'W chronobreak placement is key; leave the ghost where enemies cluster to stun them.',
      'Chronobreak (R) teleports you to where you were 4 seconds ago — use it as an escape or surprise engage.',
    ],
  },

  graves: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Conqueror',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Sudden Impact', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Eclipse',
      boots: 'Plated Steelcaps',
      core: ['Serylda\'s Grudge', 'Death\'s Dance'],
      situational: ['Serpent\'s Fang', 'Black Cleaver', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'E dash reloads shotgun — weave dashes between shots to maintain True Grit stacks.',
      'Q New Destiny bounces off walls; use tight corridors to guarantee both hits.',
      'Smoke Screen (W) removes vision and applies Grievous Wounds — throw it on priority targets.',
    ],
  },

  nunu: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Sorcery',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Sunfire Aegis',
      boots: 'Plated Steelcaps',
      core: ['Warmog\'s Armor', 'Frozen Heart'],
      situational: ['Force of Nature', 'Abyssal Mask', 'Thornmail'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Smite'],
    tips: [
      'Consume (Q) on objectives deals massive damage — solo dragon/baron with Q stacks.',
      'Snowball (E) is your primary engage; aim it through terrain for unpredictable angles.',
      'Absolute Zero (R) channel punishes grouped enemies — use Warmog\'s to survive the setup.',
    ],
  },

  // ─── MID LANE ────────────────────────────────────────────────────────────────

  yasuo: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Resolve',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Second Wind', 'Overgrowth'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Infinity Edge', 'Immortal Shieldbow'],
      situational: ['Wit\'s End', 'Death\'s Dance', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Q stacks have a short window — chain them quickly and use the third Q tornado to set up R.',
      'E dashes reset on minion/monster kills; use minions to cross long gaps and reposition.',
      'Wind Wall (W) is your most important ability — save it for the highest-damage skillshot.',
    ],
  },

  zed: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Electrocute',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter', 'Transcendence', 'Gathering Storm'],
    },
    items: {
      mythic: 'Duskblade of Draktharr',
      boots: 'Ionian Boots of Lucidity',
      core: ['Serylda\'s Grudge', 'Edge of Night'],
      situational: ['Serpent\'s Fang', 'Umbral Glaive', 'Guardian Angel'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'W-Q-E-R-Q is the standard burst combo — practice it until it is second nature.',
      'Swap back to shadow early to bait enemies before swapping to the lethal position.',
      'Living Shadow (W) copies your Q — throw Q while shadows are active for double shuriken damage.',
    ],
  },

  lux: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Horizon Focus'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxLast: 'W', order: 'R > E > Q > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Root with Q then E to guarantee the slow field hit before detonating.',
      'R Finales Funkeln has an extremely short cooldown with CDR — spam it as a poking tool.',
      'Lucent Singularity (E) reveals stealthed units — throw it into brushes proactively.',
    ],
  },

  syndra: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Electrocute',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Electrocute', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Horizon Focus'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Collect Dark Spheres (Q) around you before using R — more spheres means more damage.',
      'W Scatter the Weak stuns enemies that collide with a sphere — place spheres before throwing W.',
      'Syndra at max Transcendence (level 16) deals massively more damage — play safely until then.',
    ],
  },

  annie: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Electrocute',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Electrocute', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Everfrost'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Maintain 4 Pyromania stacks before engaging — your next spell will stun.',
      'Flash-R into an enemy cluster is the classic wombo combo setup for your team.',
      'Q last-hitting minions refunds the mana cost — free poke during laning phase.',
    ],
  },

  ahri: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Electrocute',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Electrocute', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Everfrost'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Charm (E) into Orb of Deception is your primary kill setup — land E first for reliable combo.',
      'Spirit Rush (R) has three charges — use the first for engage, keep the last two for escapes.',
      'Q orb deals true damage on the return path; make sure to walk through the orb as it returns.',
    ],
  },

  orianna: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Gathering Storm', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Crown of the Shattered Queen'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Position the ball on a diving teammate then R to pull enemies into your team\'s CC.',
      'W (Command: Dissonance) disjoint projectiles — use it to interrupt incoming skill shots.',
      'Shield (E) movement speed bonus helps your ADC or jungler disengage or chase.',
    ],
  },

  veigar: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'First Strike',
      primary: 'Inspiration',
      secondary: 'Sorcery',
      page: ['First Strike', 'Magical Footwear', 'Future\'s Market', 'Cosmic Insight', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Horizon Focus'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Last-hit with Q Baleful Strike to stack Phenomenal Evil Power infinitely.',
      'Event Horizon (E) cage stuns enemies on the wall — walk them toward the edge.',
      'Primordial Burst (R) deals damage equal to target\'s max AP — burst squishies with full stacks.',
    ],
  },

  fizz: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Electrocute',
      primary: 'Domination',
      secondary: 'Sorcery',
      page: ['Electrocute', 'Sudden Impact', 'Eyeball Collection', 'Ultimate Hunter', 'Manaflow Band', 'Transcendence'],
    },
    items: {
      mythic: 'Hextech Rocketbelt',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', "Zhonya's Hourglass"],
      situational: ['Rabadon\'s Deathcap', 'Void Staff', 'Lich Bane'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Trickster (E) makes you untargetable — use it to dodge high-damage skill shots like Zed R.',
      'Rocketbelt active into R fish is the classic all-in combo — both land simultaneously.',
      'W applies on-hit, so activate it on a target to stick and stack damage over the duration.',
    ],
  },

  viktor: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Gathering Storm', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Luden\'s Tempest',
      boots: 'Sorcerer\'s Shoes',
      core: ['Shadowflame', 'Rabadon\'s Deathcap'],
      situational: ["Zhonya's Hourglass", 'Void Staff', 'Cosmic Drive'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Upgrade each ability with Hex Core — prioritize W Gravity Field for reliable CC.',
      'R Chaos Storm follows the cursor; move it into enemies to chain the zap damage.',
      'Q Power Transfer give a shield; use it before taking damage in trades for extra durability.',
    ],
  },

  // ─── BOT LANE (ADC) ──────────────────────────────────────────────────────────

  jinx: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Taste of Blood', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Runaan\'s Hurricane', 'Infinity Edge'],
      situational: ['Phantom Dancer', 'Mortal Reminder', 'Guinsoo\'s Rageblade'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Switch to Fishbones (rocket) in teamfights for AOE splash damage across the enemy team.',
      'Get Excited passive resets attack speed and movement speed on kill — clean up after kills.',
      'Super Mega Death Rocket (R) is a global — fire it early to finish low-HP enemies fleeing.',
    ],
  },

  caitlyn: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Sorcery',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down', 'Absolute Focus', 'Gathering Storm'],
    },
    items: {
      mythic: 'Galeforce',
      boots: 'Berserker\'s Greaves',
      core: ['Infinity Edge', 'Rapid Firecannon'],
      situational: ['Mortal Reminder', 'Phantom Dancer', 'Lord Dominik\'s Regards'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Trap + net combo: place Yordle Snap Trap (W) then net (E) enemies into it for the headshot.',
      'Galeforce dash fires while in mid-air — use it to reposition while dealing damage.',
      'Headshots on cc\'d targets deal 50% bonus damage — coordinate with support CC.',
    ],
  },

  ezreal: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Precision',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Gathering Storm', 'Presence of Mind', 'Legend: Alacrity'],
    },
    items: {
      mythic: 'Trinity Force',
      boots: 'Ionian Boots of Lucidity',
      core: ['Manamune', 'Serylda\'s Grudge'],
      situational: ['Death\'s Dance', 'Shadowflame', 'Serpent\'s Fang'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Q Mystic Shot applies on-hit effects and resets Spellblade — weave autos between Qs.',
      'E Arcane Shift is your only escape — save it rather than using it aggressively.',
      'Trueshot Barrage (R) is best used globally to steal objectives or finish off fleeing enemies.',
    ],
  },

  jhin: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Sorcery',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down', 'Absolute Focus', 'Gathering Storm'],
    },
    items: {
      mythic: 'Galeforce',
      boots: 'Berserker\'s Greaves',
      core: ['Infinity Edge', 'Rapid Firecannon'],
      situational: ['Mortal Reminder', 'Serpent\'s Fang', 'Collector'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Fourth shot (Whisper) deals crit and slows — save it for the highest-priority target.',
      'Dancing Grenade (Q) bounces off dead units dealing more damage — kill a minion first.',
      'W root chains with Curtain Call (R) — hit a rooted target with all four R shots.',
    ],
  },

  ashe: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down', 'Taste of Blood', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Runaan\'s Hurricane', 'Infinity Edge'],
      situational: ['Mortal Reminder', 'Lord Dominik\'s Regards', 'Phantom Dancer'],
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxLast: 'E', order: 'R > W > Q > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Volley (W) always crits on fully charged Focus passive — use it to poke at max stacks.',
      'Enchanted Crystal Arrow (R) is a global CC — fire it across the map to enable ganks.',
      'Hawkshot (E) reveals dragon/baron pit before objectives spawn — use it proactively.',
    ],
  },

  vayne: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Sudden Impact', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Guinsoo\'s Rageblade', 'Blade of the Ruined King'],
      situational: ['Wit\'s End', 'Phantom Dancer', 'Mortal Reminder'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Tumble (Q) resets your auto attack — use Q mid-auto for seamless DPS.',
      'Silver Bolts (W) third-hit true damage shreds tanks — keep stacking on the same target.',
      'Condemn (E) into a wall stuns — always position enemies near walls before engaging.',
    ],
  },

  'miss fortune': {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Blood Line', 'Cut Down', 'Taste of Blood', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Runaan\'s Hurricane', 'Lord Dominik\'s Regards'],
      situational: ['Infinity Edge', 'Mortal Reminder', 'Serylda\'s Grudge'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Bullet Time (R) is best cast through a narrow corridor or behind tanks pinning enemies.',
      'Double Up (Q) can bounce to a champion behind a minion — line it up intentionally.',
      'Love Tap passive doubles your next auto on a new target — swap targets frequently.',
    ],
  },

  draven: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Last Stand', 'Taste of Blood', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Infinity Edge', 'Collector'],
      situational: ['Lord Dominik\'s Regards', 'Mortal Reminder', 'Phantom Dancer'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Catch your axes by moving to where they land — plan movement patterns in advance.',
      'Juggling two spinning axes simultaneously doubles your DPS; practice catching both.',
      'Adoration (passive) stacks lost on death convert to gold on R kill — cash out carefully.',
    ],
  },

  tristana: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Domination',
      page: ['Lethal Tempo', 'Triumph', 'Legend: Alacrity', 'Cut Down', 'Taste of Blood', 'Treasure Hunter'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Infinity Edge', 'Guinsoo\'s Rageblade'],
      situational: ['Runaan\'s Hurricane', 'Phantom Dancer', 'Mortal Reminder'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'Q', maxLast: 'W', order: 'R > E > Q > W' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Explosive Charge (E) detonates with autos — stack it on the same target to burst them.',
      'Rocket Jump (W) resets on kills and assists — use it to fly around teamfights for safety.',
      'R Buster Shot knocks enemies back into turrets for the kill or into your team.',
    ],
  },

  sivir: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Lethal Tempo',
      primary: 'Precision',
      secondary: 'Inspiration',
      page: ['Lethal Tempo', 'Presence of Mind', 'Legend: Alacrity', 'Cut Down', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Kraken Slayer',
      boots: 'Berserker\'s Greaves',
      core: ['Runaan\'s Hurricane', 'Infinity Edge'],
      situational: ['Lord Dominik\'s Regards', 'Mortal Reminder', 'Phantom Dancer'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Ricochet (W) bounces infinitely during On the Hunt (R) — group to AOE the entire enemy team.',
      'Spell Shield (E) blocks targeted abilities and refunds mana — anticipate CC and block it.',
      'Q Boomerang Blade returns — you deal double damage if the enemy is on the return path.',
    ],
  },

  // ─── SUPPORT ─────────────────────────────────────────────────────────────────

  thresh: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Inspiration',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Locket of the Iron Solari',
      boots: 'Plated Steelcaps',
      core: ['Zeke\'s Convergence', 'Frozen Heart'],
      situational: ['Redemption', 'Knight\'s Vow', 'Force of Nature'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxLast: 'Q', order: 'R > E > W > Q' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Flay (E) passively adds magic damage to autos — stack souls for bonus armor.',
      'Death Sentence (Q) has a short windup; walk toward the target before throwing it.',
      'Lantern (W) can be used to save allies — throw it to a fleeing teammate under pressure.',
    ],
  },

  leona: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Inspiration',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Locket of the Iron Solari',
      boots: 'Plated Steelcaps',
      core: ['Zeke\'s Convergence', 'Frozen Heart'],
      situational: ['Warmog\'s Armor', 'Thornmail', 'Abyssal Mask'],
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'E', maxLast: 'Q', order: 'R > W > E > Q' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Activate W Shield of Daybreak before diving with E Zenith Blade for instant bonus resist.',
      'Eclipse (W) provides free armor/magic resist during the engage window.',
      'Solar Flare (R) is a point-and-click AOE stun — drop it on clustered enemies, not individuals.',
    ],
  },

  lulu: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Summon Aery',
      primary: 'Sorcery',
      secondary: 'Resolve',
      page: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Scorch', 'Font of Life', 'Revitalize'],
    },
    items: {
      mythic: 'Moonstone Renewer',
      boots: 'Ionian Boots of Lucidity',
      core: ['Staff of Flowing Water', 'Ardent Censer'],
      situational: ['Redemption', 'Mikael\'s Blessing', 'Shurelya\'s Battlesong'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Wild Growth (R) on your carry during a dive makes them unkillable for 1 second and launches enemies.',
      'Whimsy (W) is both a polymorph on enemies and a haste on allies — use it situationally.',
      'Pix shields on E proc Moonstone Renewer and Ardent Censer simultaneously.',
    ],
  },

  blitzcrank: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Inspiration',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Locket of the Iron Solari',
      boots: 'Plated Steelcaps',
      core: ['Zeke\'s Convergence', 'Frozen Heart'],
      situational: ['Warmog\'s Armor', 'Redemption', "Dead Man's Plate"],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Rocket Grab (Q) pulls isolated targets directly in front of you — always hook from brush.',
      'Power Fist (E) charges during W Overdrive; activate W before initiating for a faster combo.',
      'Static Field (R) silences hit targets — immediately follow a Q hook with R and E.',
    ],
  },

  nami: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Summon Aery',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Scorch', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Moonstone Renewer',
      boots: 'Ionian Boots of Lucidity',
      core: ['Staff of Flowing Water', 'Ardent Censer'],
      situational: ['Redemption', 'Mikael\'s Blessing', 'Imperial Mandate'],
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxLast: 'E', order: 'R > W > Q > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Tidal Wave (R) knocks up and slows; fire it from max range through narrow chokepoints.',
      'Ebb and Flow (W) bounces between allies and enemies — aim to hit three targets for max efficiency.',
      'Tidecaller\'s Blessing (E) empowers an ally\'s autos with slow for a set time — pair it with an AA-reliant carry.',
    ],
  },

  nautilus: {
    tier: 'S',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Aftershock',
      primary: 'Resolve',
      secondary: 'Inspiration',
      page: ['Aftershock', 'Font of Life', 'Conditioning', 'Overgrowth', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Locket of the Iron Solari',
      boots: 'Plated Steelcaps',
      core: ['Zeke\'s Convergence', 'Frozen Heart'],
      situational: ['Warmog\'s Armor', 'Thornmail', 'Abyssal Mask'],
    },
    skillOrder: { maxFirst: 'E', maxSecond: 'W', maxLast: 'Q', order: 'R > E > W > Q' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Dredge Line (Q) hooks you to the target — throw it from brush for surprise engages.',
      'Depth Charge (R) travels underground to the target, knocking up everything in between.',
      'Riptide (E) applies a root on proc — use it immediately after hooking to extend CC.',
    ],
  },

  soraka: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Summon Aery',
      primary: 'Sorcery',
      secondary: 'Resolve',
      page: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Scorch', 'Font of Life', 'Revitalize'],
    },
    items: {
      mythic: 'Moonstone Renewer',
      boots: 'Ionian Boots of Lucidity',
      core: ['Redemption', 'Ardent Censer'],
      situational: ['Staff of Flowing Water', 'Mikael\'s Blessing', 'Warmog\'s Armor'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Wish (R) is global — track ally HP and cast it the moment multiple allies drop to low HP.',
      'Starcall (Q) grants self-healing when you hit an enemy — poke aggressively to maintain health.',
      'Equinox (E) silence is short — use it to interrupt a key channeled ability or dodge a gap-close.',
    ],
  },

  janna: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Summon Aery',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Summon Aery', 'Manaflow Band', 'Transcendence', 'Scorch', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Shurelya\'s Battlesong',
      boots: 'Ionian Boots of Lucidity',
      core: ['Redemption', 'Staff of Flowing Water'],
      situational: ['Ardent Censer', 'Mikael\'s Blessing', 'Frozen Heart'],
    },
    skillOrder: { maxFirst: 'W', maxSecond: 'Q', maxLast: 'E', order: 'R > W > Q > E' },
    summonerSpells: ['Flash', 'Heal'],
    tips: [
      'Monsoon (R) pushes enemies away and heals — use it to peel assassins diving your carry.',
      'Howling Gale (Q) can be released early — charge for at least 0.5 seconds for a meaningful knockup.',
      'Zephyr (W) passive gives you movement speed to peel or disengage ahead of your ADC.',
    ],
  },

  morgana: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Arcane Comet',
      primary: 'Sorcery',
      secondary: 'Inspiration',
      page: ['Arcane Comet', 'Manaflow Band', 'Transcendence', 'Scorch', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Locket of the Iron Solari',
      boots: 'Ionian Boots of Lucidity',
      core: ['Zhonya\'s Hourglass', 'Demonic Embrace'],
      situational: ['Shadowflame', 'Cosmic Drive', 'Imperial Mandate'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'W', maxLast: 'E', order: 'R > Q > W > E' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Black Shield (E) blocks CC on an ally — prioritize using it on your ADC before a Leona dive.',
      'Tormented Shadow (W) is your wave clear and zoning tool — drop it under enemies landing from a Shackle.',
      'Soul Shackles (R) stuns after 3 seconds — Zhonya immediately after engaging to survive the burst.',
    ],
  },

  pyke: {
    tier: 'A',
    patch: '15.4',
    source: 'Challenger EUW/KR',
    runes: {
      keystone: 'Hail of Blades',
      primary: 'Domination',
      secondary: 'Inspiration',
      page: ['Hail of Blades', 'Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter', 'Magical Footwear', 'Cosmic Insight'],
    },
    items: {
      mythic: 'Duskblade of Draktharr',
      boots: 'Ionian Boots of Lucidity',
      core: ['Edge of Night', 'Umbral Glaive'],
      situational: ['Serpent\'s Fang', 'Axiom Arc', 'Black Cleaver'],
    },
    skillOrder: { maxFirst: 'Q', maxSecond: 'E', maxLast: 'W', order: 'R > Q > E > W' },
    summonerSpells: ['Flash', 'Ignite'],
    tips: [
      'Death from Below (R) resets on kills and grants bonus gold to the last ally that dealt damage.',
      'Ghostwater Dive (W) camouflage lets you roam freely — look for mid lane after vision clears.',
      'Bone Skewer (Q) can hook or stab — tap for stab, hold for hook. Use the hook to set up roam kills.',
    ],
  },
};

export function getBuild(championId) {
  return metaBuilds[championId] || null;
}
