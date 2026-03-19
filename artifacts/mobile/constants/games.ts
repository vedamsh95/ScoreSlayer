export type WinCondition = "highest" | "lowest";
export type GameCategory = "card" | "board" | "dice" | "tile" | "trick";

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
}

export const GAMES: GameDefinition[] = [
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
    description: "Classic card shedding game with action cards",
    objective: "Be the first player to reach 500 points by making others hold cards",
    scoreRules: [
      { label: "Number Cards", points: 0 },
      { label: "Skip / Reverse / Draw 2", points: 20 },
      { label: "Wild", points: 50 },
      { label: "Wild Draw 4", points: 50 },
    ],
    houseRules: [
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "wild_draw4_value", label: "Wild Draw 4 Value", defaultValue: 50, currentValue: 50 },
      { ruleId: "action_value", label: "Action Card Value", defaultValue: 20, currentValue: 20 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+20 (Action)", points: 20 },
      { label: "+50 (Wild)", points: 50 },
    ],
  },
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
      { label: "Cards 1-9", points: 5 },
      { label: "Cards 10-12", points: 10 },
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
      { ruleId: "wild_value", label: "Wild Card Value", defaultValue: 25, currentValue: 25 },
      { ruleId: "skip_value", label: "Skip Card Value", defaultValue: 15, currentValue: 15 },
    ],
    hasCalculator: true,
    quickPenalties: [
      { label: "+5 (Low Card)", points: 5 },
      { label: "+10 (High Card)", points: 10 },
      { label: "+25 (Wild)", points: 25 },
    ],
  },
  {
    id: "scrabble",
    name: "Scrabble",
    category: "board",
    icon: "grid",
    color: "#FFB800",
    winCondition: "highest",
    minPlayers: 2,
    maxPlayers: 4,
    description: "Classic word game on a 15x15 grid",
    objective: "Score the most points by placing letter tiles on the board",
    houseRules: [
      { ruleId: "bingo_bonus", label: "Bingo Bonus (7 tiles)", defaultValue: 50, currentValue: 50 },
    ],
    hasCalculator: false,
    quickPenalties: [
      { label: "+50 Bingo!", points: 50 },
    ],
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
      { label: "Three 2s", points: 200 },
      { label: "Three 3s", points: 300 },
      { label: "Three 4s", points: 400 },
      { label: "Three 5s", points: 500 },
      { label: "Three 6s", points: 600 },
      { label: "Straight (1-6)", points: 1500 },
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
      { label: "Win 3-4 tricks", points: 1 },
      { label: "Win all 5 tricks", points: 2 },
      { label: "Loner - win all 5", points: 4 },
      { label: "Euchre (set makers)", points: 2 },
    ],
    houseRules: [
      { ruleId: "loner_points", label: "Loner bonus points", defaultValue: 4, currentValue: 4 },
    ],
    hasCalculator: false,
    quickPenalties: [
      { label: "+1 (3-4 tricks)", points: 1 },
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
    description: "Classic betting card game with hand rankings",
    objective: "Win the most chips from other players",
    houseRules: [
      { ruleId: "starting_chips", label: "Starting chips per player", defaultValue: 1000, currentValue: 1000 },
      { ruleId: "small_blind", label: "Small blind amount", defaultValue: 10, currentValue: 10 },
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
      { ruleId: "gin_bonus", label: "Gin bonus points", defaultValue: 25, currentValue: 25 },
      { ruleId: "undercut_bonus", label: "Undercut bonus points", defaultValue: 25, currentValue: 25 },
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
    objective: "Accurately predict your tricks to score maximum points",
    scoreRules: [
      { label: "Per correct trick (bid>0)", points: 20 },
      { label: "Bid 0, win 0", points: 10 },
      { label: "Bid 0, win tricks (-10 per trick)", points: -10 },
      { label: "Miss bid (-10 per trick)", points: -10 },
      { label: "Pirate captures Mermaid", points: 20 },
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
    description: "Trick-taking bidding card game with wizards and jesters",
    objective: "Accurately predict your tricks each round",
    scoreRules: [
      { label: "Correct bid bonus", points: 20 },
      { label: "Per correct trick", points: 10 },
      { label: "Wrong bid penalty (per trick off)", points: -10 },
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
    description: "Cricket dart game targeting numbers 15-20 and bull",
    objective: "Close all numbers and have the highest score",
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
    objective: "Reach exactly 0 to win (must finish on double)",
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
      { label: "Card in Blitz pile (-1)", points: -1 },
    ],
    houseRules: [],
    hasCalculator: false,
    quickPenalties: [
      { label: "+2 (Dutch)", points: 2 },
      { label: "-1 (Blitz)", points: -1 },
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
    description: "Trick-taking bidding game also called Up and Down the River",
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
    description: "Classic real estate trading board game",
    objective: "Bankrupt all other players and own the most property",
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
