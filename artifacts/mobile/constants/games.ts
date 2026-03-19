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

// ─── Card Definition ────────────────────────────────────────────────────────
export interface CardDef {
  name: string;
  points: number;         // point value when held at round end
  qty: string;            // e.g. "×2 per color" or "×4 total"
  description?: string;
  isDark?: boolean;       // Flip! dark side cards
  isWild?: boolean;
  isSpecial?: boolean;    // launcher / dare / roulette
}

// ─── Uno Variant ────────────────────────────────────────────────────────────
export interface UnoVariantDef {
  id: string;
  name: string;
  tagline: string;
  badge?: string;           // short label like "DARK SIDE" or "FAST"
  color: string;
  icon: string;
  description: string;
  playerCount: string;      // e.g. "2–10 players"
  targetScore: number;
  // Number cards
  numberCards: {
    description: string;
    valueRule: string;      // "Face value" / "Tiered: 1-9 = 5pts, 10-12 = 10pts"
    tiers?: { range: string; points: number }[];
  };
  // Light side action cards (all variants have these)
  actionCards: CardDef[];
  wildCards: CardDef[];
  // Flip! dark side only
  darkNumberCards?: { description: string; valueRule: string };
  darkActionCards?: CardDef[];
  darkWildCards?: CardDef[];
  // House rules
  houseRules: HouseRuleOverride[];
  quickPenalties: { label: string; points: number }[];
  // Scoring cheat-sheet
  scoringNotes?: string[];
}

