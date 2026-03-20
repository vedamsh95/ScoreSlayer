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
import { PolymerCard, NeuTrench, NeuButton, BrandButton, NeuIconWell } from "@/components/PolymerCard";
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
        <NeuIconWell color="#1A0533" size={42} borderRadius={14}>
          <Pressable onPress={() => router.replace("/(tabs)")} style={styles.backPressable}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        </NeuIconWell>
        
        <Text style={styles.headerTitle}>Game Over</Text>

        <NeuIconWell color="#1A0533" size={42} borderRadius={14}>
          <Pressable onPress={handleShare} style={styles.backPressable}>
            <Feather name="share-2" size={18} color="#00F5A0" />
          </Pressable>
        </NeuIconWell>
      </View>

      <PolymerCard color={session.gameColor + "44"} borderRadius={32} padding={28} style={styles.winnerBanner}>
        <View style={[styles.crownCircleShadow, { borderRadius: 40 }]}>
          <View style={[styles.crownCircleBody, { backgroundColor: session.gameColor, borderRadius: 40 }]}>
            <View style={styles.crownGloss} pointerEvents="none" />
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        </View>
        <Text style={[styles.winnerLabel, { color: session.gameColor }]}>WINNER</Text>
        <Text style={styles.winnerName}>{winner?.name}</Text>
        <Text style={styles.winnerScore}>
          {winner?.totalScore.toLocaleString()} points
        </Text>
        <Text style={styles.gameMeta}>
          {session.currentRound - 1} rounds · {duration}
        </Text>
      </PolymerCard>

      <PolymerCard color="rgba(255,255,255,0.03)" borderRadius={24} padding={20} style={styles.scoreChart}>
        <Text style={styles.chartTitle}>Final Standings</Text>
        <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={20} padding={12} style={styles.chartTrench}>
          {sortedPlayers.map((player, i) => {
            const barWidth = Math.abs(player.totalScore) / maxScore;
            return (
              <View key={player.id} style={[styles.chartRow, i < sortedPlayers.length - 1 && styles.chartRowBorder]}>
                <Text style={styles.chartRank}>#{i + 1}</Text>
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
        </NeuTrench>
      </PolymerCard>

      <View style={styles.nerdCardWrap}>
        <Text style={styles.nerdCardHeading}>Your Nerd Card</Text>
        <NerdCard
          ref={nerdCardRef}
          session={session}
          gameColor={session.gameColor}
        />
      </View>

      <View style={styles.actionRow}>
        <NeuButton
          onPress={handleShare}
          color="#34495E"
          borderRadius={20}
          style={{ flex: 1, height: 58 }}
        >
          <View style={styles.btnInner}>
            <Feather name="share-2" size={16} color="#FFFFFF" />
            <Text style={styles.btnText}>SHARE</Text>
          </View>
        </NeuButton>
        <BrandButton
          onPress={() => {
            router.replace({
              pathname: "/setup/[gameId]",
              params: { gameId: session.gameId },
            });
          }}
          style={{ flex: 1, height: 58 }}
        >
          <View style={styles.btnInner}>
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
            <Text style={styles.brandBtnText}>PLAY AGAIN</Text>
          </View>
        </BrandButton>
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
  backPressable: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_900Black",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  winnerBanner: {
    alignItems: "center",
    marginBottom: 28,
  },
  crownCircleShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
    marginBottom: 12,
  },
  crownCircleBody: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  crownGloss: {
    position: "absolute",
    top: 4,
    left: 10,
    width: "45%",
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomRightRadius: 30,
  },
  crownEmoji: {
    fontSize: 40,
    zIndex: 2,
  },
  winnerLabel: {
    fontFamily: "Inter_900Black",
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 8,
    textTransform: "uppercase",
    opacity: 0.9,
  },
  winnerName: {
    fontFamily: "Inter_900Black",
    fontSize: 42,
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  winnerScore: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 20,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },
  gameMeta: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
  },
  scoreChart: {
    marginBottom: 28,
  },
  chartTitle: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  chartTrench: {
    gap: 4,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  chartRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  chartRank: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.25)",
    width: 28,
  },
  chartNameCol: {
    flex: 1,
    gap: 6,
  },
  chartNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  barTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  chartScore: {
    fontFamily: "Inter_900Black",
    fontSize: 18,
    color: "#FFFFFF",
    minWidth: 60,
    textAlign: "right",
  },
  nerdCardWrap: {
    marginBottom: 32,
  },
  nerdCardHeading: {
    fontFamily: "Inter_900Black",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  brandBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    opacity: 0.5,
  },
  homeBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
