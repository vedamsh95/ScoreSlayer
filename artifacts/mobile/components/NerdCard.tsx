import React, { memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, SlideInRight } from "react-native-reanimated";
import { GameSession, Player } from "@/context/GameContext";
import { useSessionAnalysis } from "@/hooks/useSessionAnalysis";
import { PolymerCard } from "./PolymerCard";
import { getGameById, GameDefinition } from "@/constants/games";

const { width } = Dimensions.get("window");

interface NerdCardProps {
  session: GameSession;
  gameColor: string;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getPlayerRankings(session: GameSession): Player[] {
  const game = getGameById(session.gameId);
  if (!game) return session.players;

  const isPhase10 = game.id.startsWith("phase10") || game.parentId === "phase10";

  return [...session.players].sort((a, b) => {
    if (isPhase10) {
      if ((b.currentPhase || 1) !== (a.currentPhase || 1)) {
        return (b.currentPhase || 1) - (a.currentPhase || 1);
      }
      return a.totalScore - b.totalScore;
    }

    const isLowestWins = game.winCondition === "lowest";
    return isLowestWins
      ? a.totalScore - b.totalScore
      : b.totalScore - a.totalScore;
  });
}

function getBestRound(player: Player): { round: number; score: number } | null {
  if (player.scores.length === 0) return null;
  let best = player.scores[0];
  let bestRound = 1;
  player.scores.forEach((s, i) => {
    if (s > best) { best = s; bestRound = i + 1; }
  });
  return { round: bestRound, score: best };
}

export const NerdCard = memo(React.forwardRef<View, NerdCardProps>(
  ({ session, gameColor }, ref) => {
    const rankings = getPlayerRankings(session);
    const winner = rankings[0];
    const duration = session.endedAt
      ? formatDuration(session.endedAt - session.startedAt)
      : "—";

    const winnerBest = winner ? getBestRound(winner) : null;

    const { roasts: allRoasts } = useSessionAnalysis(session);

    const rankColors = [gameColor, "#C0C0C0", "#CD7F32"];
    const rankLabels = ["1ST", "2ND", "3RD"];

    return (
      <View ref={ref} style={[styles.card, { borderColor: gameColor + "44" }]}>
        <View style={[styles.cardHeader, { backgroundColor: gameColor + "22" }]}>
          <View style={styles.headerTop}>
            <View style={[styles.gameBadge, { backgroundColor: gameColor }]}>
              <Text style={styles.gameBadgeText}>{session.gameName.toUpperCase()}</Text>
            </View>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
          <Text style={styles.nerdCardLabel}>NERD CARD</Text>
        </View>

        <View style={styles.winnerSection}>
          <View style={[styles.winnerCrown, { backgroundColor: gameColor + "33" }]}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
          <Text style={[styles.winnerName, { color: gameColor }]}>
            {winner?.name ?? "—"}
          </Text>
          <Text style={styles.winnerScore}>
            {winner?.totalScore.toLocaleString() ?? "0"} pts
          </Text>
          {winnerBest && (
            <Text style={styles.winnerBest}>
              Best Round: +{winnerBest.score} (Rd {winnerBest.round})
            </Text>
          )}
        </View>

        <View style={styles.rankingsSection}>
          {rankings.slice(0, 4).map((player, i) => (
            <View key={player.id} style={styles.rankRow}>
              <View style={[styles.rankBadge, { backgroundColor: (rankColors[i] ?? "rgba(255,255,255,0.15)") + "33" }]}>
                <Text style={[styles.rankLabel, { color: rankColors[i] ?? "rgba(255,255,255,0.6)" }]}>
                  {rankLabels[i] ?? `${i + 1}TH`}
                </Text>
              </View>
              <Text style={styles.rankPlayerName}>{player.name}</Text>
              <Text style={[styles.rankScore, i === 0 && { color: gameColor }]}>
                {player.totalScore.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{session.currentRound - 1}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{session.players.length}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {allRoasts.length > 0 && (
          <View style={styles.roastSection}>
            <View style={styles.roastHeader}>
              <Ionicons name="flame" size={14} color="#FF2D78" />
              <Text style={styles.roastTitle}>GAME ROASTS</Text>
            </View>
            {allRoasts.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.roastItem}>
                <Ionicons name="chatbubble-ellipses-outline" size={12} color="rgba(255,255,255,0.4)" />
                <Text style={styles.roastText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ScoreSlayer • Slay the Game. Own the Stats.</Text>
        </View>
      </View>
    );
  }
));

NerdCard.displayName = "NerdCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A0533",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  gameBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#1A0533",
    letterSpacing: 1,
  },
  durationText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  nerdCardLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  winnerSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  winnerCrown: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  crownEmoji: {
    fontSize: 28,
  },
  winnerName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginBottom: 4,
  },
  winnerScore: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  winnerBest: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  rankingsSection: {
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
  },
  rankLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  rankPlayerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  rankScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  footer: {
    padding: 12,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: "rgba(255,255,255,0.25)",
  },
  roastSection: {
    padding: 16,
    backgroundColor: "rgba(255,45,120,0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  roastHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  roastTitle: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "#FF2D78",
    letterSpacing: 1,
  },
  roastItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  roastText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
  },
});
