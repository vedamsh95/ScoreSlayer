export type WinCondition = "highest" | "lowest";
export type GameCategory = "card" | "board" | "dice" | "tile" | "trick" | "uno";

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

// ═══════════════════════════════════════════════════════════════════════════
//  8 UNO VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const UNO_VARIANTS: UnoVariantDef[] = [
  // 1. STANDARD UNO ─────────────────────────────────────────────────────────
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
          { name: "Skip", points: 20, qty: "×2 per color", description: "Next player loses their turn" },
          { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses play direction" },
          { name: "Draw Two", points: 20, qty: "×2 per color", description: "Next player draws 2 and skips" },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [
          { name: "Wild", points: 50, qty: "×4", isWild: true, description: "Choose any color to play" },
          { name: "Wild Draw Four", points: 50, qty: "×4", isWild: true, description: "Choose color; next player draws 4" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 Skip/Rev/+2", points: 20 },
      { label: "+50 Wild/+4", points: 50 },
    ],
    notes: ["First player to 500 total points wins", "Winner scores from all other hands combined"],
  },

  // 2. DOS ──────────────────────────────────────────────────────────────────
  {
    id: "uno_dos",
    name: "DOS",
    tagline: "Two discard piles. 1–10 number cards. Double the chaos.",
    badge: "DOS",
    color: "#FF8C42",
    accentColor: "#FFB800",
    icon: "copy",
    deckSize: 108,
    targetScore: 200,
    description: "DOS adds a second discard pile — you can play to either pile. Match two cards at once with a DOS play to clear one pile. Numbers go up to 10.",
    numberRange: { min: 1, max: 10 },
    numberValueRule: "Face value — 1 = 1 pt through 10 = 10 pts",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips their turn" },
          { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses play direction" },
          { name: "Play Two (#)", points: 20, qty: "×2 per color", description: "Next player draws 2 cards — or plays DOS to cancel it" },
        ],
      },
      {
        label: "Wild Cards",
        points: null,
        cards: [
          { name: "Wild DOS", points: 20, qty: "×4", isWild: true, description: "Play to either pile. Change the center card color." },
          { name: "Wild Number", points: 40, qty: "×4", isWild: true, description: "You declare a number. This card IS that number. Highest-value wild." },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_dos_value", label: "Wild DOS Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "wild_number_value", label: "Wild Number Value", defaultValue: 40, currentValue: 40 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+10 (number 10)", points: 10 },
      { label: "+20 Action/Wild DOS", points: 20 },
      { label: "+40 Wild Number", points: 40 },
    ],
    notes: ["Two discard piles — you can play to either", "DOS play (two matching cards): other players draw 2", "Lower target score: game ends at 200"],
  },

  // 3. UNO EXPRESS ──────────────────────────────────────────────────────────
  {
    id: "uno_express",
    name: "UNO Express",
    tagline: "56-card speed run. Draw One instead of Two.",
    badge: "FAST",
    color: "#FFB800",
    icon: "zap",
    deckSize: 56,
    targetScore: 250,
    description: "A streamlined smaller deck for faster games. Draw One replaces Draw Two, and wild cards only draw two. Great for a quick session.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value — 0 = 0 pts through 9 = 9 pts",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Skip", points: 20, qty: "×1 per color", description: "Next player skips" },
          { name: "Reverse", points: 20, qty: "×1 per color", description: "Reverses direction" },
          { name: "Draw One", points: 20, qty: "×1 per color", description: "Next player draws 1 card (not 2!)" },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [
          { name: "Wild", points: 50, qty: "×2", isWild: true, description: "Choose any color" },
          { name: "Wild Draw Two", points: 50, qty: "×2", isWild: true, description: "Choose color; next player draws 2" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "target_score", label: "Target Score", defaultValue: 250, currentValue: 250 },
    ],
    quickPenalties: [
      { label: "+20 Skip/Rev/+1", points: 20 },
      { label: "+50 Wild/+2", points: 50 },
    ],
    notes: ["56-card deck — roughly half of Standard", "Draw One (not Draw Two) is the penalty", "Target is 250 — shorter game"],
  },

  // 4. UNO FLIP! EXPRESS ────────────────────────────────────────────────────
  {
    id: "uno_flip_express",
    name: "UNO Flip! Express",
    tagline: "56-card dual-sided deck. Flip to the dark side.",
    badge: "DARK SIDE",
    color: "#9B59B6",
    accentColor: "#4A0080",
    icon: "rotate-cw",
    deckSize: 56,
    targetScore: 250,
    description: "A compact version of Flip! — 56 cards with both a light and dark side. The Flip card switches the entire active deck. Dark side cards are far more brutal.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value on both sides",
    scoringGroups: [
      {
        label: "Light Side Actions",
        points: 20,
        cards: [
          { name: "Reverse", points: 20, qty: "×1 per color", description: "Reverses play direction" },
          { name: "Skip", points: 20, qty: "×1 per color", description: "Next player skips their turn" },
          { name: "Flip", points: 20, qty: "×1 per color", description: "Flips the deck to the dark side!" },
          { name: "Draw Three", points: 20, qty: "×1 per color", description: "Next player draws 3 cards" },
        ],
      },
      {
        label: "Dark Side Action",
        points: 30,
        cards: [
          { name: "Skip Everyone", points: 30, qty: "×1 per color", isDark: true, description: "Every other player skips — you play again" },
        ],
      },
      {
        label: "Light Wild Cards",
        points: null,
        cards: [
          { name: "Wild", points: 40, qty: "×2", isWild: true, description: "Choose any color" },
          { name: "Wild Draw Two", points: 50, qty: "×2", isWild: true, description: "Choose color; next player draws 2" },
        ],
      },
      {
        label: "Dark Wild Card",
        points: 60,
        cards: [
          { name: "Wild Draw Color (max 5)", points: 60, qty: "×2", isWild: true, isDark: true, description: "Next player draws cards until they pull the chosen color — up to 5 cards max" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_draw_color", label: "Wild Draw Color Value", defaultValue: 60, currentValue: 60 },
      { ruleId: "skip_everyone", label: "Skip Everyone Value", defaultValue: 30, currentValue: 30 },
      { ruleId: "wild_value", label: "Wild (Light) Value", defaultValue: 40, currentValue: 40 },
    ],
    quickPenalties: [
      { label: "+20 Light Actions", points: 20 },
      { label: "+30 Skip Everyone", points: 30 },
      { label: "+40 Wild (Light)", points: 40 },
      { label: "+50 Wild Draw Two", points: 50 },
      { label: "+60 Wild Draw Color", points: 60 },
    ],
    notes: ["Flip card switches the entire active deck side", "Dark side: Skip Everyone skips all others", "Wild Draw Color can pull up to 5 cards"],
  },

  // 5. UNO ATTACK (EXTREME) ─────────────────────────────────────────────────
  {
    id: "uno_attack",
    name: "UNO Attack! (Extreme)",
    tagline: "112 cards + motorized launcher. Chaos guaranteed.",
    badge: "LAUNCHER",
    color: "#E74C3C",
    accentColor: "#C0392B",
    icon: "target",
    deckSize: 112,
    targetScore: 500,
    description: "Instead of drawing from a deck, players press the motorized card launcher — it may shoot 0 to 6+ cards out randomly. Hit 2 and Wild Attack make others use the launcher.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value — 0 = 0 pts through 9 = 9 pts",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses direction" },
          { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips" },
          { name: "Hit 2", points: 20, qty: "×3", isSpecial: true, description: "Two players of your choice must press the launcher" },
          { name: "Discard All", points: 20, qty: "×3", isSpecial: true, description: "Discard all cards of a chosen color from your hand" },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [
          { name: "Wild", points: 50, qty: "×4", isWild: true, description: "Choose any color" },
          { name: "Wild Attack", points: 50, qty: "×3", isWild: true, isSpecial: true, description: "Every other player must press the launcher — could fire 0–6+ cards at each" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild / Wild Attack Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 Action Cards", points: 20 },
      { label: "+50 Wild / Attack", points: 50 },
    ],
    notes: ["Launcher fires 0–6+ cards randomly — no guarantee!", "Wild Attack makes EVERYONE else use launcher", "No Draw Two — all draws go through launcher"],
  },

  // 6. UNO FLEX ─────────────────────────────────────────────────────────────
  {
    id: "uno_flex",
    name: "UNO Flex",
    tagline: "Every card has a Flex version that bends the rules.",
    badge: "FLEX",
    color: "#00BFFF",
    accentColor: "#0080CC",
    icon: "activity",
    deckSize: 112,
    targetScore: 500,
    description: "UNO Flex introduces Flex versions of every action card. Flex cards let you modify their effect — like choosing who gets skipped, who draws, or bending the direction.",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value — 0 = 0 pts through 9 = 9 pts",
    scoringGroups: [
      {
        label: "Standard Action Cards",
        points: 20,
        cards: [
          { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips" },
          { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses direction" },
          { name: "Draw Two", points: 20, qty: "×2 per color", description: "Next player draws 2" },
        ],
      },
      {
        label: "Flex Action Cards",
        points: 20,
        cards: [
          { name: "Flex Skip", points: 20, qty: "×2 per color", isSpecial: true, description: "Skip ANY player of your choice — not just the next one" },
          { name: "Flex Reverse", points: 20, qty: "×2 per color", isSpecial: true, description: "Reverse AND choose which direction to continue from" },
          { name: "Flex Draw Two", points: 20, qty: "×2 per color", isSpecial: true, description: "Choose WHICH player draws 2 cards" },
        ],
      },
      {
        label: "Wild Cards",
        points: 50,
        cards: [
          { name: "Wild", points: 50, qty: "×4", isWild: true, description: "Choose any color" },
          { name: "Flex Wild", points: 50, qty: "×3", isWild: true, isSpecial: true, description: "Choose color AND choose any player to go next" },
          { name: "Flex Wild All Draw", points: 50, qty: "×2", isWild: true, isSpecial: true, description: "All other players draw 2 cards. You choose the new color." },
          { name: "Flex Wild Draw Two", points: 50, qty: "×2", isWild: true, isSpecial: true, description: "Choose any player to draw 2 cards (not just next player)" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 Any Action/Flex Action", points: 20 },
      { label: "+50 Any Wild/Flex Wild", points: 50 },
    ],
    notes: ["Flex cards let you target specific players", "Flex Wild All Draw hits every other player", "Flex Skip can skip anyone — not just next player"],
  },

  // 7. UNO ALL WILD! ────────────────────────────────────────────────────────
  {
    id: "uno_all_wild",
    name: "UNO All Wild!",
    tagline: "Every single card is a wild. Absolute mayhem.",
    badge: "ALL WILD",
    color: "#00F5A0",
    accentColor: "#00B877",
    icon: "star",
    deckSize: 112,
    targetScore: 500,
    description: "There are NO number cards. Every card in the deck is a Wild of some kind. On every turn you choose a color, and the wild effects stack up fast. Pure chaos.",
    numberRange: { min: 0, max: 0 },
    hasAllWild: true,
    numberValueRule: "No number cards — every card is a Wild",
    scoringGroups: [
      {
        label: "Standard Wild",
        points: 20,
        cards: [
          { name: "Standard Wild", points: 20, qty: "×several", isWild: true, description: "Choose any color. Lowest value wild." },
        ],
      },
      {
        label: "Power Wild Cards",
        points: 50,
        cards: [
          { name: "Wild Skip", points: 50, qty: "×several", isWild: true, description: "Choose color + next player skips" },
          { name: "Wild Reverse", points: 50, qty: "×several", isWild: true, description: "Choose color + reverse direction" },
          { name: "Wild Draw 2", points: 50, qty: "×several", isWild: true, description: "Choose color + next player draws 2" },
          { name: "Wild Draw 4", points: 50, qty: "×several", isWild: true, description: "Choose color + next player draws 4" },
          { name: "Wild Targeted Draw 2", points: 50, qty: "×several", isWild: true, description: "Choose color + choose ANY player to draw 2" },
          { name: "Wild Forced Swap", points: 50, qty: "×several", isWild: true, description: "Choose color + swap your hand with any player's hand" },
        ],
      },
    ],
    houseRules: [
      { ruleId: "standard_wild_value", label: "Standard Wild Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "power_wild_value", label: "Power Wild Value", defaultValue: 50, currentValue: 50 },
    ],
    quickPenalties: [
      { label: "+20 Standard Wild", points: 20 },
      { label: "+50 Power Wild", points: 50 },
    ],
    notes: ["No number cards at all — 100% wild deck", "Standard Wild = 20 pts; all others = 50 pts", "Wild Forced Swap can completely change standings"],
  },

  // 8. UNO SHOW 'EM NO MERCY ────────────────────────────────────────────────
  {
    id: "uno_no_mercy",
    name: "UNO: Show 'em No Mercy",
    tagline: "168 cards. Infinite stacking. Elimination mode.",
    badge: "BRUTAL",
    color: "#6B21E8",
    accentColor: "#3D0070",
    icon: "alert-triangle",
    deckSize: 168,
    targetScore: 1000,
    description: "The most unhinged Uno ever. 168 cards, brutal new wilds, and an optional Mercy Elimination rule — if you reach 200 points in one round you're eliminated (earn 250 pt bonus).",
    numberRange: { min: 0, max: 9 },
    numberValueRule: "Face value — 0 = 0 pts through 9 = 9 pts",
    scoringGroups: [
      {
        label: "Action Cards",
        points: 20,
        cards: [
          { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips" },
          { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses direction" },
          { name: "Draw 2 ★Stackable", points: 20, qty: "×2 per color", description: "Draw 2 — can be stacked with other Draw 2s or Draw 4s infinitely" },
          { name: "Draw 4 ★Stackable", points: 20, qty: "×2 per color", description: "Draw 4 — stackable; the pile can grow to 20+ cards" },
          { name: "Discard All", points: 20, qty: "×4 total", description: "Discard ALL cards of a chosen color from your hand" },
          { name: "Skip Everyone", points: 20, qty: "×4 total", description: "Every other player skips — you play again" },
        ],
      },
      {
        label: "Brutal Wild Cards",
        points: 50,
        cards: [
          { name: "Wild Reverse Draw 4", points: 50, qty: "×4", isWild: true, description: "Reverse direction AND next player draws 4" },
          { name: "Wild Draw 6", points: 50, qty: "×4", isWild: true, description: "Next player draws 6 cards and skips" },
          { name: "Wild Draw 10", points: 50, qty: "×4", isWild: true, description: "Next player draws 10 cards — the most punishing single card" },
          { name: "Wild Color Roulette", points: 50, qty: "×4", isWild: true, isSpecial: true, description: "Spin the included spinner — whichever color it lands on becomes active" },
        ],
      },
    ],
    bonuses: [
      { label: "Mercy Elimination Bonus (opponent eliminated)", points: 250 },
    ],
    houseRules: [
      { ruleId: "mercy_elimination", label: "Mercy Elimination (200+ pts = out)", defaultValue: 1, currentValue: 1 },
      { ruleId: "mercy_bonus", label: "Elimination Bonus Points", defaultValue: 250, currentValue: 250 },
      { ruleId: "max_stack", label: "Max Stack Cap (0 = unlimited)", defaultValue: 0, currentValue: 0 },
      { ruleId: "wild_value", label: "Brutal Wild Value", defaultValue: 50, currentValue: 50 },
    ],
    quickPenalties: [
      { label: "+20 Action Cards", points: 20 },
      { label: "+50 Brutal Wilds", points: 50 },
      { label: "+250 Mercy Bonus", points: 250 },
    ],
    notes: [
      "Draw 2 AND Draw 4 both stack — no opt-out allowed",
      "Wild Draw 10 is the most punishing card in any Uno",
      "Mercy Elimination: 200+ pts in one round = eliminated",
      "Eliminating someone earns you 250 bonus points",
      "Target score is 1000 — the longest Uno game",
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
    icon: "layers",
    description: "The original Rummy-type game with 10 sequential phases. Complete each phase to move to the next.",
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
    color: "#00F5A0",
    icon: "zap",
    description: "A faster version of Phase 10 with easier requirements, perfect for 2-4 players.",
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
    notes: ["Reduced counts for faster rounds", "Score cards 1-9: 5pts, 10-12: 10pts"],
  },
  {
    id: "phase10_even_odd",
    name: "Even/Odd",
    tagline: "Numerical parity strategy.",
    badge: "STRATEGY",
    color: "#FFB800",
    icon: "hash",
    description: "Features phases based on numerical parity (Even vs Odd). From the 'Cocoa Canyon' and 'Disco Fever' stages.",
    phases: [
      { number: 1, description: "8 cards of all even numbers" },
      { number: 2, description: "8 cards of all odd numbers" },
      { number: 3, description: "1 set of 4 even + 1 set of 4 odd" },
      { number: 4, description: "1 run of 4 even + 1 run of 4 odd" },
      { number: 5, description: "7 cards of even or odd (any color)" },
      { number: 6, description: "8 cards of even or odd (same color)" },
    ],
    notes: ["Numerical parity focus", "Strategy beyond basic runs and sets"],
  },
  {
    id: "phase10_masters",
    name: "Masters",
    tagline: "Non-linear phase completion.",
    badge: "ADVANCED",
    color: "#9B59B6",
    icon: "award",
    description: "Players pick any phase in any order and can save one card in a 'Save Pile' for later rounds.",
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
    notes: ["Complete in any order", "Save Pile: store 1 card per round"],
  },
  {
    id: "phase10_junior",
    name: "Junior",
    tagline: "Animals and colors for kids.",
    badge: "KIDS",
    color: "#FF4757",
    icon: "github",
    description: "A simplified version using animals and colors instead of numbers. Ideal for early learners.",
    phases: [
      { number: 1, description: "4 cards of the same animal" },
      { number: 2, description: "4 cards of the same color" },
      { number: 3, description: "1 set of 4 and 1 set of 2" },
    ],
    scoring: [
      { label: "Round Winner (Token)", points: 1 },
    ],
    notes: ["No points (use tokens)", "Uses animals instead of numbers"],
  },
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
    phases: v.phases,
    houseRules: [
      { ruleId: "low_card_value", label: "Low Card (1–9) Value", defaultValue: 5, currentValue: 5 },
      { ruleId: "high_card_value", label: "High Card (10–12) Value", defaultValue: 10, currentValue: 10 },
      { ruleId: "skip_value", label: "Skip Card Value", defaultValue: 15, currentValue: 15 },
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 25, currentValue: 25 },
    ],
    hasCalculator: true,
  })),
  { id: "scrabble", name: "Scrabble", category: "board", icon: "grid", color: "#FFB800", winCondition: "highest", minPlayers: 2, maxPlayers: 4, description: "Classic word game on a 15×15 grid", objective: "Score the most points by placing tiles", houseRules: [{ ruleId: "bingo_bonus", label: "Bingo Bonus (7 tiles)", defaultValue: 50, currentValue: 50 }], hasCalculator: false, quickPenalties: [{ label: "+50 Bingo!", points: 50 }] },
  { id: "spades", name: "Spades", category: "trick", icon: "triangle", color: "#6B21E8", winCondition: "highest", targetScore: 500, minPlayers: 4, maxPlayers: 4, description: "Classic trick-taking partnership card game", objective: "First partnership to 500 points", houseRules: [{ ruleId: "bag_penalty", label: "Bag Penalty (per 10 bags)", defaultValue: 100, currentValue: 100 }, { ruleId: "nil_bonus", label: "Nil Bid Bonus", defaultValue: 100, currentValue: 100 }], hasCalculator: true, quickPenalties: [{ label: "Set (miss bid)", points: -10 }, { label: "Bags penalty", points: -100 }] },
  { id: "hearts", name: "Hearts", category: "trick", icon: "heart", color: "#FF4757", winCondition: "lowest", targetScore: 100, minPlayers: 4, maxPlayers: 4, description: "Trick-avoidance card game", objective: "Avoid taking hearts and the Queen of Spades", scoreRules: [{ label: "Each Heart", points: 1 }, { label: "Queen of Spades", points: 13 }], houseRules: [{ ruleId: "moon_bonus", label: "Shoot the Moon Effect", defaultValue: -26, currentValue: -26 }], hasCalculator: true, quickPenalties: [{ label: "+1 (Heart)", points: 1 }, { label: "+13 (Queen)", points: 13 }] },
  { id: "farkle", name: "Farkle", category: "dice", icon: "circle", color: "#00F5A0", winCondition: "highest", targetScore: 10000, minPlayers: 2, maxPlayers: 8, description: "Press-your-luck dice game", objective: "First to 10,000 points", scoreRules: [{ label: "Single 1", points: 100 }, { label: "Single 5", points: 50 }, { label: "Three 1s", points: 1000 }, { label: "Straight (1–6)", points: 1500 }], houseRules: [{ ruleId: "entry_min", label: "Min entry score", defaultValue: 500, currentValue: 500 }], hasCalculator: true, quickPenalties: [{ label: "+100 (One)", points: 100 }, { label: "+50 (Five)", points: 50 }] },
  { id: "cribbage", name: "Cribbage", category: "card", icon: "bar-chart-2", color: "#FF8C42", winCondition: "highest", targetScore: 121, minPlayers: 2, maxPlayers: 4, description: "Card game scored using a cribbage board", objective: "First to 121 points", houseRules: [{ ruleId: "skunk_line", label: "Skunk line", defaultValue: 91, currentValue: 91 }], hasCalculator: false },
  { id: "euchre", name: "Euchre", category: "trick", icon: "award", color: "#9B59B6", winCondition: "highest", targetScore: 10, minPlayers: 4, maxPlayers: 4, description: "Fast-paced trick-taking partnership game", objective: "First team to 10 points", scoreRules: [{ label: "Win 3–4 tricks", points: 1 }, { label: "Win all 5 tricks", points: 2 }, { label: "Loner — win all 5", points: 4 }], houseRules: [{ ruleId: "loner_points", label: "Loner bonus", defaultValue: 4, currentValue: 4 }], hasCalculator: false, quickPenalties: [{ label: "+1 (3–4 tricks)", points: 1 }, { label: "+2 (all 5)", points: 2 }, { label: "+4 (Loner!)", points: 4 }] },
  { id: "poker", name: "Poker", category: "card", icon: "dollar-sign", color: "#27AE60", winCondition: "highest", minPlayers: 2, maxPlayers: 10, description: "Classic betting card game", objective: "Win the most chips", houseRules: [{ ruleId: "starting_chips", label: "Starting chips", defaultValue: 1000, currentValue: 1000 }], hasCalculator: false },
  { id: "gin_rummy", name: "Gin Rummy", category: "card", icon: "shuffle", color: "#F39C12", winCondition: "highest", targetScore: 100, minPlayers: 2, maxPlayers: 4, description: "Matching card game of sets and runs", objective: "First to 100 points", scoreRules: [{ label: "Gin bonus", points: 25 }, { label: "Undercut bonus", points: 25 }], houseRules: [{ ruleId: "gin_bonus", label: "Gin bonus", defaultValue: 25, currentValue: 25 }], hasCalculator: false, quickPenalties: [{ label: "+25 Gin!", points: 25 }, { label: "+25 Undercut!", points: 25 }] },
  { id: "dominoes", name: "Dominoes", category: "tile", icon: "columns", color: "#ECF0F1", winCondition: "lowest", targetScore: 100, minPlayers: 2, maxPlayers: 4, description: "Classic tile-matching game", objective: "Be first to play all your tiles", houseRules: [{ ruleId: "target_score", label: "Target score", defaultValue: 100, currentValue: 100 }], hasCalculator: false },
  { id: "skull_king", name: "Skull King", category: "trick", icon: "anchor", color: "#1ABC9C", winCondition: "highest", minPlayers: 2, maxPlayers: 8, description: "Pirate-themed trick-taking bidding game", objective: "Accurately predict tricks to score max", scoreRules: [{ label: "Per correct trick", points: 20 }, { label: "Miss bid (−10/trick)", points: -10 }, { label: "Skull King captures Pirate", points: 40 }], houseRules: [], hasCalculator: true, quickPenalties: [{ label: "+20 (Correct trick)", points: 20 }, { label: "-10 (Miss bid)", points: -10 }] },
  { id: "wizard", name: "Wizard", category: "trick", icon: "star", color: "#8E44AD", winCondition: "highest", minPlayers: 3, maxPlayers: 6, description: "Trick-taking bidding game with Wizards and Jesters", objective: "Accurately predict tricks each round", scoreRules: [{ label: "Correct bid bonus", points: 20 }, { label: "Per correct trick", points: 10 }], houseRules: [{ ruleId: "correct_bid_bonus", label: "Correct bid bonus", defaultValue: 20, currentValue: 20 }], hasCalculator: true },
  { id: "darts_cricket", name: "Darts Cricket", category: "dice", icon: "target", color: "#E74C3C", winCondition: "highest", minPlayers: 2, maxPlayers: 4, description: "Cricket dart game targeting 15–20 and bull", objective: "Close all numbers with highest score", houseRules: [], hasCalculator: false },
  { id: "darts_301", name: "Darts 301", category: "dice", icon: "target", color: "#C0392B", winCondition: "lowest", targetScore: 0, minPlayers: 2, maxPlayers: 4, description: "Count-down from 301 to exactly 0", objective: "Reach exactly 0 (must finish on double)", houseRules: [{ ruleId: "starting_score", label: "Starting score", defaultValue: 301, currentValue: 301 }], hasCalculator: false },
  { id: "canasta", name: "Canasta", category: "card", icon: "layers", color: "#D35400", winCondition: "highest", targetScore: 5000, minPlayers: 4, maxPlayers: 4, description: "Partnership card game collecting melds", objective: "First team to 5,000 points", houseRules: [{ ruleId: "natural_canasta", label: "Natural canasta bonus", defaultValue: 500, currentValue: 500 }], hasCalculator: false, quickPenalties: [{ label: "+500 Natural Canasta", points: 500 }] },
  { id: "dutch_blitz", name: "Dutch Blitz", category: "card", icon: "zap", color: "#F1C40F", winCondition: "highest", targetScore: 75, minPlayers: 2, maxPlayers: 4, description: "Fast-paced simultaneous card game", objective: "First to 75 points", scoreRules: [{ label: "Dutch pile (+2)", points: 2 }, { label: "Blitz pile (−1)", points: -1 }], houseRules: [], hasCalculator: false, quickPenalties: [{ label: "+2 (Dutch)", points: 2 }, { label: "−1 (Blitz)", points: -1 }] },
  { id: "oh_hell", name: "Oh Hell", category: "trick", icon: "zap-off", color: "#2ECC71", winCondition: "highest", minPlayers: 3, maxPlayers: 7, description: "Trick-taking bidding game (Up & Down the River)", objective: "Accurately predict tricks for max score", scoreRules: [{ label: "Correct bid bonus", points: 10 }, { label: "Per trick taken", points: 1 }], houseRules: [{ ruleId: "bonus", label: "Correct bid bonus", defaultValue: 10, currentValue: 10 }], hasCalculator: false },
  { id: "monopoly", name: "Monopoly", category: "board", icon: "home", color: "#3498DB", winCondition: "highest", minPlayers: 2, maxPlayers: 8, description: "Classic real-estate trading board game", objective: "Bankrupt all other players", houseRules: [{ ruleId: "free_parking", label: "Free Parking jackpot", defaultValue: 500, currentValue: 500 }], hasCalculator: false },
  { id: "pinochle", name: "Pinochle", category: "trick", icon: "award", color: "#8E44AD", winCondition: "highest", targetScore: 1500, minPlayers: 4, maxPlayers: 4, description: "Partnership trick-taking and melding game", objective: "First team to 1,500 points", houseRules: [{ ruleId: "trump_bonus", label: "Double trump bonus", defaultValue: 1500, currentValue: 1500 }], hasCalculator: false },
];

export const MAIN_GAMES = GAMES.filter((g) => g.category !== "uno");

export const GAME_CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: "card", label: "Card Games", icon: "layers" },
  { id: "board", label: "Board Games", icon: "grid" },
  { id: "trick", label: "Trick-Taking", icon: "award" },
  { id: "dice", label: "Dice & Darts", icon: "circle" },
  { id: "tile", label: "Tile Games", icon: "columns" },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES.find((g) => g.id === id);
}
