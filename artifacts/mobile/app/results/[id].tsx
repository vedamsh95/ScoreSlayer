import React, { useCallback, useRef } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";
import { getGameById, GameDefinition } from "@/constants/games";
import { NerdCard } from "@/components/NerdCard";
import { PolymerButton } from "@/components/PolymerButton";
import { Player } from "@/context/GameContext";

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function sortPlayers(players: Player[], game?: GameDefinition | null): Player[] {
  if (!game) return players;
  const isLowestWins = game.winCondition === "lowest";
  return [...players].sort((a, b) =>
    isLowestWins
      ? a.totalScore - b.totalScore
      : b.totalScore - a.totalScore
  );
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getSession, deleteSession } = useGame();
  const nerdCardRef = useRef<View>(null);

  const session = getSession(id ?? "");
  const game = session ? getGameById(session.gameId) : null;

  const handleShare = useCallback(async () => {
    if (!session) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sorted = sortPlayers(session.players, game);
    const duration = session.endedAt
      ? formatDuration(session.endedAt - session.startedAt)
      : "—";

    const text = [
      `🎮 ScoreSlayer - ${session.gameName}`,
      ``,
      `👑 Winner: ${session.winnerName}`,
      ``,
      `Final Scores:`,
      ...sorted.map((p, i) => `${i + 1}. ${p.name}: ${p.totalScore.toLocaleString()} pts`),
      ``,
      `Rounds: ${session.currentRound - 1} | Duration: ${duration}`,
      ``,
      `Slay the Game. Own the Stats. — ScoreSlayer`,
    ].join("\n");

    try {
      await Share.share({ message: text, title: "ScoreSlayer Results" });
    } catch {}
  }, [session]);

  if (!session || !game) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Results not found</Text>
        <Pressable onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.backLink}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const sortedPlayers = sortPlayers(session.players, game);
  const winner = sortedPlayers[0];
  const duration = session.endedAt
    ? formatDuration(session.endedAt - session.startedAt)
    : "—";

  const maxScore = Math.max(...session.players.map((p) => Math.abs(p.totalScore))) || 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/(tabs)")}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Game Over</Text>
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Feather name="share-2" size={18} color="#00F5A0" />
        </Pressable>
      </View>

      <View style={styles.winnerBanner}>
        <View style={[styles.crownCircle, { backgroundColor: session.gameColor + "33" }]}>
          <Text style={styles.crownText}>👑</Text>
        </View>
        <Text style={[styles.winnerLabel, { color: session.gameColor }]}>WINNER</Text>
        <Text style={styles.winnerName}>{winner?.name}</Text>
        <Text style={styles.winnerScore}>
          {winner?.totalScore.toLocaleString()} points
        </Text>
        <Text style={styles.gameMeta}>
          {session.gameName} · {session.currentRound - 1} rounds · {duration}
        </Text>
      </View>

      <View style={styles.scoreChart}>
        <Text style={styles.chartTitle}>Final Standings</Text>
        {sortedPlayers.map((player, i) => {
          const barWidth = Math.abs(player.totalScore) / maxScore;
          return (
            <View key={player.id} style={styles.chartRow}>
              <Text style={styles.chartRank}>{i + 1}</Text>
              <View style={styles.chartNameCol}>
                <View style={styles.chartNameRow}>
                  <View style={[styles.chartDot, { backgroundColor: player.color }]} />
                  <Text style={styles.chartName}>{player.name}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${barWidth * 100}%` as any,
                        backgroundColor: player.color,
                        opacity: i === 0 ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.chartScore, i === 0 && { color: player.color }]}>
                {player.totalScore.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.nerdCardWrap}>
        <Text style={styles.nerdCardHeading}>Your Nerd Card</Text>
        <NerdCard
          ref={nerdCardRef}
          session={session}
          gameColor={session.gameColor}
        />
      </View>

      <View style={styles.actionRow}>
        <PolymerButton
          label="Share Results"
          onPress={handleShare}
          color="#00F5A0"
          textColor="#1A0533"
          size="md"
          style={{ flex: 1 }}
          icon={<Feather name="share-2" size={14} color="#1A0533" />}
        />
        <PolymerButton
          label="Play Again"
          onPress={() => {
            router.replace({
              pathname: "/setup/[gameId]",
              params: { gameId: session.gameId },
            });
          }}
          color="#FF2D78"
          textColor="#FFFFFF"
          size="md"
          style={{ flex: 1 }}
          icon={<Feather name="refresh-cw" size={14} color="#FFFFFF" />}
        />
      </View>

      <Pressable
        style={styles.homeBtn}
        onPress={() => router.replace("/(tabs)")}
      >
        <Ionicons name="home-outline" size={16} color="rgba(255,255,255,0.5)" />
        <Text style={styles.homeBtnText}>Back to Game Hub</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0533",
  },
  content: {
    paddingHorizontal: 20,
  },
  errContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A0533",
    gap: 12,
  },
  errText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  backLink: {
    color: "#00F5A0",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  shareBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,245,160,0.1)",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,245,160,0.25)",
  },
  winnerBanner: {
    alignItems: "center",
    marginBottom: 28,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  crownText: {
    fontSize: 36,
  },
  winnerLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  winnerName: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  winnerScore: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
  },
  gameMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  scoreChart: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    gap: 14,
  },
  chartTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chartRank: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    width: 16,
    textAlign: "center",
  },
  chartNameCol: {
    flex: 1,
    gap: 4,
  },
  chartNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  barTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  chartScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    minWidth: 52,
    textAlign: "right",
  },
  nerdCardWrap: {
    marginBottom: 24,
  },
  nerdCardHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  homeBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
});
