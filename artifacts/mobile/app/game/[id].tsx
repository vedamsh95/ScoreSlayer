import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";
import { getGameById } from "@/constants/games";
import { PlayerScoreRow } from "@/components/PlayerScoreRow";
import { ScoreInputModal } from "@/components/ScoreInputModal";
import { PolymerButton } from "@/components/PolymerButton";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { Player } from "@/context/GameContext";

function sortPlayers(players: Player[], gameId: string): Player[] {
  const lowestWins = ["hearts", "uno", "phase10", "dominoes", "darts_301"];
  return [...players].sort((a, b) =>
    lowestWins.includes(gameId)
      ? a.totalScore - b.totalScore
      : b.totalScore - a.totalScore
  );
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getSession, addRoundScores, endSession, updateSession } = useGame();

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const session = getSession(id ?? "");

  const game = useMemo(
    () => (session ? getGameById(session.gameId) : null),
    [session?.gameId]
  );

  const sortedPlayers = useMemo(
    () => (session ? sortPlayers(session.players, session.gameId) : []),
    [session]
  );

  const handleSubmitScores = useCallback(
    (scores: Record<string, number>) => {
      if (!id) return;
      addRoundScores(id, scores);
      setShowScoreModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [id, addRoundScores]
  );

  const handleEndGame = useCallback(() => {
    Alert.alert(
      "End Game?",
      "This will finalize scores and generate your Nerd Card.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Game",
          style: "destructive",
          onPress: () => {
            if (!id) return;
            endSession(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace({ pathname: "/results/[id]", params: { id } });
          },
        },
      ]
    );
  }, [id, endSession]);

  const toggleDirection = useCallback(() => {
    if (!session) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSession({
      ...session,
      direction: session.direction === "CW" ? "CCW" : "CW",
    });
  }, [session, updateSession]);

  if (!session || !game) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Game session not found</Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.errBtn}>
          <Text style={styles.errBtnText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const dealer = session.players[session.dealerIndex];

  const recentRoundScores: Record<string, number> = {};
  session.players.forEach((p) => {
    const last = p.scores[p.scores.length - 1];
    if (last !== undefined) recentRoundScores[p.id] = last;
  });

  const hasTargetScore = game.targetScore !== undefined;
  const leader = sortedPlayers[0];
  const leaderProgress = hasTargetScore && game.targetScore
    ? Math.min((leader?.totalScore ?? 0) / game.targetScore, 1)
    : 0;

  return (
    <View style={[styles.container]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 8, backgroundColor: session.gameColor + "18" },
        ]}
      >
        <View style={styles.headerTop}>
          {/* Neumorphic back button */}
          <NeuIconWell color="#150428" size={40} borderRadius={13}>
            <Pressable onPress={() => router.back()} style={styles.iconBtnPressable}>
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
            </Pressable>
          </NeuIconWell>

          <View style={styles.headerCenter}>
            <Text style={styles.headerGame}>{game.name}</Text>
            <Text style={styles.headerRound}>Round {session.currentRound}</Text>
          </View>

          {/* Clay End button — danger pink */}
          <View style={[styles.endBtnShadow, { borderRadius: 14 }]}>
            <Pressable onPress={handleEndGame} style={[styles.endBtnClay, { borderRadius: 14 }]}>
              <View style={styles.endBtnGloss} pointerEvents="none" />
              <Text style={styles.endBtnText}>End</Text>
            </Pressable>
          </View>
        </View>

        {/* Info strip — neumorphic trench chips */}
        <View style={styles.infoStrip}>
          <Pressable onPress={toggleDirection}>
            <NeuTrench color="#150428" borderRadius={10} padding={6} style={styles.infoChip}>
              <Ionicons name={session.direction === "CW" ? "refresh" : "refresh-outline"} size={11} color={session.gameColor} />
              <Text style={[styles.infoChipText, { color: session.gameColor }]}>{session.direction}</Text>
            </NeuTrench>
          </Pressable>

          <NeuTrench color="#150428" borderRadius={10} padding={6} style={styles.infoChip}>
            <Ionicons name="person-outline" size={11} color="rgba(255,255,255,0.5)" />
            <Text style={styles.infoChipText}>{dealer?.name ?? "—"} deals</Text>
          </NeuTrench>

          {hasTargetScore && (
            <NeuTrench color="#150428" borderRadius={10} padding={6} style={styles.infoChip}>
              <Ionicons name="flag-outline" size={11} color="#FFB800" />
              <Text style={[styles.infoChipText, { color: "#FFB800" }]}>Goal: {game.targetScore?.toLocaleString()}</Text>
            </NeuTrench>
          )}
        </View>

        {/* Neumorphic progress track */}
        {hasTargetScore && game.targetScore && (
          <NeuTrench color="#150428" borderRadius={8} padding={0} style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${leaderProgress * 100}%` as any, backgroundColor: session.gameColor, borderRadius: 8 }]}
            />
          </NeuTrench>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.playersSection}>
          {sortedPlayers.map((player, i) => (
            <PlayerScoreRow
              key={player.id}
              player={player}
              rank={i + 1}
              isDealer={player.id === dealer?.id}
              roundScore={recentRoundScores[player.id]}
              showRoundScore={session.currentRound > 1}
            />
          ))}
        </View>

        {session.currentRound > 1 && (
          <Pressable onPress={() => setShowHistory(!showHistory)}>
            <NeuTrench color="#150428" borderRadius={14} padding={12} style={styles.historyToggle}>
              <Text style={styles.historyToggleText}>
                {showHistory ? "Hide" : "Show"} Score History
              </Text>
              <Ionicons
                name={showHistory ? "chevron-up" : "chevron-down"}
                size={14}
                color="rgba(255,255,255,0.4)"
              />
            </NeuTrench>
          </Pressable>
        )}

        {showHistory && session.currentRound > 1 && (
          <NeuTrench color="#150428" borderRadius={16} padding={0} style={styles.historyTable}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyHeaderText}>Player</Text>
              {Array.from({ length: session.currentRound - 1 }).map((_, r) => (
                <Text key={r} style={styles.historyHeaderRound}>R{r + 1}</Text>
              ))}
            </View>
            {session.players.map((p) => (
              <View key={p.id} style={styles.historyRow}>
                <View style={styles.historyNameCell}>
                  <View style={[styles.historyDot, { backgroundColor: p.color }]} />
                  <Text style={styles.historyName} numberOfLines={1}>{p.name}</Text>
                </View>
                {p.scores.map((s, i) => (
                  <Text key={i} style={[styles.historyScore, { color: p.color }]}>
                    {s >= 0 ? "+" : ""}{s}
                  </Text>
                ))}
              </View>
            ))}
          </NeuTrench>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <PolymerButton
          label={`Enter Round ${session.currentRound} Scores`}
          onPress={() => setShowScoreModal(true)}
          color="#00F5A0"
          textColor="#1A0533"
          size="lg"
          style={{ flex: 1 }}
          icon={<Feather name="plus" size={16} color="#1A0533" />}
        />
      </View>

      <ScoreInputModal
        visible={showScoreModal}
        players={session.players}
        game={game}
        round={session.currentRound}
        onSubmit={handleSubmitScores}
        onClose={() => setShowScoreModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0533",
  },
  errContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A0533",
    gap: 16,
  },
  errText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  errBtn: {
    backgroundColor: "#00F5A0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A0533",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBtnPressable: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerGame: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  headerRound: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  // Clay End button
  endBtnShadow: {
    shadowColor: "#FF2D78",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  endBtnClay: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#FF2D78",
    overflow: "hidden",
    position: "relative",
  },
  endBtnGloss: {
    position: "absolute",
    top: 2,
    left: 5,
    width: "50%",
    height: "55%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomRightRadius: 20,
  },
  endBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
    zIndex: 2,
  },
  // Neumorphic info chips
  infoStrip: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  // Neumorphic progress track
  progressTrack: {
    height: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressFill: {
    height: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  playersSection: {
    gap: 2,
    marginBottom: 16,
  },
  historyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  historyToggleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
    textAlign: "center",
  },
  historyTable: {
    overflow: "hidden",
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  historyHeaderText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyHeaderRound: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    width: 36,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  historyNameCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  historyScore: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    width: 36,
    textAlign: "center",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(26,5,51,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
});
