export type WinCondition = "highest" | "lowest";
export type GameCategory = "card" | "board" | "dice" | "tile" | "trick" | "outdoor" | "billiards" | "general";

export interface ScoreRule {
  id: string;
  label: string;
  points: number;
}

export interface Phase {
  number: number;
  description: string;
}

export interface HouseRuleOverride {
  ruleId: string;
  label: string;
  defaultValue: number;
  currentValue: number;
}

// ─── Uno Card Definition ────────────────────────────────────────────────────
export interface UnoCard {
  name: string;
  points: number;
  qty?: string;
  description?: string;
  isWild?: boolean;
  isDark?: boolean;
  isSpecial?: boolean;
}

export interface UnoScoringGroup {
  label: string;
  points: number | null; 
  cards: UnoCard[];
}

// ─── Uno Variant ────────────────────────────────────────────────────────────
export interface UnoVariantDef {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  color: string;
  accentColor?: string;
  icon: string;
  deckSize: number;
  targetScore: number;
  description: string;
  numberRange: { min: number; max: number };
  numberValueRule: string;
  hasAllWild?: boolean;
  scoringGroups: UnoScoringGroup[];
  houseRules: HouseRuleOverride[];
  quickPenalties: { id: string; label: string; points: number }[];
  notes?: string[];
}

// ─── Phase 10 Variant ───────────────────────────────────────────────────────
export interface Phase10VariantDef {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  color: string;
  icon: string;
  description: string;
  phases: Phase[];
  scoring?: ScoreRule[];
  houseRules?: HouseRuleOverride[];
  notes?: string[];
}

// ─── Trick-Taking Variant ──────────────────────────────────────────────────
export interface TrickVariantDef {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  color: string;
  icon: string;
  description: string;
  targetScore: number;
  hasBidding: boolean;
  isPartnership: boolean;
  scoringRules: ScoreRule[];
  houseRules?: HouseRuleOverride[];
  notes?: string[];
}

