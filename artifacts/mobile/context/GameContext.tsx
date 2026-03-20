import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { GameDefinition, HouseRuleOverride } from "@/constants/games";

export interface Player {
  id: string;
  name: string;
  color: string;
  scores: number[];
  roundLogs: Record<number, number[]>; // Round index -> list of card values
  currentPhase?: number;
  currentPhaseCleared?: boolean;
  clearedHistory: boolean[]; // Parallel to scores array
  bids: (number | null)[]; // Parallel to scores array
  tricksWon: (number | null)[]; // Parallel to scores array
  bagsHistory: number[]; // Parallel to scores array
  totalScore: number;
  totalBags?: number;
  isEliminated?: boolean;
  roundRoasts: Record<number, string[]>; // Round index -> list of roast messages
  roundMetadata: Record<number, any>; // Round index -> full metadata from calculator
}

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  gameColor: string;
  players: Player[];
  currentRound: number;
  dealerIndex: number;
  direction: "CW" | "CCW";
  startedAt: number;
  endedAt?: number;
  isComplete: boolean;
  houseRules: HouseRuleOverride[];
  winnerName?: string;
  customNotes?: string;
}

interface GameState {
  sessions: GameSession[];
  activeSessionId: string | null;
}

type GameAction =
  | { type: "LOAD_SESSIONS"; sessions: GameSession[] }
  | { type: "CREATE_SESSION"; session: GameSession }
  | { type: "UPDATE_SESSION"; session: GameSession }
  | { type: "DELETE_SESSION"; sessionId: string }
  | { type: "CLEAR_SESSIONS" }
  | { type: "SET_ACTIVE"; sessionId: string | null }
  | { type: "END_SESSION"; sessionId: string; winnerName: string };

const STORAGE_KEY = "@scoreslayer_sessions";

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_SESSIONS":
      return { ...state, sessions: action.sessions };
    case "CREATE_SESSION":
      return {
        ...state,
        sessions: [action.session, ...state.sessions],
        activeSessionId: action.session.id,
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.session.id ? action.session : s
        ),
      };
    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.sessionId),
        activeSessionId:
          state.activeSessionId === action.sessionId
            ? null
            : state.activeSessionId,
      };
    case "CLEAR_SESSIONS":
      return {
        ...state,
        sessions: [],
        activeSessionId: null,
      };
    case "SET_ACTIVE":
      return { ...state, activeSessionId: action.sessionId };
    case "END_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                isComplete: true,
                endedAt: Date.now(),
                winnerName: action.winnerName,
              }
            : s
        ),
      };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  createSession: (
    game: GameDefinition,
    playerNames: string[],
    houseRules: HouseRuleOverride[]
  ) => GameSession;
  updateSession: (session: GameSession) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  addRoundScores: (
    sessionId: string,
    scores: Record<string, number>,
    logs: Record<string, number[]>,
    cleared?: Record<string, boolean>,
    bids?: Record<string, number>,
    tricksWon?: Record<string, number>,
    metadata?: Record<string, any>
  ) => void;
  updateRoundScores: (
    sessionId: string,
    roundIndex: number,
    scores: Record<string, number>,
    logs: Record<string, number[]>,
    cleared?: Record<string, boolean>,
    bids?: Record<string, number>,
    tricksWon?: Record<string, number>,
    metadata?: Record<string, any>
  ) => void;
  deleteRound: (sessionId: string, roundIndex: number) => void;
  deleteAllSessions: () => void;
  endSession: (sessionId: string) => void;
  getActiveSession: () => GameSession | null;
  getSession: (sessionId: string) => GameSession | null;
}

const GameContext = createContext<GameContextType | null>(null);

