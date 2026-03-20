export type WinCondition = "highest" | "lowest";
export type GameCategory = "card" | "board" | "dice" | "tile" | "trick" | "uno" | "outdoor" | "billiards";

export interface ScoreRule {
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
  label: string;         // e.g. "Action Cards", "Wild Cards"
  points: number | null; // null means "varies / face value"
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
  // Number card range & scoring
  numberRange: { min: number; max: number }; // e.g. {min:0,max:9} or {min:1,max:10}
  numberValueRule: string;                   // displayed text
  hasAllWild?: boolean;                      // no number cards (All Wild!)
  // Card groups
  scoringGroups: UnoScoringGroup[];
  // Bonuses
  bonuses?: { label: string; points: number }[];
  // House rules
  houseRules: HouseRuleOverride[];
  quickPenalties: { label: string; points: number }[];
  // Notes
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
  notes?: string[];
  common_special_phases?: string[];
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
  notes?: string[];
}

// ─── Skyjo Definition ───────────────────────────────────────────────────────
export interface SkyjoDef {
  id: string;
  name: string;
  gridSize: { rows: number; cols: number }; // 3x4
  targetScore: number;                      // 100
  scoringRange: { min: number; max: number }; // -2 to 12
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
  notes?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  8 UNO VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const UNO_VARIANTS: UnoVariantDef[] = [
  {
    id: "uno_standard",
    name: "Standard UNO",
    tagline: "The original. 108 cards. No mercy.",
    badge: "CLASSIC",
    color: "#FF2D78",
    icon: "layers",
    deckSize: 108,
    targetScore: 500,
    description: "The original UNO. Match color or number, use action cards to slow opponents down, and shout UNO when you have one card left.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Each number card = its face value (0 = 0 pts, 9 = 9 pts)",
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
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 Action", points: 20 },
      { label: "+50 Wild", points: 50 },
    ],
    notes: ["First player to 500 total points wins", "Winner scores from all other hands combined"],
  },
  {
    id: "uno_dos",
    name: "UNO DOS",
    tagline: "Two discard piles. Double the chaos.",
    badge: "DOS",
    color: "#FF4D98",
    icon: "filter-2",
    deckSize: 108,
    targetScore: 200,
    description: "Match two cards at once with a DOS play to clear one pile. Numbers go up to 10.",
    numberRange: { min: 1, max: 10 },
    numberValueRule: "Face value — 1 = 1 pt through 10 = 10 pts",
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
    quickPenalties: [
      { label: "+20 Action/Wild", points: 20 },
      { label: "+40 Wild #", points: 40 },
    ],
  },
  {
    id: "uno_flip",
    name: "UNO Flip!",
    tagline: "Light side and dark side.",
    badge: "DUAL",
    color: "#FF6DAB",
    icon: "swap-horizontal",
    deckSize: 112,
    targetScore: 500,
    description: "The Flip card switches the entire active deck to the more brutal dark side.",
    numberRange: { min: 1, max: 9 },
    numberValueRule: "Face value on both sides",
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
    quickPenalties: [
      { label: "+20 Action", points: 20 },
      { label: "+40 Wild", points: 40 },
      { label: "+60 Dark Wild", points: 60 },
    ],
  },
  {
    id: "uno_attack",
    name: "UNO Attack!",
    tagline: "112 cards + motorized launcher.",
    badge: "LAUNCHER",
    color: "#FF8DBE",
    icon: "flash",
    deckSize: 112,
    targetScore: 500,
    description: "Press the motorized card launcher — it may shoot 0 to 6+ cards out randomly.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0-9",
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
        cards: [
          { name: "Wild Attack", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [
      { label: "+20 Action", points: 20 },
      { label: "+50 Wild", points: 50 },
    ],
  },
  {
    id: "uno_flex",
    name: "UNO Flex",
    tagline: "Bending the rules with Flex cards.",
    badge: "FLEX",
    color: "#FFADC1",
    icon: "infinite",
    deckSize: 112,
    targetScore: 500,
    description: "Flex cards let you modify their effect — like choosing who gets skipped.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0-9",
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
    quickPenalties: [
      { label: "+20 Flex", points: 20 },
      { label: "+50 Flex Wild", points: 50 },
    ],
  },
  {
    id: "uno_all_wild",
    name: "UNO All Wild!",
    tagline: "Every single card is a wild.",
    badge: "WILD",
    color: "#FF6B6B",
    icon: "star",
    deckSize: 112,
    targetScore: 500,
    description: "There are NO number cards. Every card in the deck is a Wild of some kind.",
    numberRange: { min: 0, max: 0 },
    numberValueRule: "No numbers - all wilds",
    hasAllWild: true,
    scoringGroups: [
      {
        label: "Wild Cards",
        points: null,
        cards: [
          { name: "Standard Wild", points: 20, isWild: true },
          { name: "Power Wild", points: 50, isWild: true },
        ],
      },
    ],
    houseRules: [],
    quickPenalties: [
      { label: "+20 Wild", points: 20 },
      { label: "+50 Power Wild", points: 50 },
    ],
  },
  {
    id: "uno_no_mercy",
    name: "UNO No Mercy",
    tagline: "168 cards. Infinite stacking.",
    badge: "BRUTAL",
    color: "#6B21E8",
    icon: "skull",
    deckSize: 168,
    targetScore: 1000,
    description: "Brutal new wilds and a Mercy Elimination rule — reach 200 points in one round and you're out.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0-9",
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
    houseRules: [
      { ruleId: "mercy", label: "Mercy Rule (200 pts)", defaultValue: 1, currentValue: 1 },
    ],
    quickPenalties: [
      { label: "+50 Brutal Wild", points: 50 },
      { label: "+250 Mercy Bonus", points: 250 },
    ],
  },
  {
    id: "uno_express",
    name: "UNO Express",
    tagline: "56-card speed run.",
    badge: "FAST",
    color: "#FFB800",
    icon: "zap",
    deckSize: 56,
    targetScore: 250,
    description: "A streamlined smaller deck for faster games. Draw One replaces Draw Two.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value 0-9",
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
    quickPenalties: [
      { label: "+20 Action", points: 20 },
      { label: "+50 Wild", points: 50 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  GAME DEFINITION
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
  quickPenalties?: { label: string; points: number }[];
  hasVariants?: boolean;
  parentId?: string;
}

export function getUnoVariantById(id: string): UnoVariantDef | undefined {
  return UNO_VARIANTS.find((v) => v.id === id);
}

export function getPhase10VariantById(id: string): Phase10VariantDef | undefined {
  return PHASE10_VARIANTS.find((v) => v.id === id);
}

export function getTrickVariantById(id: string): TrickVariantDef | undefined {
  return SPADES_VARIANTS.find((v) => v.id === id) || HEARTS_VARIANTS.find((v) => v.id === id);
}

// ═══════════════════════════════════════════════════════════════════════════
//  SPADES VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const SPADES_VARIANTS: TrickVariantDef[] = [
  {
    id: "spades_standard",
    name: "Standard Spades",
    tagline: "The classic partnership bidding game.",
    badge: "CLASSIC",
    color: "#6B21E8",
    icon: "triangle",
    description: "The traditional version. Partners bid their expected tricks.",
    targetScore: 500,
    hasBidding: true,
    isPartnership: true,
    scoringRules: [
      { label: "Tricks matching Bid", points: 10 },
      { label: "Over-tricks (Bags)", points: 1 },
      { label: "10 Bags Penalty", points: -100 },
      { label: "Nil Bid (Success)", points: 100 },
      { label: "Nil Bid (Fail)", points: -100 },
    ],
    notes: ["Spades are always trump", "Bid total tricks with your partner"],
  },
  {
    id: "spades_suicide",
    name: "Suicide Spades",
    tagline: "One partner MUST bid Nil.",
    badge: "BRUTAL",
    color: "#E74C3C",
    icon: "alert-circle",
    description: "In every hand, one partner in each pair must bid Nil. Extremely aggressive.",
    targetScore: 500,
    hasBidding: true,
    isPartnership: true,
    scoringRules: [
      { label: "Nil Requirement", points: 0 },
      { label: "Normal Scoring", points: 10 },
    ],
  },
  {
    id: "spades_mirror",
    name: "Mirror Spades",
    tagline: "You bid exactly how many spades you have.",
    badge: "MIRROR",
    color: "#00BFFF",
    icon: "copy",
    description: "The choice is taken away: your bid is the exact number of spade cards in your hand.",
    targetScore: 500,
    hasBidding: true,
    isPartnership: true,
    scoringRules: [
      { label: "Automatic Bid", points: 0 },
      { label: "1 pt per bag", points: 1 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  HEARTS VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const HEARTS_VARIANTS: TrickVariantDef[] = [
  {
    id: "hearts_standard",
    name: "Standard Hearts",
    tagline: "Avoid the Queen of Spades at all costs.",
    badge: "CLASSIC",
    color: "#FF4757",
    icon: "heart",
    description: "Classic trick-avoidance. Don't take hearts or the Queen of Spades.",
    targetScore: 100,
    hasBidding: false,
    isPartnership: false,
    scoringRules: [
      { label: "Each Heart", points: 1 },
      { label: "Queen of Spades", points: 13 },
      { label: "Shoot the Moon", points: -26 },
    ],
  },
  {
    id: "hearts_omnibus",
    name: "Omnibus Hearts",
    tagline: "The Jack of Diamonds is now a bonus.",
    badge: "BONUS",
    color: "#FFB800",
    icon: "diamond-outline",
    description: "Adds the Jack of Diamonds as a 'special' card worth -10 points.",
    targetScore: 100,
    hasBidding: false,
    isPartnership: false,
    scoringRules: [
      { label: "Each Heart", points: 1 },
      { label: "Queen of Spades", points: 13 },
      { label: "Jack of Diamonds", points: -10 },
      { label: "Shoot the Moon", points: -26 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  5 PHASE 10 VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const PHASE10_VARIANTS: Phase10VariantDef[] = [
  {
    id: "phase10_standard",
    name: "Standard",
    tagline: "The classic sequential game.",
    badge: "CLASSIC",
    color: "#00BFFF",
    icon: "list",
    description: "The original Rummy-type game with 10 sequential phases.",
    phases: [
      { number: 1, description: "2 sets of 3" },
      { number: 2, description: "1 set of 3 + 1 run of 4" },
      { number: 3, description: "1 set of 4 + 1 run of 4" },
      { number: 4, description: "1 run of 7" },
      { number: 5, description: "1 run of 8" },
      { number: 6, description: "1 run of 9" },
      { number: 7, description: "2 sets of 4" },
      { number: 8, description: "7 cards of one color" },
      { number: 9, description: "1 set of 5 + 1 set of 2" },
      { number: 10, description: "1 set of 5 + 1 set of 3" },
    ],
    notes: ["Complete phases in order", "Lowest score wins overall"],
  },
  {
    id: "phase10_express",
    name: "Express",
    tagline: "Shortened requirements for faster play.",
    badge: "FAST",
    color: "#00DFFF",
    icon: "flash",
    description: "A faster version of Phase 10 with easier requirements.",
    phases: [
      { number: 1, description: "2 sets of 3" },
      { number: 2, description: "1 set of 3 + 1 run of 3" },
      { number: 3, description: "1 set of 4" },
      { number: 4, description: "1 run of 5" },
      { number: 5, description: "1 run of 6" },
      { number: 6, description: "1 run of 7" },
      { number: 7, description: "1 set of 4 + 1 set of 3" },
      { number: 8, description: "5 cards of one color" },
      { number: 9, description: "1 set of 5 + 1 set of 2" },
      { number: 10, description: "1 set of 6" },
    ],
  },
  {
    id: "phase10_even_odd",
    name: "Even/Odd",
    tagline: "Numerical parity strategy.",
    badge: "STRATEGY",
    color: "#00F5A0",
    icon: "calculator",
    description: "Features phases based on numerical parity (Even vs Odd).",
    phases: [
      { number: 1, description: "8 cards of all even numbers" },
      { number: 2, description: "8 cards of all odd numbers" },
      { number: 3, description: "1 set of 4 even + 1 set of 4 odd" },
      { number: 4, description: "1 run of 4 even + 1 run of 4 odd" },
      { number: 5, description: "7 cards of even or odd (any color)" },
      { number: 6, description: "8 cards of even or odd (same color)" },
    ],
  },
  {
    id: "phase10_masters",
    name: "Masters",
    tagline: "Non-linear phase completion.",
    badge: "ADVANCED",
    color: "#00CEC9",
    icon: "medal",
    description: "Players pick any phase in any order and use a 'Save Pile'.",
    phases: [
      { number: 1, description: "2 sets of 3" },
      { number: 2, description: "1 set of 3 + 1 run of 4" },
      { number: 3, description: "1 set of 4 + 1 run of 4" },
      { number: 4, description: "1 run of 7" },
      { number: 5, description: "1 run of 8" },
      { number: 6, description: "1 run of 9" },
      { number: 7, description: "2 sets of 4" },
      { number: 8, description: "7 cards of one color" },
      { number: 9, description: "1 set of 5 + 1 set of 2" },
      { number: 10, description: "1 set of 5 + 1 set of 3" },
    ],
  },
  {
    id: "phase10_junior",
    name: "Junior",
    tagline: "Animals and colors for kids.",
    badge: "KIDS",
    color: "#81ECEC",
    icon: "happy",
    description: "A simplified version using animals and colors instead of numbers.",
    phases: [
      { number: 1, description: "4 cards of the same animal" },
      { number: 2, description: "4 cards of the same color" },
      { number: 3, description: "1 set of 4 and 1 set of 2" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  RUMMY VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const RUMMY_VARIANTS: RummyVariantDef[] = [
  {
    id: "rummy_indian",
    name: "Indian Rummy",
    tagline: "13 cards. Mandatory pure sequence.",
    badge: "13 CARDS",
    color: "#E67E22",
    icon: "grid",
    description: "The classic 13-card variant. Requires a First Life (Pure Sequence) and a Second Life to finish.",
    targetScore: 300,
    maxPenalty: 80,
    dropPenalties: { first: 20, middle: 40 },
    cardValues: {
      high: 10,
      numbers: "face",
      jokers: 0
    },
    notes: [
      "No Pure Sequence = 80 pts (The Zombie)",
      "Maximum round penalty is 80 points",
      "Dropped games are 20 (First) or 40 (Middle)"
    ]
  },
  {
    id: "rummy_gin",
    name: "Gin Rummy",
    tagline: "Knock, Gin, and Big Gin.",
    badge: "2 PLAYERS",
    color: "#27AE60",
    icon: "git-commit",
    description: "Match cards into melds and minimize your deadwood. Knock if your deadwood is 10 or less.",
    targetScore: 100,
    maxPenalty: 100,
    dropPenalties: {},
    cardValues: {
      ace: 1,
      face: 10,
      numbers: "face"
    },
    bonuses: {
      gin: 25,
      big_gin: 31,
      undercut: 25
    },
    notes: [
      "Gin: 0 deadwood = +25 bonus",
      "Undercut: Opponent has less deadwood = +25 bonus",
      "Aces are always 1 point"
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
//  GAMES LIST
// ═══════════════════════════════════════════════════════════════════════════
export const GAMES: GameDefinition[] = [
  // UNO hub entry (opens variant picker)
  {
    id: "uno",
    name: "Uno",
    category: "card",
    icon: "layers",
    color: "#FF2D78",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 10,
    description: "8 variants — Classic, DOS, Flip, Attack, Flex, All Wild & more",
    objective: "Shed all your cards first",
    hasVariants: true,
    houseRules: [],
    hasCalculator: false,
  },
  // Uno variant game entries (used during actual gameplay)
  ...UNO_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    category: "uno" as GameCategory,
    icon: v.icon,
    color: v.color,
    winCondition: "lowest" as WinCondition,
    targetScore: v.targetScore,
    minPlayers: 2,
    maxPlayers: 10,
    description: v.description,
    objective: `First to ${v.targetScore} points wins`,
    parentId: "uno",
    scoreRules: [
      ...(v.hasAllWild ? [] : [{ label: `Number Cards (${v.numberRange.min}–${v.numberRange.max})`, points: 0 }]),
      ...v.scoringGroups.flatMap((g) =>
        g.cards.map((c) => ({ label: c.name, points: c.points }))
      ),
    ],
    houseRules: v.houseRules,
    hasCalculator: true,
    quickPenalties: v.quickPenalties,
  })),

  // PHASE 10 hub entry
  {
    id: "phase10",
    name: "Phase 10",
    category: "card",
    icon: "layers",
    color: "#00BFFF",
    winCondition: "lowest",
    minPlayers: 2,
    maxPlayers: 6,
    description: "5 variants — Standard, Express, Even/Odd, Masters & Junior",
    objective: "Complete all phases with the lowest score",
    hasVariants: true,
    houseRules: [],
    hasCalculator: false,
  },
  // Phase 10 variant game entries
  ...PHASE10_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    category: "card" as GameCategory,
    icon: v.icon,
    color: v.color,
    winCondition: "lowest" as WinCondition,
    minPlayers: 2,
    maxPlayers: 6,
    description: v.description,
    objective: "Complete all phases with the lowest score",
    parentId: "phase10",
    scoreRules: v.scoring || [
      { label: "Cards 1–9 (low numbers)", points: 5 },
      { label: "Cards 10–12 (high numbers)", points: 10 },
      { label: "Skip Card", points: 15 },
      { label: "Wild Card", points: 25 },
    ],
    houseRules: [
      { ruleId: "low_card_value", label: "Low Card (1–9) Value", defaultValue: 5, currentValue: 5 },
      { ruleId: "high_card_value", label: "High Card (10–12) Value", defaultValue: 10, currentValue: 10 },
      { ruleId: "skip_value", label: "Skip Card Value", defaultValue: 15, currentValue: 15 },
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 25, currentValue: 25 },
    ],
    hasCalculator: true,
  })),
  { id: "scrabble", name: "Scrabble", category: "board", icon: "grid", color: "#FFB800", winCondition: "highest", minPlayers: 2, maxPlayers: 4, description: "Classic word game", objective: "Score the most points with tiles", houseRules: [{ ruleId: "bingo_bonus", label: "Bingo Bonus (7 tiles)", defaultValue: 50, currentValue: 50 }], hasCalculator: false, quickPenalties: [{ label: "+50 Bingo!", points: 50 }] },
  {
    id: "spades",
    name: "Spades",
    category: "trick",
    icon: "spade",
    color: "#34495E",
    winCondition: "highest",
    targetScore: 500,
    minPlayers: 4,
    maxPlayers: 4,
    description: "3 variants — Standard, Suicide, Mirror",
    objective: "First partnership to 500 points",
    hasVariants: true,
    houseRules: [
      { ruleId: "bag_penalty", label: "Bag Penalty (per 10 bags)", defaultValue: 100, currentValue: 100 },
      { ruleId: "nil_bonus", label: "Nil Bid Bonus", defaultValue: 100, currentValue: 100 },
    ],
    hasCalculator: false,
  },
  // Spades variant game entries
  ...SPADES_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    category: "trick" as GameCategory,
    icon: v.icon,
    color: v.color,
    winCondition: "highest" as WinCondition,
    targetScore: v.targetScore,
    minPlayers: 4,
    maxPlayers: 4,
    description: v.description,
    objective: "First partnership to 500 points",
    parentId: "spades",
    scoreRules: v.scoringRules,
    houseRules: [
      { ruleId: "bag_penalty", label: "Bag Penalty (per 10 bags)", defaultValue: 100, currentValue: 100 },
      { ruleId: "nil_bonus", label: "Nil Bid Bonus", defaultValue: 100, currentValue: 100 },
    ],
    hasCalculator: true,
  })),
  {
    id: "hearts",
    name: "Hearts",
    category: "trick",
    icon: "heart",
    color: "#E74C3C",
    winCondition: "lowest",
    targetScore: 100,
    minPlayers: 4,
    maxPlayers: 4,
    description: "2 variants — Standard, Omnibus",
    objective: "Avoid penalty cards",
    hasVariants: true,
    houseRules: [
      { ruleId: "moon_bonus", label: "Shoot the Moon Effect", defaultValue: -26, currentValue: -26 },
    ],
    hasCalculator: false,
  },
  // Hearts variant game entries
  ...HEARTS_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    category: "trick" as GameCategory,
    icon: v.icon,
    color: v.color,
    winCondition: "lowest" as WinCondition,
    targetScore: v.targetScore,
    minPlayers: 4,
    maxPlayers: 4,
    description: v.description,
    objective: "Take the fewest points",
    parentId: "hearts",
    scoreRules: v.scoringRules,
    houseRules: [
      { ruleId: "moon_bonus", label: "Shoot the Moon Effect", defaultValue: -26, currentValue: -26 },
    ],
    hasCalculator: true,
  })),
  { id: "farkle", name: "Farkle", category: "dice", icon: "cube", color: "#00F5A0", winCondition: "highest", targetScore: 10000, minPlayers: 2, maxPlayers: 8, description: "Press-your-luck dice game", objective: "First to 10,000 points", scoreRules: [{ label: "Single 1", points: 100 }, { label: "Single 5", points: 50 }, { label: "Three 1s", points: 1000 }, { label: "Straight (1–6)", points: 1500 }], houseRules: [{ ruleId: "entry_min", label: "Min entry score", defaultValue: 500, currentValue: 500 }], hasCalculator: true, quickPenalties: [{ label: "+100 (One)", points: 100 }, { label: "+50 (Five)", points: 50 }] },
  { id: "skyjo", name: "Skyjo", category: "card", icon: "apps", color: "#FF5733", winCondition: "lowest", targetScore: 100, minPlayers: 2, maxPlayers: 8, description: "12-card grid strategy", objective: "Lowest score after reaching 100", hasCalculator: true, scoreRules: [{ label: "-2 points", points: -2 }, { label: "0 points", points: 0 }, { label: "5 points", points: 5 }, { label: "10 points", points: 10 }, { label: "12 points", points: 12 }], houseRules: [] },
  { id: "golf", name: "Golf", category: "card", icon: "flag", color: "#2ECC71", winCondition: "lowest", minPlayers: 2, maxPlayers: 6, description: "Low score card game", objective: "Get the lowest score over 9 or 18 holes", hasCalculator: true, houseRules: [], scoreRules: [] },
  { id: "five_crowns", name: "Five Crowns", category: "card", icon: "ribbon", color: "#F39C12", winCondition: "lowest", minPlayers: 2, maxPlayers: 7, description: "Rummy with 5 suits", objective: "Lowest score after 11 rounds", hasCalculator: true, houseRules: [], scoreRules: [] },
  { id: "skip_bo", name: "Skip-Bo", category: "card", icon: "fast-forward", color: "#E67E22", winCondition: "lowest", targetScore: 500, minPlayers: 2, maxPlayers: 6, description: "Sequence card game", objective: "Be the first to clear your stock pile", hasCalculator: true, houseRules: [], scoreRules: [] },
  { id: "seven_wonders", name: "7 Wonders", category: "board", icon: "business", color: "#8E44AD", winCondition: "highest", minPlayers: 2, maxPlayers: 7, description: "Civilization drafting game", objective: "Highest score via 7 categories", hasCalculator: true, houseRules: [], scoreRules: [] },
  { id: "catan", name: "Catan", category: "board", icon: "hexagon", color: "#D35400", winCondition: "highest", targetScore: 10, minPlayers: 2, maxPlayers: 4, description: "Resource management", objective: "First to 10 Victory Points wins", hasCalculator: true, houseRules: [{ ruleId: "target_score", label: "Target Score", defaultValue: 10, currentValue: 10 }, { ruleId: "harbor_master", label: "Include Harbor Master (+2 VP)", defaultValue: 0, currentValue: 0 }], scoreRules: [] },
  { id: "carcassonne", name: "Carcassonne", category: "tile", icon: "map", color: "#3498DB", winCondition: "highest", minPlayers: 2, maxPlayers: 5, description: "Meeples & Tile laying", objective: "Highest score after all tiles placed", hasCalculator: true, houseRules: [{ ruleId: "double_scoring_cities", label: "Completed Cities score double", defaultValue: 1, currentValue: 1 }], scoreRules: [] },
  { id: "moelkky", name: "Mölkky", category: "outdoor", icon: "pin", color: "#D35400", winCondition: "highest", targetScore: 50, minPlayers: 2, maxPlayers: 10, description: "Finnish throwing game", objective: "Reach exactly 50 points (Bust back to 25 if >50)", hasCalculator: true, houseRules: [{ ruleId: "bust_penalty", label: "Bust Penalty (Reset to)", defaultValue: 25, currentValue: 25 }], scoreRules: [] },
  { id: "cornhole", name: "Cornhole", category: "outdoor", icon: "radio-button-on", color: "#C0392B", winCondition: "highest", targetScore: 21, minPlayers: 2, maxPlayers: 4, description: "Bean bag toss", objective: "First to exactly 21 points", hasCalculator: true, houseRules: [{ ruleId: "cancellation", label: "Use Cancellation Scoring", defaultValue: 1, currentValue: 1 }], scoreRules: [] },
  { id: "billiards", name: "Straight Pool", category: "billiards", icon: "disc", color: "#16A085", winCondition: "highest", targetScore: 100, minPlayers: 2, maxPlayers: 2, description: "14.1 Continuous Pool", objective: "First to reach the point goal", hasCalculator: true, houseRules: [], scoreRules: [] },
  { id: "hand_and_foot", name: "Hand and Foot", category: "card", icon: "hand-right", color: "#27AE60", winCondition: "highest", targetScore: 10000, minPlayers: 2, maxPlayers: 6, description: "Complex Canasta variant", objective: "Highest score over rounds", hasCalculator: true, houseRules: [], scoreRules: [] },
  {
    id: "rummy",
    name: "Rummy",
    category: "card",
    icon: "shuffle",
    color: "#F39C12",
    winCondition: "lowest",
    minPlayers: 2,
    maxPlayers: 6,
    description: "Indian & Gin Rummy",
    objective: "Meld cards and minimize deadwood",
    hasVariants: true,
    houseRules: [],
    hasCalculator: false,
  },
  ...RUMMY_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    category: "card" as GameCategory,
    icon: v.icon,
    color: v.color,
    winCondition: (v.id === "rummy_gin" ? "highest" : "lowest") as WinCondition,
    targetScore: v.targetScore,
    minPlayers: (v.id === "rummy_gin" ? 2 : 2),
    maxPlayers: (v.id === "rummy_gin" ? 2 : 6),
    description: v.description,
    objective: v.id === "rummy_gin" ? `First to ${v.targetScore} points wins` : "Score the lowest points",
    parentId: "rummy",
    scoreRules: [],
    houseRules: [],
    hasCalculator: true,
  })),
  { id: "dominoes", name: "Dominoes", category: "tile", icon: "columns", color: "#BDC3C7", winCondition: "lowest", targetScore: 100, minPlayers: 2, maxPlayers: 4, description: "Classic tile game", objective: "Shed all tiles first", houseRules: [{ ruleId: "target_score", label: "Target score", defaultValue: 100, currentValue: 100 }], hasCalculator: false },
  { id: "skull_king", name: "Skull King", category: "trick", icon: "anchor", color: "#1ABC9C", winCondition: "highest", minPlayers: 2, maxPlayers: 8, description: "Pirate bidding game", objective: "Predict tricks perfectly", scoreRules: [{ label: "Per correct trick", points: 20 }, { label: "Miss bid (−10/trick)", points: -10 }, { label: "Skull King captures Pirate", points: 40 }], houseRules: [], hasCalculator: true, quickPenalties: [{ label: "+20 (Correct trick)", points: 20 }, { label: "-10 (Miss bid)", points: -10 }] },
  { id: "wizard", name: "Wizard", category: "trick", icon: "star", color: "#8E44AD", winCondition: "highest", minPlayers: 3, maxPlayers: 6, description: "Wizards and Jesters bidding", objective: "Predict tricks for bonuses", scoreRules: [{ label: "Correct bid bonus", points: 20 }, { label: "Per correct trick", points: 10 }], houseRules: [{ ruleId: "correct_bid_bonus", label: "Correct bid bonus", defaultValue: 20, currentValue: 20 }], hasCalculator: true },
  { id: "darts_cricket", name: "Darts Cricket", category: "dice", icon: "pin-outline", color: "#E74C3C", winCondition: "highest", minPlayers: 2, maxPlayers: 4, description: "Cricket darts", objective: "Close numbers 15-20 + bull", houseRules: [], hasCalculator: false },
  { id: "darts_301", name: "Darts 301", category: "dice", icon: "pin", color: "#C0392B", winCondition: "lowest", targetScore: 0, minPlayers: 2, maxPlayers: 4, description: "301 to exact 0", objective: "Reach exactly 0 (must finish on double)", houseRules: [{ ruleId: "starting_score", label: "Starting score", defaultValue: 301, currentValue: 301 }], hasCalculator: false },
  { id: "canasta", name: "Canasta", category: "card", icon: "folder", color: "#D35400", winCondition: "highest", targetScore: 5000, minPlayers: 4, maxPlayers: 4, description: "Melding partnership game", objective: "First team to 5,000", houseRules: [{ ruleId: "natural_canasta", label: "Natural canasta bonus", defaultValue: 500, currentValue: 500 }], hasCalculator: false, quickPenalties: [{ label: "+500 Natural Canasta", points: 500 }] },
  { id: "dutch_blitz", name: "Dutch Blitz", category: "card", icon: "zap", color: "#F1C40F", winCondition: "highest", targetScore: 75, minPlayers: 2, maxPlayers: 4, description: "Vonderful goot!", objective: "First to 75 points", scoreRules: [{ label: "Dutch pile (+2)", points: 2 }, { label: "Blitz pile (−1)", points: -1 }], houseRules: [], hasCalculator: true, quickPenalties: [{ label: "+2 (Dutch)", points: 2 }, { label: "−1 (Blitz)", points: -1 }] },
  { id: "oh_hell", name: "Oh Hell", category: "trick", icon: "alert", color: "#2ECC71", winCondition: "highest", minPlayers: 3, maxPlayers: 7, description: "Up & Down the River", objective: "Accurate bidding", scoreRules: [{ label: "Correct bid bonus", points: 10 }, { label: "Per trick taken", points: 1 }], houseRules: [{ ruleId: "bonus", label: "Correct bid bonus", defaultValue: 10, currentValue: 10 }], hasCalculator: false },
  { id: "pinochle", name: "Pinochle", category: "trick", icon: "ribbon", color: "#8E44AD", winCondition: "highest", targetScore: 1500, minPlayers: 4, maxPlayers: 4, description: "Classic partnership melding", objective: "First to 1,500 points", houseRules: [{ ruleId: "trump_bonus", label: "Double trump bonus", defaultValue: 1500, currentValue: 1500 }], hasCalculator: false },
];

export const MAIN_GAMES = GAMES.filter((g) => !g.parentId);

export const GAME_CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: "card", label: "Card Games", icon: "layers" },
  { id: "trick", label: "Trick-Taking", icon: "award" },
  { id: "outdoor", label: "Outdoor/Bar", icon: "map-pin" },
  { id: "billiards", label: "Billiards", icon: "circle" },
  { id: "dice", label: "Dice & Darts", icon: "hash" },
  { id: "tile", label: "Tile Games", icon: "grid" },
  { id: "board", label: "Board Games", icon: "layout" },
];

export function getGameById(id: string): GameDefinition | undefined {
  // 1. Check main registry
  let game = GAMES.find((g) => g.id === id);
  if (game) return game;

  // 2. Fallback: Search source arrays explicitly if registry spread failed for some reason
  const allVariants = [
    ...SPADES_VARIANTS.map(v => ({ ...v, parentId: "spades", category: "trick" as GameCategory })),
    ...HEARTS_VARIANTS.map(v => ({ ...v, parentId: "hearts", category: "trick" as GameCategory })),
    ...PHASE10_VARIANTS.map(v => ({ ...v, parentId: "phase10", category: "card" as GameCategory })),
    ...UNO_VARIANTS.map(v => ({ ...v, parentId: "uno", category: "uno" as GameCategory })),
    ...RUMMY_VARIANTS.map(v => ({ ...v, parentId: "rummy", category: "card" as GameCategory })),
  ];

  const variant = allVariants.find(v => v.id === id);
  if (variant) {
    // Map variant to GameDefinition
    const isSpades = variant.parentId === "spades";
    const isHearts = variant.parentId === "hearts";
    const isTrick = isSpades || isHearts;

    return {
      id: variant.id,
      name: variant.name,
      category: isTrick ? "trick" : (variant.parentId === "uno" ? "uno" : "card"),
      icon: variant.icon,
      color: variant.color,
      winCondition: (variant.id === "rummy_gin" || isSpades) ? "highest" : "lowest" as WinCondition,
      targetScore: (variant as any).targetScore || (isSpades ? 500 : 100),
      maxPlayers: 4,
      minPlayers: 4,
      description: variant.description,
      objective: isSpades ? "First partnership to 500 points" : "Take the fewest points",
      houseRules: isSpades ? [
        { ruleId: "bag_penalty", label: "Bag Penalty (per 10 bags)", defaultValue: 100, currentValue: 100 },
        { ruleId: "nil_bonus", label: "Nil Bid Bonus", defaultValue: 100, currentValue: 100 },
      ] : (isHearts ? [
        { ruleId: "moon_bonus", label: "Shoot the Moon Effect", defaultValue: -26, currentValue: -26 },
      ] : []),
      hasCalculator: true,
      scoreRules: (variant as any).scoringRules || (variant as any).scoring || [],
      parentId: variant.parentId,
    } as GameDefinition;
  }

  return undefined;
}