// ─── Rummy Variant ──────────────────────────────────────────────────────────
export interface RummyVariantDef {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  color: string;
  icon: string;
  description: string;
  targetScore: number;
  maxPenalty: number;
  dropPenalties: { [key: string]: number };
  cardValues: { [key: string]: number | string };
  bonuses?: { [key: string]: number };
  scoringRules?: ScoreRule[];
  houseRules?: HouseRuleOverride[];
  notes?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  9 UNO VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const UNO_VARIANTS: UnoVariantDef[] = [
  {
    id: "uno_standard",
    name: "Standard UNO",
    tagline: "The original. 108 cards.",
    badge: "CLASSIC",
    color: "#FF5C5C",
    icon: "layers",
    deckSize: 108,
    targetScore: 500,
    description: "Classic UNO. Match color or number, shout UNO when you have one card left.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0–9",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Skip", points: 20 },
          { name: "Reverse", points: 20 },
          { name: "Draw Two", points: 20 },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [
          { name: "Wild", points: 50, isWild: true },
          { name: "Wild Draw Four", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_val", label: "Wild Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_val", label: "Action Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { id: "qp_act", label: "+20 Action", points: 20 },
      { id: "qp_wld", label: "+50 Wild", points: 50 },
    ],
  },
  {
    id: "uno_dos",
    name: "UNO DOS",
    tagline: "Two discard piles.",
    badge: "DOS",
    color: "#FF5C5C",
    icon: "filter-2",
    deckSize: 108,
    targetScore: 200,
    description: "Match two cards at once. Numbers go up to 10.",
    numberRange: { min: 1, max: 10 },
    numberValueRule: "Face value 1–10",
    scoringGroups: [
      {
        label: "Special Cards",
        points: null,
        cards: [
          { name: "Skip/Reverse", points: 20 },
          { name: "Wild DOS", points: 20, isWild: true },
          { name: "Wild Number", points: 40, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_wnum", label: "+40 Wild #", points: 40 }],
  },
  {
    id: "uno_flip",
    name: "UNO Flip!",
    tagline: "Light/Dark sided deck.",
    badge: "DUAL",
    color: "#FF5C5C",
    icon: "swap-horizontal",
    deckSize: 112,
    targetScore: 500,
    description: "Flip card switches active side.",
    numberRange: { min: 1, max: 9 },
    numberValueRule: "Face value 1–9",
    scoringGroups: [
      {
        label: "Light Side",
        points: null,
        cards: [
          { name: "Flip/Action", points: 20 },
          { name: "Wild", points: 40, isWild: true },
          { name: "Wild Draw 2", points: 50, isWild: true },
        ],
      },
      {
        label: "Dark Side",
        points: null,
        cards: [
          { name: "Dark Flip", points: 20 },
          { name: "Draw 5", points: 20 },
          { name: "Wild Draw Color", points: 60, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_dwld", label: "+60 Dark Wild", points: 60 }],
  },
  {
    id: "uno_attack",
    name: "UNO Attack!",
    tagline: "Motorized launcher.",
    badge: "LAUNCHER",
    color: "#FF5C5C",
    icon: "flash",
    deckSize: 112,
    targetScore: 500,
    description: "Press launcher for random card penalty.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0–9",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Hit 2", points: 20 },
          { name: "Discard All", points: 20 },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [{ name: "Wild Attack", points: 50, isWild: true }],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_att", label: "+50 Wild", points: 50 }],
  },
  {
    id: "uno_flex",
    name: "UNO Flex",
    tagline: "Modify your cards.",
    badge: "FLEX",
    color: "#FF5C5C",
    icon: "infinite",
    deckSize: 112,
    targetScore: 500,
    description: "Flex cards have secondary powers.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0–9",
    scoringGroups: [
      {
        label: "Flex Actions",
        points: 20,
        cards: [
          { name: "Flex Skip/Rev", points: 20 },
          { name: "Flex Wild", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_flex", label: "+50 Flex Wild", points: 50 }],
  },
  {
    id: "uno_all_wild",
    name: "UNO All Wild!",
    tagline: "No numbers, just wilds.",
    badge: "WILD",
    color: "#FF5C5C",
    icon: "star",
    deckSize: 112,
    targetScore: 500,
    description: "Every card is a Wild.",
    numberRange: { min: 0, max: 0 },
    numberValueRule: "All cards are wilds",
    hasAllWild: true,
    scoringGroups: [
      {
        label: "Wilds",
        points: null,
        cards: [
          { name: "Standard Wild", points: 20, isWild: true },
          { name: "Power Wild", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_pwld", label: "+50 Power Wild", points: 50 }],
  },
  {
    id: "uno_no_mercy",
    name: "UNO No Mercy",
    tagline: "Stacking and Elimination.",
    badge: "BRUTAL",
    color: "#FF5C5C",
    icon: "skull",
    deckSize: 168,
    targetScore: 1000,
    description: "Brutal stacking and player elimination.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0–9",
    scoringGroups: [
      {
        label: "Brutal Actions",
        points: 20,
        cards: [
          { name: "Skip Everyone", points: 20 },
          { name: "Wild Draw 6/10", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [{ ruleId: "merc", label: "Mercy (200 pts)", defaultValue: 1, currentValue: 1 }],
    quickPenalties: [{ id: "qp_bwild", label: "+50 Brutal Wild", points: 50 }],
  },
  {
    id: "uno_express",
    name: "UNO Express",
    tagline: "Faster speed.",
    badge: "FAST",
    color: "#FF5C5C",
    icon: "zap",
    deckSize: 56,
    targetScore: 250,
    description: "Fast-paced smaller deck.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0–9",
    scoringGroups: [
      {
        label: "Fast Actions",
        points: 20,
        cards: [
          { name: "Draw One", points: 20 },
          { name: "Wild", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_wld", label: "+50 Wild", points: 50 }],
  },
  {
    id: "uno_flip_express",
    name: "UNO Flip! Express",
    tagline: "Flip + Fast.",
    badge: "NEW",
    color: "#FF5C5C",
    icon: "swap-horizontal",
    deckSize: 56,
    targetScore: 250,
    description: "Dual sides meets Express speed.",
    numberRange: { min: 1, max: 9 },
    numberValueRule: "Face value 1–9",
    scoringGroups: [
      {
        label: "Light Side",
        points: null,
        cards: [
          { name: "Draw One", points: 10 },
          { name: "Rev/Skip/Flip", points: 20 },
          { name: "Wild", points: 40, isWild: true },
          { name: "Wild Draw Two", points: 50, isWild: true },
        ],
      },
      {
        label: "Dark Side",
        points: null,
        cards: [
          { name: "Draw Five", points: 20 },
          { name: "Skip Everyone", points: 30 },
          { name: "Wild Draw Col", points: 60, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [{ id: "qp_wcl", label: "Wild Color", points: 60 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 10 & OTHER GAMES
// ═══════════════════════════════════════════════════════════════════════════
export const PHASE10_VARIANTS: Phase10VariantDef[] = [
  {
    id: "phase10_standard",
    name: "Standard",
    tagline: "Sequential game.",
    badge: "CLASSIC",
    color: "#00BFFF",
    icon: "list",
    description: "10 phases.",
    phases: [
      { number: 1, description: "2 sets of 3 (e.g., Three 4s and three 9s)" },
      { number: 2, description: "1 set of 3 + 1 run of 4 (e.g., Three 7s AND a run of 2, 3, 4, 5)" },
      { number: 3, description: "1 set of 4 + 1 run of 4 (e.g., Four 2s AND a run of 6, 7, 8, 9)" },
      { number: 4, description: "1 run of 7 (e.g., 4, 5, 6, 7, 8, 9, 10)" },
      { number: 5, description: "1 run of 8 (e.g., 2, 3, 4, 5, 6, 7, 8, 9)" },
      { number: 6, description: "1 run of 9 (e.g., 1, 2, 3, 4, 5, 6, 7, 8, 9)" },
      { number: 7, description: "2 sets of 4 (e.g., Four 5s and four 10s)" },
      { number: 8, description: "7 cards of 1 color (e.g., Seven Green cards)" },
      { number: 9, description: "1 set of 5 + 1 set of 2 (e.g., Five 8s and two 3s)" },
      { number: 10, description: "1 set of 5 + 1 set of 3 (e.g., Five 12s and three 1s)" },
    ],
    notes: ["Colors only matter for Phase 8. For sets or runs, colors can mix."],
    scoring: [
      { id: "p1_9", label: "Cards 1–9", points: 5 },
      { id: "p10_12", label: "Cards 10–12", points: 10 },
      { id: "pskip", label: "Skip", points: 15 },
      { id: "pwild", label: "Wildcard", points: 25 },
    ],
  },
  {
    id: "phase10_express",
    name: "Express",
    tagline: "Fast phases.",
    badge: "FAST",
    color: "#00BFFF",
    icon: "flash",
    description: "Shortened phases.",
    phases: [
      { number: 1, description: "4 Odd Cards (e.g., 1, 3, 5, 9 in any colors)" },
      { number: 2, description: "2 Sets of 2 (e.g., two 4s and two 8s)" },
      { number: 3, description: "4 Even Cards (e.g., 2, 4, 8, 12 in any colors)" },
      { number: 4, description: "Run of 2 Pairs (Two consecutive pairs, e.g., two 5s and two 6s)" },
      { number: 5, description: "1 Set of 3 (e.g., three 7s)" },
      { number: 6, description: "1 Run of 4 (e.g., 3, 4, 5, 6)" },
      { number: 7, description: "1 Color Run of 3 (e.g., Red 5, Red 6, Red 7)" },
      { number: 8, description: "Run of 4 Odd (Consecutive odds, e.g., 3, 5, 7, 9)" },
      { number: 9, description: "Run of 4 Even (Consecutive evens, e.g., 2, 4, 6, 8)" },
      { number: 10, description: "4 of One Color (e.g., four Blue cards, regardless of number)" },
    ],
  },
  { id: "phase10_even_odd", name: "Even/Odd", tagline: "Numerical parity.", badge: "VARY", color: "#00BFFF", icon: "calculator", description: "Numerical strategy.", phases: Array.from({ length: 4 }, (_, i) => ({ number: i+1, description: "Parity Phase" })), houseRules: [{ ruleId: "cap", label: "Point Cap", defaultValue: 500, currentValue: 500 }] },
  { 
    id: "phase10_masters", 
    name: "Masters", 
    tagline: "Any order strategy.", 
    badge: "PICK", 
    color: "#00BFFF", 
    icon: "medal", 
    description: "Strategic non-linear gameplay.", 
    phases: [
      { number: 1, description: "2 sets of 3" },
      { number: 2, description: "1 set of 3 + 1 run of 4" },
      { number: 3, description: "1 set of 4 + 1 run of 4" },
      { number: 4, description: "1 run of 7" },
      { number: 5, description: "1 run of 8" },
      { number: 6, description: "1 run of 9" },
      { number: 7, description: "2 sets of 4" },
      { number: 8, description: "7 cards of 1 color" },
      { number: 9, description: "1 set of 5 + 1 set of 2" },
      { number: 10, description: "1 set of 5 + 1 set of 3" },
    ],
    notes: [
      "Play in Any Order: Secretly choose your phase each round.",
      "The Save Pile: Save one card face-down per round for future use.",
      "Winning: Still need all 10 phases, but can pick the order."
    ]
  },
  { 
    id: "phase10_junior", 
    name: "Junior", 
    tagline: "Simplified for kids (4+).", 
    badge: "KIDS", 
    color: "#00BFFF", 
    icon: "happy", 
    description: "No math, just animals and shapes.", 
    phases: [
      { number: 1, description: "Match 4 Cards with the same Animal" },
      { number: 2, description: "Match 4 Cards of the same Color" },
      { number: 3, description: "Match 2 Animals + 2 Colors" },
      { number: 4, description: "Sequence of 4 different Animals" },
      { number: 5, description: "Collect 4 Star Cards" },
      { number: 6, description: "Match 4 Cards with the same Shape" },
      { number: 7, description: "Collect 4 Blue Cards" },
      { number: 8, description: "Match 3 of Kind + 1 Wild" },
      { number: 9, description: "Sequence of 4 Colors" },
      { number: 10, description: "Match any 4 Cards of your choice" },
    ],
    notes: [
      "Hand Size: Players only hold 4 cards at a time.",
      "Gameplay: Draw a card and check if you satisfy one of your Phase Tokens.",
      "Two Levels: Easy level for starts, advanced for color+animal combos.",
      "Winning: First to flip 10 Phase Tokens wins."
    ]
  },
];

export const SPADES_VARIANTS: TrickVariantDef[] = [
  {
    id: "spades_standard",
    name: "Standard",
    tagline: "Partnership.",
    badge: "CLASSIC",
    color: "#A29BFE",
    icon: "triangle",
    description: "Classic Spades.",
    targetScore: 500,
    hasBidding: true,
    isPartnership: true,
    scoringRules: [
      { id: "tr", label: "Tricks", points: 10 },
      { id: "bg", label: "Bags", points: 1 },
    ],
  },
  { id: "spades_suicide", name: "Suicide", tagline: "Nil rule.", badge: "BRUTAL", color: "#6B21E8", icon: "alert-circle", description: "One partner must bid Nil.", targetScore: 500, hasBidding: true, isPartnership: true, scoringRules: [{ id: "tr", label: "Tricks", points: 10 }] },
];

export const HEARTS_VARIANTS: TrickVariantDef[] = [
  {
    id: "hearts_standard",
    name: "Standard",
    tagline: "Avoid points.",
    badge: "CLASSIC",
    color: "#FF2D78",
    icon: "heart",
    description: "Don't take penalty cards.",
    targetScore: 100,
    hasBidding: false,
    isPartnership: false,
    scoringRules: [
      { id: "ht", label: "Hearts", points: 1 },
      { id: "qs", label: "Queen Spades", points: 13 },
    ],
  },
];

export const RUMMY_VARIANTS: RummyVariantDef[] = [
  {
    id: "rummy_indian",
    name: "Indian Rummy",
    tagline: "13 cards.",
    badge: "MELTING",
    color: "#FFB800",
    icon: "grid",
    description: "Requires pure sequence.",
    targetScore: 300,
    maxPenalty: 80,
    dropPenalties: { first: 20, middle: 40 },
    cardValues: { jokers: 0 },
    scoringRules: [{ id: "un", label: "Unmatched", points: 1 }],
  },
  {
    id: "rummy_gin",
    name: "Gin Rummy",
    tagline: "2-player.",
    badge: "KNOCK",
    color: "#FFB800",
    icon: "git-commit",
    description: "Minimize deadwood.",
    targetScore: 100,
    maxPenalty: 100,
    dropPenalties: {},
    cardValues: {},
    bonuses: { gin: 25 },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  GAME DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
export interface GameDefinition {
  id: string;
  name: string;
  category: GameCategory;
  icon: string;
  color: string;
  winCondition: WinCondition;
  targetScore?: number;
  maxPlayers: number;
  minPlayers: number;
  description: string;
  objective: string;
  scoreRules?: ScoreRule[];
  phases?: Phase[];
  houseRules: HouseRuleOverride[];
  hasCalculator: boolean;
  quickPenalties?: { id: string; label: string; points: number }[];
  hasVariants?: boolean;
  parentId?: string;
}

export const GAMES: GameDefinition[] = [
  {
    id: "uno",
    name: "Uno",
    category: "card",
    icon: "layers",
    color: "#FF5C5C",
    winCondition: "lowest" as WinCondition,
    minPlayers: 2,
    maxPlayers: 20,
    description: "9 variants available.",
    objective: "Shed all cards.",
    hasVariants: true,
    houseRules: [],
    hasCalculator: false,
  },
  ...UNO_VARIANTS.map(v => ({
    id: v.id,
    name: v.name,
    category: "card" as GameCategory,
    icon: v.icon,
    color: "#FF5C5C",
    winCondition: "lowest" as WinCondition,
    targetScore: v.targetScore,
    minPlayers: 2,
    maxPlayers: 20,
    description: v.description,
    objective: `First to ${v.targetScore} wins.`,
    parentId: "uno",
    scoreRules: [
      ...(v.hasAllWild ? [] : [{ id: "num", label: "Number Cards", points: 0 }]),
      ...v.scoringGroups.flatMap(g => 
        g.cards.map(c => ({ id: `c_${c.name.replace(/\s+/g, '_').toLowerCase()}`, label: c.name, points: c.points }))
      )
    ],
    houseRules: v.houseRules,
    hasCalculator: true,
    quickPenalties: v.quickPenalties
  })),

  {
    id: "phase10",
    name: "Phase 10",
    category: "card",
    icon: "layers",
    color: "#00BFFF",
    winCondition: "lowest" as WinCondition,
    minPlayers: 2,
    maxPlayers: 20,
    description: "5 variants available.",
    objective: "Finish 10 phases.",
    hasVariants: true,
    houseRules: [],
    hasCalculator: false,
  },
  ...PHASE10_VARIANTS.map(v => ({
    id: v.id,
    name: v.name,
    category: "card" as GameCategory,
    icon: v.icon,
    color: "#00BFFF",
    winCondition: "lowest" as WinCondition,
    minPlayers: 2,
    maxPlayers: 20,
    description: v.description,
    objective: "Finish all phases.",
    parentId: "phase10",
    scoreRules: v.scoring || [
      { id: "p1_9", label: "Cards 1–9", points: 5 },
      { id: "p10_12", label: "Cards 10–12", points: 10 },
      { id: "pskip", label: "Skip", points: 15 },
      { id: "pwild", label: "Wildcard", points: 25 },
    ],
    houseRules: v.houseRules || [],
    hasCalculator: true,
  })),

  { id: "spades", name: "Spades", category: "trick", icon: "triangle", color: "#A29BFE", winCondition: "highest" as WinCondition, minPlayers: 4, maxPlayers: 20, description: "Bidding game.", objective: "Highest partnership wins.", hasVariants: true, houseRules: [], hasCalculator: false },
  ...SPADES_VARIANTS.map(v => ({ id: v.id, name: v.name, category: "trick" as GameCategory, icon: v.icon, color: "#A29BFE", winCondition: "highest" as WinCondition, targetScore: v.targetScore, minPlayers: 4, maxPlayers: 20, description: v.description, objective: "Reach target score.", parentId: "spades", scoreRules: v.scoringRules, houseRules: v.houseRules || [], hasCalculator: true })),

  { id: "hearts", name: "Hearts", category: "trick", icon: "heart", color: "#FF2D78", winCondition: "lowest" as WinCondition, minPlayers: 4, maxPlayers: 20, description: "Avoid cards.", objective: "Avoid penalty cards.", hasVariants: true, houseRules: [], hasCalculator: false },
  ...HEARTS_VARIANTS.map(v => ({ id: v.id, name: v.name, category: "trick" as GameCategory, icon: v.icon, color: "#FF2D78", winCondition: "lowest" as WinCondition, targetScore: v.targetScore, minPlayers: 4, maxPlayers: 20, description: v.description, objective: "Avoid penalty cards.", parentId: "hearts", scoreRules: v.scoringRules, houseRules: v.houseRules || [], hasCalculator: true })),

  { id: "rummy", name: "Rummy", category: "card", icon: "grid", color: "#FFB800", winCondition: "lowest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Indian & Gin Rummy.", objective: "Empty hand first.", hasVariants: true, houseRules: [], hasCalculator: false },
  ...RUMMY_VARIANTS.map(v => ({ id: v.id, name: v.name, category: "card" as GameCategory, icon: v.icon, color: "#FFB800", winCondition: (v.id === "rummy_gin" ? "highest" : "lowest") as WinCondition, minPlayers: 2, maxPlayers: 20, description: v.description, objective: "Meld all cards.", parentId: "rummy", scoreRules: v.scoringRules || [], houseRules: v.houseRules || [], hasCalculator: true })),

  { id: "skyjo", name: "Skyjo", category: "card", icon: "grid", color: "#27AE60", winCondition: "lowest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Grid strategy.", objective: "Lowest score wins.", scoreRules: [{ id: "grd", label: "Grid Sum", points: 0 }], houseRules: [], hasCalculator: true },
  { id: "catan", name: "Catan", category: "board", icon: "hexagon", color: "#D35400", winCondition: "highest" as WinCondition, minPlayers: 3, maxPlayers: 20, description: "Colonize Catan.", objective: "10 Victory Points.", scoreRules: [{ id: "st", label: "Settlements", points: 1 }, { id: "ct", label: "Cities", points: 2 }], houseRules: [], hasCalculator: true },
  { id: "golf", name: "Golf", category: "outdoor", icon: "flag", color: "#2ECC71", winCondition: "lowest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Low score wins.", objective: "Lowest overall score.", houseRules: [], hasCalculator: true },
  { id: "custom_game", name: "Custom Game", category: "general", icon: "add-circle", color: "#00D2FF", winCondition: "highest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Any other game.", objective: "Win based on your own rules.", scoreRules: Array.from({ length: 10 }, (_, i) => ({ id: `n${i+1}`, label: `${i+1}`, points: i+1 })), houseRules: [], hasCalculator: true },
  { id: "game_tools", name: "Game Night Tools", category: "general", icon: "extension-puzzle", color: "#00F5A0", winCondition: "highest" as WinCondition, minPlayers: 1, maxPlayers: 20, description: "Dice & tools.", objective: "Enhance your game night.", houseRules: [], hasCalculator: false },
  { id: "five_crowns", name: "Five Crowns", category: "card", icon: "ribbon", color: "#F39C12", winCondition: "lowest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Rummy with 5 suits.", objective: "Score lowest.", houseRules: [], hasCalculator: true },
  { id: "skip_bo", name: "Skip-Bo", category: "card", icon: "fast-forward", color: "#E67E22", winCondition: "lowest" as WinCondition, targetScore: 500, minPlayers: 2, maxPlayers: 20, description: "Sequence game.", objective: "Clear your stock pile.", houseRules: [{ ruleId: "stock", label: "Stock Pile", defaultValue: 30, currentValue: 30 }, { ruleId: "hand", label: "Hand Size", defaultValue: 5, currentValue: 5 }], hasCalculator: true },
  { id: "seven_wonders", name: "7 Wonders", category: "board", icon: "business", color: "#8E44AD", winCondition: "highest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Civilization drafting.", objective: "Highest score.", houseRules: [], hasCalculator: true },
  { id: "carcassonne", name: "Carcassonne", category: "board", icon: "map", color: "#3498DB", winCondition: "highest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Tile laying.", objective: "Highest score.", houseRules: [], hasCalculator: true },
  { id: "moelkky", name: "Mölkky", category: "outdoor", icon: "pin", color: "#D35400", winCondition: "highest" as WinCondition, targetScore: 50, minPlayers: 2, maxPlayers: 20, description: "Finnish throwing.", objective: "Exactly 50 points.", houseRules: [], hasCalculator: true },
  { id: "cornhole", name: "Cornhole", category: "outdoor", icon: "radio-button-on", color: "#C0392B", winCondition: "highest" as WinCondition, targetScore: 21, minPlayers: 2, maxPlayers: 20, description: "Bag toss.", objective: "First to 21.", houseRules: [], hasCalculator: true },
  { id: "skull_king", name: "Skull King", category: "trick", icon: "anchor", color: "#1ABC9C", winCondition: "highest" as WinCondition, minPlayers: 2, maxPlayers: 20, description: "Pirate bidding.", objective: "Predict tricks.", houseRules: [], hasCalculator: true },
  { id: "wizard", name: "Wizard", category: "trick", icon: "star", color: "#8E44AD", winCondition: "highest" as WinCondition, minPlayers: 3, maxPlayers: 20, description: "Bidding strategy.", objective: "Predict tricks.", houseRules: [], hasCalculator: true },
  { id: "canasta", name: "Canasta", category: "card", icon: "folder", color: "#D35400", winCondition: "highest" as WinCondition, targetScore: 5000, minPlayers: 4, maxPlayers: 20, description: "Partnership melds.", objective: "First to 5,000.", houseRules: [], hasCalculator: true },
  { id: "dutch_blitz", name: "Dutch Blitz", category: "card", icon: "zap", color: "#F1C40F", winCondition: "highest" as WinCondition, targetScore: 75, minPlayers: 2, maxPlayers: 20, description: "Vonderful goot!", objective: "First to 75.", houseRules: [], hasCalculator: true },
];

export const MAIN_GAMES = GAMES.filter(g => !g.parentId);

export const GAME_CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: "card", label: "Cards", icon: "layers" },
  { id: "board", label: "Board", icon: "grid" },
  { id: "trick", label: "Trick", icon: "award" },
  { id: "billiards", label: "Pool", icon: "disc" },
  { id: "outdoor", label: "Outdoor", icon: "pin" },
  { id: "general", label: "General", icon: "apps" },
];

export function getGameById(id: string) { return GAMES.find(g => g.id === id); }