const PLAYER_COLORS = [
  "#FF2D78",
  "#00F5A0",
  "#FFB800",
  "#00BFFF",
  "#FF8C42",
  "#9B59B6",
  "#1ABC9C",
  "#E74C3C",
];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    sessions: [],
    activeSessionId: null,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data: string | null) => {
      if (data) {
        try {
          const sessions = JSON.parse(data) as GameSession[];
          dispatch({ type: "LOAD_SESSIONS", sessions });
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.sessions));
  }, [state.sessions]);

  const createSession = useCallback(
    (
      game: GameDefinition,
      playerNames: string[],
      houseRules: HouseRuleOverride[]
    ): GameSession => {
      const session: GameSession = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        gameId: game.id,
        gameName: game.name,
        gameColor: game.color,
        players: playerNames.map((name, i) => ({
          id: `p_${i}_${Date.now()}`,
          name,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          scores: [],
          roundLogs: {},
          currentPhase: game.phases ? 1 : undefined,
          currentPhaseCleared: false,
          clearedHistory: [],
          bids: [],
          tricksWon: [],
          bagsHistory: [],
          totalScore: 0,
          totalBags: 0,
          isEliminated: false,
          roundRoasts: {},
          roundMetadata: {},
        })),
        currentRound: 1,
        dealerIndex: 0,
        direction: "CW",
        startedAt: Date.now(),
        isComplete: false,
        houseRules,
      };
      dispatch({ type: "CREATE_SESSION", session });
      return session;
    },
    []
  );

  const updateSession = useCallback((session: GameSession) => {
    dispatch({ type: "UPDATE_SESSION", session });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: "DELETE_SESSION", sessionId });
  }, []);

  const deleteAllSessions = useCallback(() => {
    dispatch({ type: "CLEAR_SESSIONS" });
  }, []);

  const setActiveSession = useCallback((sessionId: string | null) => {
    dispatch({ type: "SET_ACTIVE", sessionId });
  }, []);

  const addRoundScores = useCallback(
    (
      sessionId: string,
      scores: Record<string, number>,
      logs: Record<string, number[]>,
      cleared?: Record<string, boolean>,
      bids?: Record<string, number>,
      tricksWon?: Record<string, number>,
      metadata?: Record<string, any>
    ) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const isSpades = session.gameId.startsWith("spades");

      const updatedPlayers = session.players.map((p) => {
        let roundScore = scores[p.id] ?? 0;
        
        // 1. Mölkky: Cancellation/Bust logic
        if (session.gameId === "moelkky") {
          let newTotal = p.totalScore + roundScore;
          if (newTotal > 50) {
            // Bust! Reset to 25
            roundScore = 25 - p.totalScore;
          }
        }
        
        // 2. Cornhole: Cancellation logic
        // Note: Raw scores should be passed to 'scores', we apply cancellation here
        if (session.gameId === "cornhole") {
          const allScores = Object.values(scores);
          const maxScore = Math.max(...allScores);
          const minScore = Math.min(...allScores);
          // Simple cancellation for 2 players/teams
          if (allScores.length === 2) {
             const diff = Math.abs(allScores[0] - allScores[1]);
             if (scores[p.id] === maxScore && maxScore !== minScore) {
               roundScore = diff;
             } else {
               roundScore = 0;
             }
          }
        }

        const playerLogs = logs[p.id] ?? [];
        const wasCleared = cleared?.[p.id] ?? false;
        const playerBid = bids?.[p.id] ?? null;
        const playerWon = tricksWon?.[p.id] ?? null;

        let nextPhase = p.currentPhase;
        if (p.currentPhase !== undefined && wasCleared) {
          nextPhase = p.currentPhase + 1;
        }

        const newBids = [...p.bids, playerBid];
        const newTricksWon = [...p.tricksWon, playerWon];
        
        let roundBags = 0;
        if (isSpades && playerBid !== null && playerWon !== null && playerWon >= playerBid && playerBid > 0) {
          roundBags = playerWon - playerBid;
        }
        const newBagsHistory = [...p.bagsHistory, roundBags];
        const totalBags = newBagsHistory.reduce((sum, b) => sum + b, 0);

        return {
          ...p,
          scores: [...p.scores, roundScore],
          roundLogs: { ...p.roundLogs, [session.currentRound - 1]: playerLogs },
          currentPhase: nextPhase,
          currentPhaseCleared: wasCleared,
          clearedHistory: [...p.clearedHistory, wasCleared],
          bids: newBids,
          tricksWon: newTricksWon,
          bagsHistory: newBagsHistory,
          totalBags,
          totalScore: p.totalScore + roundScore,
          roundRoasts: { ...p.roundRoasts, [session.currentRound - 1]: metadata?.[p.id]?.roasts ?? [] },
          roundMetadata: { ...p.roundMetadata, [session.currentRound - 1]: metadata?.[p.id] ?? {} },
        };
      });

      const updated: GameSession = {
        ...session,
        players: updatedPlayers,
        currentRound: session.currentRound + 1,
        dealerIndex: (session.dealerIndex + 1) % session.players.length,
      };
      dispatch({ type: "UPDATE_SESSION", session: updated });
    },
    [state.sessions]
  );

  const updateRoundScores = useCallback(
    (
      sessionId: string,
      roundIndex: number,
      scores: Record<string, number>,
      logs: Record<string, number[]>,
      cleared?: Record<string, boolean>,
      bids?: Record<string, number>,
      tricksWon?: Record<string, number>,
      metadata?: Record<string, any>
    ) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const isSpades = session.gameId.startsWith("spades");

      const updatedPlayers = session.players.map((p) => {
        const newScores = [...p.scores];
        let rScore = scores[p.id] ?? 0;

        // 1. Mölkky: Bust logic
        if (session.gameId === "moelkky") {
           // Get score BEFORE this round
           const scoreBeforeHand = p.scores.slice(0, roundIndex).reduce((sum, s) => sum + s, 0);
           if (scoreBeforeHand + rScore > 50) {
              rScore = 25 - scoreBeforeHand;
           }
        }

        // 2. Cornhole: Cancellation logic
        if (session.gameId === "cornhole") {
          const allScores = Object.values(scores);
          const maxScore = Math.max(...allScores);
          const minScore = Math.min(...allScores);
          if (allScores.length === 2) {
             const diff = Math.abs(allScores[0] - allScores[1]);
             if (scores[p.id] === maxScore && maxScore !== minScore) {
               rScore = diff;
             } else {
               rScore = 0;
             }
          }
        }

        newScores[roundIndex] = rScore;
        
        const newRoundLogs = { ...p.roundLogs, [roundIndex]: logs[p.id] ?? [] };
        const newClearedHistory = [...p.clearedHistory];
        newClearedHistory[roundIndex] = cleared?.[p.id] ?? p.clearedHistory[roundIndex] ?? false;

        const newBids = [...p.bids];
        newBids[roundIndex] = bids?.[p.id] ?? p.bids[roundIndex] ?? null;

        const newTricksWon = [...p.tricksWon];
        newTricksWon[roundIndex] = tricksWon?.[p.id] ?? p.tricksWon[roundIndex] ?? null;

        // Recalculate bags history
        const newBagsHistory = [...p.bagsHistory];
        if (isSpades) {
          const rBid = newBids[roundIndex];
          const rWon = newTricksWon[roundIndex];
          let rBags = 0;
          if (rBid !== null && rWon !== null && rWon >= rBid && rBid > 0) {
            rBags = rWon - rBid;
          }
          newBagsHistory[roundIndex] = rBags;
        }

        // Recalculate phase progress
        let currentPhase = p.currentPhase !== undefined ? 1 : undefined;
        if (currentPhase !== undefined) {
          currentPhase = newClearedHistory.reduce((acc, c) => (c ? (acc || 0) + 1 : acc), 1);
        }

        return {
          ...p,
          scores: newScores,
          roundLogs: newRoundLogs,
          clearedHistory: newClearedHistory,
          bids: newBids,
          tricksWon: newTricksWon,
          bagsHistory: newBagsHistory,
          currentPhase,
          currentPhaseCleared: newClearedHistory[newClearedHistory.length - 1],
          totalBags: newBagsHistory.reduce((sum, b) => sum + b, 0),
          totalScore: newScores.reduce((sum, s) => sum + s, 0),
          roundRoasts: { 
            ...p.roundRoasts, 
            [roundIndex]: metadata?.[p.id]?.roasts ?? p.roundRoasts[roundIndex] ?? [] 
          },
          roundMetadata: {
            ...p.roundMetadata,
            [roundIndex]: metadata?.[p.id] ?? p.roundMetadata[roundIndex] ?? {}
          },
        };
      });

      dispatch({ type: "UPDATE_SESSION", session: { ...session, players: updatedPlayers } });
    },
    [state.sessions]
  );

  const deleteRound = useCallback(
    (sessionId: string, roundIndex: number) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const updatedPlayers = session.players.map((p) => {
        const newScores = p.scores.filter((_, i) => i !== roundIndex);
        const newClearedHistory = p.clearedHistory.filter((_, i) => i !== roundIndex);
        const newBids = p.bids.filter((_, i) => i !== roundIndex);
        const newTricksWon = p.tricksWon.filter((_, i) => i !== roundIndex);
        const newBagsHistory = p.bagsHistory.filter((_, i) => i !== roundIndex);

        const newRoundLogs: Record<number, number[]> = {};
        
        Object.entries(p.roundLogs).forEach(([idx, log]) => {
          const i = parseInt(idx);
          if (i < roundIndex) newRoundLogs[i] = log;
          else if (i > roundIndex) newRoundLogs[i - 1] = log;
        });

        // Recalculate phase progress
        let currentPhase = p.currentPhase !== undefined ? 1 : undefined;
        if (currentPhase !== undefined) {
          currentPhase = newClearedHistory.reduce((acc, c) => (c ? (acc || 0) + 1 : acc), 1);
        }

        return {
          ...p,
          scores: newScores,
          roundLogs: newRoundLogs,
          clearedHistory: newClearedHistory,
          bids: newBids,
          tricksWon: newTricksWon,
          bagsHistory: newBagsHistory,
          currentPhase,
          currentPhaseCleared: newClearedHistory[newClearedHistory.length - 1] ?? false,
          totalBags: newBagsHistory.reduce((sum, b) => sum + b, 0),
          totalScore: newScores.reduce((sum, s) => sum + s, 0),
        };
      });

      dispatch({
        type: "UPDATE_SESSION",
        session: {
          ...session,
          players: updatedPlayers,
          currentRound: session.currentRound - 1,
          dealerIndex: (session.dealerIndex - 1 + session.players.length) % session.players.length,
        },
      });
    },
    [state.sessions]
  );

  const endSession = useCallback(
    (sessionId: string) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const sorted = [...session.players].sort((a, b) =>
        session.players[0] ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
      );
      const winnerName = sorted[0]?.name ?? "Unknown";
      dispatch({ type: "END_SESSION", sessionId, winnerName });
    },
    [state.sessions]
  );

  const getActiveSession = useCallback(() => {
    if (!state.activeSessionId) return null;
    return state.sessions.find((s) => s.id === state.activeSessionId) ?? null;
  }, [state]);

  const getSession = useCallback(
    (sessionId: string) => {
      return state.sessions.find((s) => s.id === sessionId) ?? null;
    },
    [state.sessions]
  );

  return (
    <GameContext.Provider
      value={{
        state,
        createSession,
        updateSession,
        deleteSession,
        setActiveSession,
        addRoundScores,
        updateRoundScores,
        deleteRound,
        deleteAllSessions,
        endSession,
        getActiveSession,
        getSession,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
