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
  currentPhase?: number;
  totalScore: number;
  isEliminated?: boolean;
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
  addRoundScores: (sessionId: string, scores: Record<string, number>) => void;
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
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
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
          currentPhase: game.phases ? 1 : undefined,
          totalScore: 0,
          isEliminated: false,
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

  const setActiveSession = useCallback((sessionId: string | null) => {
    dispatch({ type: "SET_ACTIVE", sessionId });
  }, []);

  const addRoundScores = useCallback(
    (sessionId: string, scores: Record<string, number>) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const updatedPlayers = session.players.map((p) => {
        const roundScore = scores[p.id] ?? 0;
        return {
          ...p,
          scores: [...p.scores, roundScore],
          totalScore: p.totalScore + roundScore,
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