// ─── Game Definition ─────────────────────────────────────────────────────────
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
  // For Uno — opens variant picker instead of setup
  hasVariants?: boolean;
  // Variant back-reference
  variantId?: string;
  parentId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNO VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export const UNO_VARIANTS: UnoVariantDef[] = [
  // ── 1. UNO CLASSIC ──────────────────────────────────────────────────────
  {
    id: "uno_classic",
    name: "Uno Classic",
    tagline: "The original card-shedding game",
    color: "#FF2D78",
    icon: "layers",
    description: "The original 108-card game. Match color or number, use action cards to slow opponents, and shout UNO before playing your last card.",
    playerCount: "2–10 players",
    targetScore: 500,
    numberCards: {
      description: "0 (×1 per color = 4 total) · 1–9 (×2 per color = 72 total)",
      valueRule: "Face value — e.g. a 7 = 7 points",
    },
    actionCards: [
      { name: "Skip", points: 20, qty: "×2 per color (8 total)", description: "Next player loses their turn" },
      { name: "Reverse", points: 20, qty: "×2 per color (8 total)", description: "Reverses play direction" },
      { name: "Draw Two (+2)", points: 20, qty: "×2 per color (8 total)", description: "Next player draws 2 and loses turn" },
    ],
    wildCards: [
      { name: "Wild", points: 50, qty: "×4 total", isWild: true, description: "Choose any color to continue" },
      { name: "Wild Draw Four (+4)", points: 50, qty: "×4 total", isWild: true, description: "Choose color; next player draws 4 (challenge allowed)" },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "wild_draw4_value", label: "Wild Draw 4 Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value (Skip/Rev/+2)", defaultValue: 20, currentValue: 20 },
      { ruleId: "stacking", label: "Allow Draw-2 Stacking", defaultValue: 0, currentValue: 0 },
    ],
    quickPenalties: [
      { label: "+7 (number 7)", points: 7 },
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+50 (Wild / +4)", points: 50 },
    ],
    scoringNotes: [
      "Winner scores points equal to cards held by all other players",
      "First to 500 across rounds wins",
      "Number cards = face value (0-9)",
    ],
  },

  // ── 2. UNO FLIP! ─────────────────────────────────────────────────────────
  {
    id: "uno_flip",
    name: "Uno Flip!",
    tagline: "Two-sided deck — flip between light and dark",
    badge: "DARK SIDE",
    color: "#9B59B6",
    icon: "rotate-cw",
    description: "Uno Flip! features a double-sided deck. The light side plays like Classic; the dark side has brutal high-penalty cards. A Flip card switches the entire deck!",
    playerCount: "2–6 players",
    targetScore: 500,
    numberCards: {
      description: "LIGHT: 0 (×1/color) · 1–9 (×2/color) · DARK: 1–9 (×2/color, same structure)",
      valueRule: "Face value on both sides",
    },
    actionCards: [
      { name: "Skip (Light)", points: 20, qty: "×2 per color", description: "Next player skips their turn" },
      { name: "Reverse (Light)", points: 20, qty: "×2 per color", description: "Reverses direction of play" },
      { name: "Draw One (Light) +1", points: 10, qty: "×2 per color", description: "Next player draws 1 card" },
      { name: "Flip", points: 20, qty: "×2 per color", description: "FLIPS the entire deck to the other side! The discard pile flips too" },
    ],
    wildCards: [
      { name: "Wild (Light)", points: 40, qty: "×4 total", isWild: true, description: "Choose any color" },
      { name: "Wild Draw Two +2 (Light)", points: 50, qty: "×4 total", isWild: true, description: "Choose color; next player draws 2" },
    ],
    darkActionCards: [
      { name: "Skip Everyone (Dark)", points: 30, qty: "×2 per color", isDark: true, description: "Every other player skips — you play again!" },
      { name: "Reverse (Dark)", points: 20, qty: "×2 per color", isDark: true, description: "Reverses direction" },
      { name: "Draw Five (Dark) +5", points: 20, qty: "×2 per color", isDark: true, description: "Next player draws 5 cards and loses turn" },
      { name: "Flip (Dark)", points: 20, qty: "×2 per color", isDark: true, description: "Flips deck back to light side" },
    ],
    darkWildCards: [
      { name: "Wild (Dark)", points: 40, qty: "×4 total", isDark: true, isWild: true, description: "Choose any color" },
      { name: "Wild Draw Color", points: 60, qty: "×4 total", isDark: true, isWild: true, description: "The next player draws cards until they draw the chosen color — could be many cards!" },
    ],
    houseRules: [
      { ruleId: "wild_draw_color_value", label: "Wild Draw Color Value", defaultValue: 60, currentValue: 60 },
      { ruleId: "skip_everyone_value", label: "Skip Everyone Value", defaultValue: 30, currentValue: 30 },
      { ruleId: "flip_card_value", label: "Flip Card Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 (Skip/Rev/Flip)", points: 20 },
      { label: "+30 (Skip Everyone)", points: 30 },
      { label: "+40 (Wild)", points: 40 },
      { label: "+60 (Wild Draw Color)", points: 60 },
    ],
    scoringNotes: [
      "Light side: number cards = face value",
      "Dark side: number cards = face value",
      "Wild Draw Color = 60 pts (most brutal card!)",
      "First to 500 pts wins overall",
    ],
  },

  // ── 3. UNO EXPRESS ───────────────────────────────────────────────────────
  {
    id: "uno_express",
    name: "Uno Express",
    tagline: "Stripped-down, faster games — no 0s, fewer action cards",
    badge: "FAST",
    color: "#FFB800",
    icon: "zap",
    description: "A streamlined version for quicker games. The deck is smaller (no 0 cards, 1 of each action per color), so rounds end faster. Perfect for a quick session.",
    playerCount: "2–6 players",
    targetScore: 200,
    numberCards: {
      description: "1–9 only (×1 per color = 36 total) · No 0 cards in this edition",
      valueRule: "Face value — 1 = 1 pt, 9 = 9 pts",
    },
    actionCards: [
      { name: "Skip", points: 20, qty: "×1 per color (4 total)", description: "Next player loses their turn" },
      { name: "Reverse", points: 20, qty: "×1 per color (4 total)", description: "Reverses play direction" },
      { name: "Draw Two (+2)", points: 20, qty: "×1 per color (4 total)", description: "Next player draws 2 and loses turn" },
    ],
    wildCards: [
      { name: "Wild", points: 50, qty: "×2 total (fewer than Classic)", isWild: true, description: "Choose any color" },
      { name: "Wild Draw Four (+4)", points: 50, qty: "×2 total", isWild: true, description: "Choose color; next player draws 4" },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "target_score", label: "Target Score (default 200)", defaultValue: 200, currentValue: 200 },
    ],
    quickPenalties: [
      { label: "+9 (number 9)", points: 9 },
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+50 (Wild / +4)", points: 50 },
    ],
    scoringNotes: [
      "No 0 cards — minimum number card is 1",
      "Target score is 200 by default (game is shorter)",
      "Same scoring rules as Classic otherwise",
    ],
  },

  // ── 4. UNO ATTACK (UNO BLAST) ────────────────────────────────────────────
  {
    id: "uno_attack",
    name: "Uno Attack!",
    tagline: "Card launcher fires random cards at players",
    badge: "LAUNCHER",
    color: "#FF8C42",
    icon: "target",
    description: "Uno Attack! includes a motorized card launcher. Instead of drawing from a deck, players press the launcher — it may shoot 0 to 6 cards out randomly. Chaos guaranteed!",
    playerCount: "2–10 players",
    targetScore: 500,
    numberCards: {
      description: "0 (×1/color) · 1–9 (×2/color) — same as Classic (112 cards total)",
      valueRule: "Face value",
    },
    actionCards: [
      { name: "Skip", points: 20, qty: "×2 per color", description: "Next player's turn is skipped" },
      { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses play direction" },
      { name: "Hit 2", points: 30, qty: "×3 total", isSpecial: true, description: "Two players of your choice must press the launcher" },
      { name: "Discard All", points: 30, qty: "×3 total", isSpecial: true, description: "Discard all cards in your hand of the named color" },
    ],
    wildCards: [
      { name: "Wild", points: 50, qty: "×4 total", isWild: true, description: "Choose any color" },
      { name: "Wild All Hit", points: 50, qty: "×3 total", isWild: true, isSpecial: true, description: "Every other player must press the card launcher. Brutal." },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild / Wild All Hit Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "special_value", label: "Hit 2 / Discard All Value", defaultValue: 30, currentValue: 30 },
      { ruleId: "action_value", label: "Skip / Reverse Value", defaultValue: 20, currentValue: 20 },
    ],
    quickPenalties: [
      { label: "+20 (Skip/Reverse)", points: 20 },
      { label: "+30 (Hit 2 / Discard All)", points: 30 },
      { label: "+50 (Wild / All Hit)", points: 50 },
    ],
    scoringNotes: [
      "Launcher may fire 0–6 cards randomly — no guaranteed draw",
      "Wild All Hit is the deadliest card",
      "No Draw Two/Four — all drawing goes through the launcher",
    ],
  },

  // ── 5. UNO NO MERCY ──────────────────────────────────────────────────────
  {
    id: "uno_no_mercy",
    name: "Uno No Mercy",
    tagline: "Infinite stacking, punishing wilds, no escape",
    badge: "BRUTAL",
    color: "#E74C3C",
    icon: "alert-triangle",
    description: "The most brutal Uno variant ever made. Draw 2s and Draw 4s stack infinitely. New savage wild cards punish unlucky players. No skipping allowed when holding the stack.",
    playerCount: "2–6 players",
    targetScore: 500,
    numberCards: {
      description: "0 (×1/color) · 1–9 (×2/color) — same structure as Classic",
      valueRule: "Face value",
    },
    actionCards: [
      { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips" },
      { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses direction" },
      { name: "Draw Two (+2) ★Stackable", points: 20, qty: "×2 per color", description: "Next player draws 2. Stackable! They can add another +2 to pass it on — pile can grow to 20+ cards" },
    ],
    wildCards: [
      { name: "Wild", points: 50, qty: "×4 total", isWild: true, description: "Choose any color" },
      { name: "Wild Draw Four (+4) ★Stackable", points: 50, qty: "×4 total", isWild: true, description: "Draw 4 + choose color. Stackable — can combine with other Draw 4s for massive penalties" },
      { name: "Wild Draw Six (+6)", points: 60, qty: "×3 total", isWild: true, description: "Next player draws 6 cards and loses turn. Cannot be challenged or stacked" },
      { name: "Wild Targeted Draw Four", points: 50, qty: "×3 total", isWild: true, description: "Choose ANY player — they draw 4 (not just the next player)" },
      { name: "Wild Discard All", points: 40, qty: "×3 total", isWild: true, description: "Discard ALL your cards of any one color. Instant hand-clearing." },
      { name: "Color Roulette", points: 30, qty: "×2 total", isSpecial: true, description: "Spin the included spinner — whichever color it lands on becomes the new active color" },
    ],
    houseRules: [
      { ruleId: "max_stack", label: "Max Draw Stack Cap (0 = unlimited)", defaultValue: 0, currentValue: 0 },
      { ruleId: "wd6_value", label: "Wild Draw Six Value", defaultValue: 60, currentValue: 60 },
      { ruleId: "targeted_value", label: "Wild Targeted +4 Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "discard_all_value", label: "Wild Discard All Value", defaultValue: 40, currentValue: 40 },
    ],
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+40 (Discard All)", points: 40 },
      { label: "+50 (Wild/+4/Targeted)", points: 50 },
      { label: "+60 (Wild Draw Six)", points: 60 },
    ],
    scoringNotes: [
      "Draw 2 and Draw 4 BOTH stack — no opt-out",
      "Wild Draw Six = 60pts (new in this edition)",
      "Wild Discard All is double-edged — great for thin hands",
      "Color Roulette = 30pts",
    ],
  },

  // ── 6. UNO DARE ──────────────────────────────────────────────────────────
  {
    id: "uno_dare",
    name: "Uno Dare!",
    tagline: "Dare your opponents instead of drawing cards",
    badge: "DARE",
    color: "#1ABC9C",
    icon: "mic",
    description: "Uno Dare! gives you a way out of drawing cards — perform a dare instead! A challenge card challenges the previous player's dare. Wild Double Dare doubles the stakes.",
    playerCount: "2–6 players",
    targetScore: 500,
    numberCards: {
      description: "0 (×1/color) · 1–9 (×2/color) — Classic structure",
      valueRule: "Face value",
    },
    actionCards: [
      { name: "Skip", points: 20, qty: "×2 per color", description: "Next player skips their turn" },
      { name: "Reverse", points: 20, qty: "×2 per color", description: "Reverses direction" },
      { name: "Draw Two (+2)", points: 20, qty: "×2 per color", description: "Next player draws 2 — OR performs a Dare card challenge instead" },
    ],
    wildCards: [
      { name: "Wild", points: 50, qty: "×4 total", isWild: true, description: "Choose any color" },
      { name: "Wild Draw Four (+4)", points: 50, qty: "×4 total", isWild: true, description: "Next player draws 4 or does a dare" },
      { name: "Wild Dare", points: 30, qty: "×3 total", isWild: true, isSpecial: true, description: "Play a dare card from the dare deck. If the targeted player completes the dare they don't draw; if they refuse they draw 4" },
      { name: "Wild Double Dare", points: 50, qty: "×2 total", isWild: true, isSpecial: true, description: "Double Dare — the stakes double. Complete it: skip drawing entirely. Refuse or fail: draw 6 cards" },
      { name: "Challenge", points: 20, qty: "×3 total", isSpecial: true, description: "Challenge the last player who played a Wild Draw 4 — if they lied, they draw 4 instead of you" },
    ],
    houseRules: [
      { ruleId: "wild_dare_value", label: "Wild Dare Value", defaultValue: 30, currentValue: 30 },
      { ruleId: "double_dare_value", label: "Wild Double Dare Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "challenge_value", label: "Challenge Card Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "fail_penalty", label: "Failed Dare Draw Penalty", defaultValue: 4, currentValue: 4 },
    ],
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2/Challenge)", points: 20 },
      { label: "+30 (Wild Dare)", points: 30 },
      { label: "+50 (Wild +4/Double Dare)", points: 50 },
    ],
    scoringNotes: [
      "Completing a dare avoids drawing cards",
      "Refusing a dare = draw penalty (4 cards default)",
      "Wild Double Dare: complete = no draw; fail = draw 6",
      "Challenge can reverse a bluffed Wild Draw Four",
    ],
  },
];

