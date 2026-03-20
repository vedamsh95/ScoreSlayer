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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";
import { getGameById, GameDefinition } from "@/constants/games";
import { PlayerScoreRow } from "@/components/PlayerScoreRow";
import { ScoreInputModal } from "@/components/ScoreInputModal";
import { PolymerCard, NeuTrench, NeuButton, NeuIconWell } from "@/components/PolymerCard";
import { Player } from "@/context/GameContext";
import { GameToolsModal } from "@/components/GameToolsModal";
import { AnalysisModal } from "@/components/AnalysisModal";

function sortPlayers(players: Player[], game?: GameDefinition | null): Player[] {
  if (!game) return players;
  const isLowestWins = game.winCondition === "lowest";
  return [...players].sort((a, b) =>
    isLowestWins
      ? a.totalScore - b.totalScore
      : b.totalScore - a.totalScore
  );
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getSession, addRoundScores, updateRoundScores, deleteRound, endSession, updateSession } = useGame();

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Default to true
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);

  const FIVE_CROWNS_WILDS = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const session = getSession(id ?? "");

  const game = useMemo(
    () => (session ? getGameById(session.gameId) : null),
    [session?.gameId]
  );

  const sortedPlayers = useMemo(
    () => (session ? sortPlayers(session.players, game) : []),
    [session, game]
  );

  const handleSubmitScores = useCallback(
    (
      scores: Record<string, number>,
      logs: Record<string, number[]>,
      cleared: Record<string, boolean>,
      bids?: Record<string, number>,
      tricksWon?: Record<string, number>,
      metadata?: Record<string, any>
    ) => {
      if (!id) return;
      if (editingRoundIndex !== null) {
        updateRoundScores(id, editingRoundIndex, scores, logs, cleared, bids, tricksWon, metadata);
        setEditingRoundIndex(null);
      } else {
        addRoundScores(id, scores, logs, cleared, bids, tricksWon, metadata);
      }
      setShowScoreModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [id, addRoundScores, updateRoundScores, editingRoundIndex]
  );

  const handleEditRound = (roundIndex: number) => {
    setEditingRoundIndex(roundIndex);
    setShowScoreModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

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

  const handleViewRules = useCallback(() => {
    if (!game) return;
    const isPhase10 = game.parentId === "phase10" || game.id.includes("phase10");
    const route = isPhase10 ? "/phase10/[variantId]" : "/uno/[variantId]";
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ 
      pathname: route as any, 
      params: { variantId: game.id, readOnly: "true" } 
    });
  }, [game]);

  const handleShuffleSeating = useCallback((shuffledPlayers: Player[]) => {
    if (!session) return;
    updateSession({
      ...session,
      players: shuffledPlayers,
    });
  }, [session, updateSession]);

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
  const dealer = session.dealerIndex >= 0 ? session.players[session.dealerIndex] : null;

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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <PolymerCard color={session.gameColor + "15"} borderRadius={24} padding={16} style={styles.headerCard}>
          <View style={styles.headerTop}>
            <NeuButton 
              size={44} 
              borderRadius={14} 
              color="#150428" 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
            </NeuButton>

            <View style={styles.headerActionRow}>
              <NeuButton 
                size={40} 
                borderRadius={12} 
                color="#150428" 
                onPress={handleViewRules} 
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="book-outline" size={20} color={session.gameColor} />
              </NeuButton>

              <NeuButton 
                size={40} 
                borderRadius={12} 
                color="#150428" 
                onPress={() => { setShowToolsModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} 
                style={{ marginLeft: 8 }}
              >
                <MaterialCommunityIcons name="dice-5-outline" size={22} color="#00F5A0" />
              </NeuButton>

              <NeuButton 
                size={40} 
                borderRadius={12} 
                color="#150428" 
                onPress={() => { setShowAnalysisModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }} 
                style={{ marginLeft: 8 }}
              >
                <MaterialCommunityIcons name="fire" size={20} color="#FF4757" />
              </NeuButton>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerGame}>{game.name}</Text>
              {session.gameId === "five_crowns" ? (
                <View style={styles.fiveCrownsBadge}>
                  <Ionicons name="flash" size={10} color="#FFB800" />
                  <Text style={styles.wildText}>Wilds: {FIVE_CROWNS_WILDS[Math.min(session.currentRound - 1, 10)]}</Text>
                </View>
              ) : (
                <Text style={styles.headerRound}>Round {session.currentRound}</Text>
              )}
            </View>

            <View style={styles.endBtnGap}>
              <NeuButton 
                color={session.gameColor} 
                borderRadius={12} 
                onPress={handleEndGame}
                style={styles.endNeuBtn}
              >
                <Text style={styles.endBtnText}>END</Text>
              </NeuButton>
            </View>
          </View>

          {/* Info strip */}
          <View style={styles.infoStrip}>
            <Pressable onPress={toggleDirection} style={{ flex: 1 }}>
              <NeuTrench color="#150428" borderRadius={12} padding={8} style={styles.infoChip}>
                <Ionicons name={session.direction === "CW" ? "refresh" : "refresh-outline"} size={14} color={session.gameColor} />
                <Text style={[styles.infoChipText, { color: session.gameColor }]}>{session.direction}</Text>
              </NeuTrench>
            </Pressable>

            <View style={{ flex: 1.5 }}>
              <NeuTrench color="#150428" borderRadius={12} padding={8} style={styles.infoChip}>
                <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.infoChipText} numberOfLines={1}>{dealer?.name ?? "—"}</Text>
              </NeuTrench>
            </View>

            {hasTargetScore && (
              <View style={{ flex: 1.5 }}>
                <NeuTrench color="#150428" borderRadius={12} padding={8} style={styles.infoChip}>
                  <Ionicons name="flag-outline" size={14} color="#FFB800" />
                  <Text style={[styles.infoChipText, { color: "#FFB800" }]}>{game.targetScore?.toLocaleString()}</Text>
                </NeuTrench>
              </View>
            )}
          </View>

          {/* Progress track */}
          {hasTargetScore && game.targetScore && (
            <NeuTrench color="#150428" borderRadius={10} padding={2} style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${leaderProgress * 100}%` as any, backgroundColor: session.gameColor, borderRadius: 8 }]}
              />
            </NeuTrench>
          )}
        </PolymerCard>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {session.gameId === "golf" && session.currentRound > 1 && (
          <View style={styles.golfHoleBar}>
            <Text style={styles.golfHoleTitle}>9-Hole Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.golfHoleStrip}>
                {Array.from({ length: Math.max(9, session.currentRound - 1) }).map((_, r) => (
                  <View key={r} style={styles.golfHoleColumn}>
                    <Text style={styles.golfHoleLabel}>H{r + 1}</Text>
                    <NeuTrench color="#150428" borderRadius={8} padding={4} style={styles.golfHoleChip}>
                      <Text style={[styles.golfHoleScore, { color: (leader?.scores[r] ?? 0) > 0 ? "#FF2D78" : "#00F5A0" }]}>
                        {leader?.scores[r] !== undefined ? leader.scores[r] : "—"}
                      </Text>
                    </NeuTrench>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.playersSection}>
          {sortedPlayers.map((player, i) => (
            <PlayerScoreRow
              key={player.id}
              player={player}
              rank={i + 1}
              isDealer={player.id === dealer?.id}
              roundScore={recentRoundScores[player.id]}
              showRoundScore={session.currentRound > 1}
              isLeader={i === 0}
              isPhase10={game.parentId === "phase10" || game.id.includes("phase10")}
              showBags={game.id.startsWith("spades")}
            />
          ))}
        </View>

        {session.currentRound > 1 && (
          <>
            <Pressable onPress={() => { setShowHistory(!showHistory); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <NeuTrench color="#150428" borderRadius={16} padding={12} style={styles.historyToggle}>
                <Text style={styles.historyToggleText}>
                  {showHistory ? "HIDE" : "SHOW"} SCORE HISTORY
                </Text>
                <Ionicons
                  name={showHistory ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="rgba(255,255,255,0.4)"
                />
              </NeuTrench>
            </Pressable>

            {showHistory && (
              <PolymerCard color="rgba(255,255,255,0.02)" borderRadius={24} padding={0} style={styles.historyTableCard}>
                <NeuTrench color="#150428" borderRadius={24} padding={0} style={styles.historyTable}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      <View style={styles.historyHeader}>
                        <Text style={[styles.historyHeaderText, { width: 100 }]}>Player</Text>
                        {Array.from({ length: session.currentRound - 1 }).map((_, r) => (
                          <Pressable key={r} onPress={() => handleEditRound(r)} style={styles.historyHeaderRoundBtn}>
                            <Text style={styles.historyHeaderRound}>R{r + 1}</Text>
                            <Feather name="edit-2" size={8} color="rgba(255,255,255,0.3)" />
                          </Pressable>
                        ))}
                      </View>
                      {session.players.map((p) => (
                        <View key={p.id} style={styles.historyRow}>
                          <View style={[styles.historyNameCell, { width: 100 }]}>
                            <View style={[styles.historyDot, { backgroundColor: p.color }]} />
                            <Text style={styles.historyName} numberOfLines={1}>{p.name}</Text>
                          </View>
                          {Array.from({ length: session.currentRound - 1 }).map((_, r) => {
                            const score = p.scores[r];
                            const log = p.roundLogs[r] || [];
                            const bid = p.bids?.[r];
                            const won = p.tricksWon?.[r];
                            const isSpades = session.gameId.startsWith("spades");

                            return (
                              <View key={r} style={styles.historyDetailCell}>
                                <Text style={[styles.historyScore, { color: p.color }]}>
                                  {score >= 0 ? "+" : ""}{score}
                                </Text>
                                {isSpades && bid !== undefined && won !== undefined && (
                                  <Text style={styles.historyLogText}>
                                    {bid} / {won}
                                  </Text>
                                )}
                                {!isSpades && log.length > 0 && (
                                  <Text style={styles.historyLogText}>
                                    ({log.join(",")})
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </NeuTrench>
              </PolymerCard>
            )}
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        <NeuButton
          borderRadius={20}
          onPress={() => setShowScoreModal(true)}
          color="#00F5A0"
          style={{ flex: 1, height: 60 }}
        >
          <View style={styles.bottomBtnInner}>
            <Feather name={editingRoundIndex !== null ? "check" : "plus"} size={20} color="#1A0533" />
            <Text style={styles.bottomBtnText}>
              {editingRoundIndex !== null ? "APPLY CHANGES" : `ROUND ${session.currentRound}`}
            </Text>
          </View>
        </NeuButton>
      </View>

      <ScoreInputModal
        visible={showScoreModal}
        players={session.players}
        game={game}
        round={editingRoundIndex !== null ? editingRoundIndex + 1 : session.currentRound}
        isEditing={editingRoundIndex !== null}
        initialLogs={editingRoundIndex !== null ? 
          session.players.reduce((acc, p) => ({ ...acc, [p.id]: p.roundLogs[editingRoundIndex] || [] }), {}) : 
          undefined}
        initialCleared={editingRoundIndex !== null ?
          session.players.reduce((acc, p) => ({ ...acc, [p.id]: !!p.clearedHistory[editingRoundIndex] }), {}) :
          undefined}
        initialBids={editingRoundIndex !== null ?
          session.players.reduce((acc, p) => ({ ...acc, [p.id]: p.bids[editingRoundIndex] ?? 0 }), {}) :
          undefined}
        initialTricksWon={editingRoundIndex !== null ?
          session.players.reduce((acc, p) => ({ ...acc, [p.id]: p.tricksWon[editingRoundIndex] ?? 0 }), {}) :
          undefined}
        onSubmit={handleSubmitScores}
        onClose={() => {
          setShowScoreModal(false);
          setEditingRoundIndex(null);
        }}
      />

      <GameToolsModal
        visible={showToolsModal}
        players={session.players}
        onShuffle={handleShuffleSeating}
        onClose={() => setShowToolsModal(false)}
      />

      <AnalysisModal 
        visible={showAnalysisModal}
        session={session}
        onClose={() => setShowAnalysisModal(false)}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerCard: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerGame: {
    fontFamily: "Inter_900Black",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerRound: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  endNeuBtn: {
    paddingHorizontal: 12,
    height: 40,
  },
  endBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 12,
    color: "#FFFFFF",
  },
  endBtnGap: {
    marginLeft: 8,
  },
  infoStrip: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  infoChipText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  progressTrack: {
    height: 12,
  },
  progressFill: {
    height: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  playersSection: {
    gap: 4,
    marginBottom: 20,
  },
  historyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    height: 44,
  },
  historyToggleText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  historyTableCard: {
    marginBottom: 24,
  },
  historyTable: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  historyHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  historyHeaderText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  historyHeaderRoundBtn: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  historyHeaderRound: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
  },
  historyRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  historyNameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  historyScore: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    textAlign: "center",
  },
  historyDetailCell: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  historyLogText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    color: "rgba(255,255,255,0.2)",
    marginTop: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingTop: 16,
    backgroundColor: "#1A0533",
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  bottomBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#1A0533",
    letterSpacing: 1,
  },
  fiveCrownsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,184,0,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  wildText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 10,
    color: "#FFB800",
    textTransform: "uppercase",
  },
  golfHoleBar: {
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  golfHoleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  golfHoleStrip: {
    flexDirection: "row",
    gap: 8,
  },
  golfHoleColumn: {
    alignItems: "center",
    gap: 4,
  },
  golfHoleLabel: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
  },
  golfHoleChip: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  golfHoleScore: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
});