export function getUnoVariantById(id: string): UnoVariantDef | undefined {
  return UNO_VARIANTS.find((v) => v.id === id);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAMES LIST
// ═══════════════════════════════════════════════════════════════════════════

export const GAMES: GameDefinition[] = [
  // ── UNO (variant hub) ──────────────────────────────────────────────────
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
    description: "Classic card-shedding game with action cards",
    objective: "Be the first to reach 500 points by making others hold cards",
    hasVariants: true,
    houseRules: [],
    hasCalculator: true,
  },
  // ── UNO VARIANTS (hidden from main grid — loaded via variant screen) ───
  {
    id: "uno_classic",
    name: "Uno Classic",
    category: "uno",
    icon: "layers",
    color: "#FF2D78",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 10,
    description: "Original 108-card game",
    objective: "First to 500 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards (0–9)", points: 0 },
      { label: "Skip / Reverse / Draw Two", points: 20 },
      { label: "Wild", points: 50 },
      { label: "Wild Draw Four", points: 50 },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "wild_draw4_value", label: "Wild Draw 4 Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+50 (Wild/+4)", points: 50 },
    ],
  },
  {
    id: "uno_flip",
    name: "Uno Flip!",
    category: "uno",
    icon: "rotate-cw",
    color: "#9B59B6",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 6,
    description: "Two-sided deck with light and dark sides",
    objective: "First to 500 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards", points: 0 },
      { label: "Skip / Reverse / Draw One / Flip", points: 20 },
      { label: "Wild (Light)", points: 40 },
      { label: "Wild Draw Two (Light)", points: 50 },
      { label: "Skip Everyone (Dark)", points: 30 },
      { label: "Draw Five (Dark)", points: 20 },
      { label: "Wild (Dark)", points: 40 },
      { label: "Wild Draw Color (Dark)", points: 60 },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Value", defaultValue: 40, currentValue: 40 },
      { ruleId: "wild_draw_color", label: "Wild Draw Color Value", defaultValue: 60, currentValue: 60 },
      { ruleId: "skip_everyone", label: "Skip Everyone Value", defaultValue: 30, currentValue: 30 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Action)", points: 20 },
      { label: "+30 (Skip Everyone)", points: 30 },
      { label: "+40 (Wild)", points: 40 },
      { label: "+60 (Draw Color)", points: 60 },
    ],
  },
  {
    id: "uno_express",
    name: "Uno Express",
    category: "uno",
    icon: "zap",
    color: "#FFB800",
    winCondition: "lowest",
    targetScore: 200,
    minPlayers: 2,
    maxPlayers: 6,
    description: "Smaller deck, faster rounds, no 0 cards",
    objective: "First to 200 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards (1–9)", points: 0 },
      { label: "Skip / Reverse / Draw Two", points: 20 },
      { label: "Wild", points: 50 },
      { label: "Wild Draw Four", points: 50 },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Value", defaultValue: 20, currentValue: 20 },
      { ruleId: "target_score", label: "Target Score", defaultValue: 200, currentValue: 200 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+50 (Wild/+4)", points: 50 },
    ],
  },
  {
    id: "uno_attack",
    name: "Uno Attack!",
    category: "uno",
    icon: "target",
    color: "#FF8C42",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 10,
    description: "Card launcher shoots random cards at you",
    objective: "First to 500 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards (0–9)", points: 0 },
      { label: "Skip / Reverse", points: 20 },
      { label: "Hit 2 / Discard All", points: 30 },
      { label: "Wild / Wild All Hit", points: 50 },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild / All Hit Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "special_value", label: "Hit 2 / Discard All", defaultValue: 30, currentValue: 30 },
      { ruleId: "action_value", label: "Skip / Reverse Value", defaultValue: 20, currentValue: 20 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Skip/Reverse)", points: 20 },
      { label: "+30 (Hit 2/Discard All)", points: 30 },
      { label: "+50 (Wild/All Hit)", points: 50 },
    ],
  },
  {
    id: "uno_no_mercy",
    name: "Uno No Mercy",
    category: "uno",
    icon: "alert-triangle",
    color: "#E74C3C",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 6,
    description: "Infinite stacking, new brutal wild cards",
    objective: "First to 500 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards (0–9)", points: 0 },
      { label: "Skip / Reverse / Draw Two (stackable)", points: 20 },
      { label: "Wild / Targeted +4 / Discard All", points: 50 },
      { label: "Wild Draw Six", points: 60 },
      { label: "Color Roulette", points: 30 },
    ],
    houseRules: [
      { ruleId: "wd6_value", label: "Wild Draw Six Value", defaultValue: 60, currentValue: 60 },
      { ruleId: "targeted_value", label: "Targeted Draw 4 Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "max_stack", label: "Max Stack Cap (0 = unlimited)", defaultValue: 0, currentValue: 0 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2)", points: 20 },
      { label: "+30 (Roulette)", points: 30 },
      { label: "+50 (Wild/+4/Targeted)", points: 50 },
      { label: "+60 (Wild Draw Six)", points: 60 },
    ],
  },
  {
    id: "uno_dare",
    name: "Uno Dare!",
    category: "uno",
    icon: "mic",
    color: "#1ABC9C",
    winCondition: "lowest",
    targetScore: 500,
    minPlayers: 2,
    maxPlayers: 6,
    description: "Complete dares instead of drawing cards",
    objective: "First to 500 points wins",
    parentId: "uno",
    scoreRules: [
      { label: "Number Cards (0–9)", points: 0 },
      { label: "Skip / Reverse / Draw Two / Challenge", points: 20 },
      { label: "Wild Dare", points: 30 },
      { label: "Wild / Wild Draw Four / Double Dare", points: 50 },
    ],
    houseRules: [
      { ruleId: "wild_dare_value", label: "Wild Dare Value", defaultValue: 30, currentValue: 30 },
      { ruleId: "double_dare_value", label: "Double Dare Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "fail_penalty", label: "Failed Dare Draw Count", defaultValue: 4, currentValue: 4 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Skip/Rev/+2/Challenge)", points: 20 },
      { label: "+30 (Wild Dare)", points: 30 },
      { label: "+50 (Wild/+4/Double Dare)", points: 50 },
    ],
  },

  // ── PHASE 10 ──────────────────────────────────────────────────────────
  {
    id: "phase10",
    name: "Phase 10",
    category: "card",
    icon: "layers",
    color: "#00BFFF",
    winCondition: "lowest",
    minPlayers: 2,
    maxPlayers: 6,
    description: "Rummy-type card game with 10 phases to complete",
    objective: "Be first to complete all 10 phases with the lowest score",
    scoreRules: [
      { label: "Cards 1–9 (low numbers)", points: 5 },
      { label: "Cards 10–12 (high numbers)", points: 10 },
      { label: "Skip Card", points: 15 },
      { label: "Wild Card", points: 25 },
    ],
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
    houseRules: [
      { ruleId: "low_card_value", label: "Low Card Value (1–9)", defaultValue: 5, currentValue: 5 },
      { ruleId: "high_card_value", label: "High Card Value (10–12)", defaultValue: 10, currentValue: 10 },
      { ruleId: "skip_value", label: "Skip Card Value", defaultValue: 15, currentValue: 15 },
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 25, currentValue: 25 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+5 (Cards 1–9)", points: 5 },
      { label: "+10 (Cards 10–12)", points: 10 },
      { label: "+15 (Skip)", points: 15 },
      { label: "+25 (Wild)", points: 25 },
    ],
  },

  // ── SCRABBLE ──────────────────────────────────────────────────────────
  {
    id: "scrabble",
    name: "Scrabble",
    category: "board",
    icon: "grid",
    color: "#FFB800",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 4,
    description: "Classic word game on a 15×15 grid",
    objective: "Score the most points by placing letter tiles on the board",
    houseRules: [
      { ruleId: "bingo_bonus", label: "Bingo Bonus (7 tiles)", defaultValue: 50, currentValue: 50 },
    ],
    hasCalculator: false,
    quickPenalties: [{ label: "+50 Bingo!", points: 50 }],
  },
  {
    id: "spades",
    name: "Spades",
    category: "trick",
    icon: "triangle",
    color: "#6B21E8",
    winCondition: "highest",
    targetScore: 500,
    minPlayers: 4,
    maxPlayers: 4,
    description: "Classic trick-taking partnership card game",
    objective: "Be the first partnership to reach 500 points",
    houseRules: [
      { ruleId: "bag_penalty", label: "Bag Penalty (per 10 bags)", defaultValue: 100, currentValue: 100 },
      { ruleId: "nil_bonus", label: "Nil Bid Bonus", defaultValue: 100, currentValue: 100 },
      { ruleId: "blind_nil_bonus", label: "Blind Nil Bonus", defaultValue: 200, currentValue: 200 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "Set (miss bid)", points: -10 },
      { label: "Bags penalty", points: -100 },
    ],
  },
  {
    id: "hearts",
    name: "Hearts",
    category: "trick",
    icon: "heart",
    color: "#FF4757",
    winCondition: "lowest",
    targetScore: 100,
    minPlayers: 4,
    maxPlayers: 4,
    description: "Trick-avoidance card game",
    objective: "Avoid taking hearts and the Queen of Spades",
    scoreRules: [
      { label: "Each Heart", points: 1 },
      { label: "Queen of Spades", points: 13 },
      { label: "Shoot the Moon", points: -26 },
    ],
    houseRules: [
      { ruleId: "moon_bonus", label: "Shoot the Moon Effect", defaultValue: -26, currentValue: -26 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+1 (Heart)", points: 1 },
      { label: "+13 (Queen)", points: 13 },
    ],
  },
  {
    id: "farkle",
    name: "Farkle",
    category: "dice",
    icon: "circle",
    color: "#00F5A0",
    winCondition: "highest",
    targetScore: 10000,
    minPlayers: 2,
    maxPlayers: 8,
    description: "Press-your-luck dice game",
    objective: "Be the first to reach 10,000 points",
    scoreRules: [
      { label: "Single 1", points: 100 },
      { label: "Single 5", points: 50 },
      { label: "Three 1s", points: 1000 },
      { label: "Three 2s–6s", points: 0 },
      { label: "Straight (1–6)", points: 1500 },
      { label: "Three pairs", points: 1500 },
    ],
    houseRules: [
      { ruleId: "entry_min", label: "Minimum entry score", defaultValue: 500, currentValue: 500 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+100 (One)", points: 100 },
      { label: "+50 (Five)", points: 50 },
      { label: "+500 (Three 1s)", points: 500 },
    ],
  },
  {
    id: "cribbage",
    name: "Cribbage",
    category: "card",
    icon: "bar-chart-2",
    color: "#FF8C42",
    winCondition: "highest",
    targetScore: 121,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Card game scored using a cribbage board",
    objective: "First player to 121 points wins",
    houseRules: [
      { ruleId: "skunk_line", label: "Skunk line", defaultValue: 91, currentValue: 91 },
    ],
    hasCalculator: false,
  },
  {
    id: "euchre",
    name: "Euchre",
    category: "trick",
    icon: "award",
    color: "#9B59B6",
    winCondition: "highest",
    targetScore: 10,
    minPlayers: 4,
    maxPlayers: 4,
    description: "Fast-paced trick-taking partnership game",
    objective: "First team to 10 points wins",
    scoreRules: [
      { label: "Win 3–4 tricks", points: 1 },
      { label: "Win all 5 tricks", points: 2 },
      { label: "Loner — win all 5", points: 4 },
      { label: "Euchre (set makers)", points: 2 },
    ],
    houseRules: [
      { ruleId: "loner_points", label: "Loner bonus points", defaultValue: 4, currentValue: 4 },
    ],
    hasCalculator: false,
    quickPenalties: [
      { label: "+1 (3–4 tricks)", points: 1 },
      { label: "+2 (all 5)", points: 2 },
      { label: "+4 (Loner!)", points: 4 },
    ],
  },
  {
    id: "poker",
    name: "Poker",
    category: "card",
    icon: "dollar-sign",
    color: "#27AE60",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 10,
    description: "Classic betting card game",
    objective: "Win the most chips",
    houseRules: [
      { ruleId: "starting_chips", label: "Starting chips per player", defaultValue: 1000, currentValue: 1000 },
      { ruleId: "small_blind", label: "Small blind", defaultValue: 10, currentValue: 10 },
    ],
    hasCalculator: false,
  },
  {
    id: "gin_rummy",
    name: "Gin Rummy",
    category: "card",
    icon: "shuffle",
    color: "#F39C12",
    winCondition: "highest",
    targetScore: 100,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Matching card game of sets and runs",
    objective: "First player to 100 points wins",
    scoreRules: [
      { label: "Gin bonus", points: 25 },
      { label: "Undercut bonus", points: 25 },
      { label: "Big Gin bonus", points: 31 },
    ],
    houseRules: [
      { ruleId: "gin_bonus", label: "Gin bonus", defaultValue: 25, currentValue: 25 },
      { ruleId: "undercut_bonus", label: "Undercut bonus", defaultValue: 25, currentValue: 25 },
    ],
    hasCalculator: false,
    quickPenalties: [
      { label: "+25 Gin!", points: 25 },
      { label: "+25 Undercut!", points: 25 },
    ],
  },
  {
    id: "dominoes",
    name: "Dominoes",
    category: "tile",
    icon: "columns",
    color: "#ECF0F1",
    winCondition: "lowest",
    targetScore: 100,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Classic tile-matching game",
    objective: "Be the first to reach 0 by playing all your tiles",
    houseRules: [
      { ruleId: "target_score", label: "Target (losing) score", defaultValue: 100, currentValue: 100 },
    ],
    hasCalculator: false,
  },
  {
    id: "skull_king",
    name: "Skull King",
    category: "trick",
    icon: "anchor",
    color: "#1ABC9C",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 8,
    description: "Pirate-themed trick-taking bidding game",
    objective: "Accurately predict tricks to score maximum points",
    scoreRules: [
      { label: "Per correct trick (bid>0)", points: 20 },
      { label: "Bid 0, win 0", points: 10 },
      { label: "Bid 0, win tricks (−10/trick)", points: -10 },
      { label: "Miss bid (−10/trick off)", points: -10 },
      { label: "Skull King captures Pirate", points: 40 },
      { label: "Mermaid escapes Skull King", points: 50 },
    ],
    houseRules: [],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Correct trick)", points: 20 },
      { label: "-10 (Miss bid)", points: -10 },
    ],
  },
  {
    id: "wizard",
    name: "Wizard",
    category: "trick",
    icon: "star",
    color: "#8E44AD",
    winCondition: "highest",
    minPlayers: 3,
    maxPlayers: 6,
    description: "Trick-taking bidding card game",
    objective: "Accurately predict tricks each round",
    scoreRules: [
      { label: "Correct bid bonus", points: 20 },
      { label: "Per correct trick", points: 10 },
      { label: "Wrong bid (−10/trick off)", points: -10 },
    ],
    houseRules: [
      { ruleId: "correct_bid_bonus", label: "Correct bid bonus", defaultValue: 20, currentValue: 20 },
    ],
    hasCalculator: true,
  },
  {
    id: "darts_cricket",
    name: "Darts Cricket",
    category: "dice",
    icon: "target",
    color: "#E74C3C",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 4,
    description: "Cricket dart game targeting numbers 15–20 and bull",
    objective: "Close all numbers with highest score",
    houseRules: [],
    hasCalculator: false,
  },
  {
    id: "darts_301",
    name: "Darts 301",
    category: "dice",
    icon: "target",
    color: "#C0392B",
    winCondition: "lowest",
    targetScore: 0,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Count-down dart game from 301 to exactly 0",
    objective: "Reach exactly 0 (must finish on a double)",
    houseRules: [
      { ruleId: "starting_score", label: "Starting score", defaultValue: 301, currentValue: 301 },
    ],
    hasCalculator: false,
  },
  {
    id: "canasta",
    name: "Canasta",
    category: "card",
    icon: "layers",
    color: "#D35400",
    winCondition: "highest",
    targetScore: 5000,
    minPlayers: 4,
    maxPlayers: 4,
    description: "Partnership card game collecting melds",
    objective: "First team to 5,000 points wins",
    houseRules: [
      { ruleId: "natural_canasta", label: "Natural canasta bonus", defaultValue: 500, currentValue: 500 },
      { ruleId: "mixed_canasta", label: "Mixed canasta bonus", defaultValue: 300, currentValue: 300 },
    ],
    hasCalculator: false,
    quickPenalties: [
      { label: "+500 Natural Canasta", points: 500 },
      { label: "+300 Mixed Canasta", points: 300 },
    ],
  },
  {
    id: "dutch_blitz",
    name: "Dutch Blitz",
    category: "card",
    icon: "zap",
    color: "#F1C40F",
    winCondition: "highest",
    targetScore: 75,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Fast-paced simultaneous card game",
    objective: "First player to 75 points wins",
    scoreRules: [
      { label: "Card on Dutch pile (+2)", points: 2 },
      { label: "Card in Blitz pile (−1)", points: -1 },
    ],
    houseRules: [],
    hasCalculator: false,
    quickPenalties: [
      { label: "+2 (Dutch)", points: 2 },
      { label: "−1 (Blitz)", points: -1 },
    ],
  },
  {
    id: "oh_hell",
    name: "Oh Hell",
    category: "trick",
    icon: "zap-off",
    color: "#2ECC71",
    winCondition: "highest",
    minPlayers: 3,
    maxPlayers: 7,
    description: "Trick-taking bidding game (Up & Down the River)",
    objective: "Accurately predict tricks for maximum score",
    scoreRules: [
      { label: "Correct bid bonus", points: 10 },
      { label: "Per trick taken", points: 1 },
    ],
    houseRules: [
      { ruleId: "bonus", label: "Correct bid bonus", defaultValue: 10, currentValue: 10 },
    ],
    hasCalculator: false,
  },
  {
    id: "monopoly",
    name: "Monopoly",
    category: "board",
    icon: "home",
    color: "#3498DB",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 8,
    description: "Classic real-estate trading board game",
    objective: "Bankrupt all other players",
    houseRules: [
      { ruleId: "free_parking", label: "Free Parking jackpot", defaultValue: 500, currentValue: 500 },
      { ruleId: "go_bonus", label: "Landing on Go bonus", defaultValue: 200, currentValue: 200 },
    ],
    hasCalculator: false,
  },
  {
    id: "pinochle",
    name: "Pinochle",
    category: "trick",
    icon: "award",
    color: "#8E44AD",
    winCondition: "highest",
    targetScore: 1500,
    minPlayers: 4,
    maxPlayers: 4,
    description: "Partnership trick-taking and melding card game",
    objective: "First team to 1,500 points wins",
    houseRules: [
      { ruleId: "trump_bonus", label: "Double trump bonus", defaultValue: 1500, currentValue: 1500 },
    ],
    hasCalculator: false,
  },
];

// Only show non-variant games in the main grid
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
