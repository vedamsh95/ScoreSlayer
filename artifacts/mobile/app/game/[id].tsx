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
import { PolymerCard, NeuTrench, NeuButton, BrandButton, NeuIconWell, PolymerAlert } from "@/components/PolymerCard";
import { Player } from "@/context/GameContext";
import { GameToolsModal } from "@/components/GameToolsModal";
import { AnalysisModal } from "@/components/AnalysisModal";
import { AddPlayerModal } from "@/components/AddPlayerModal";

function sortPlayers(players: Player[], game?: GameDefinition | null): Player[] {
  if (!game) return players;
  const isPhase10 = game.id.startsWith("phase10") || game.parentId === "phase10";

  return [...players].sort((a, b) => {
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

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    getSession,
    addRoundScores,
    updateRoundScores,
    deleteRound,
    endSession,
    updateSession,
    addPlayerMidGame,
  } = useGame();

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Default to true
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [showEndAlert, setShowEndAlert] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

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
    setShowEndAlert(true);
  }, []);

  const confirmEndGame = () => {
    if (!id) return;
    endSession(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/results/[id]", params: { id } });
  };

  const handleResetRound = useCallback(() => {
    setShowResetAlert(true);
  }, []);

  const confirmResetRound = () => {
    if (!id || !session || session.currentRound <= 1) return;
    deleteRound(id, session.currentRound - 2);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResetAlert(false);
  };

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

  const handleAddPlayer = useCallback(
    (playerName: string, catchUpScore: number): boolean => {
      if (!id) return false;
      const ok = addPlayerMidGame(id, playerName, catchUpScore);
      if (!ok) {
        Alert.alert(
          "Could not add player",
          "Check the name, player limit, or that the game has not ended."
        );
      }
      return ok;
    },
    [id, addPlayerMidGame]
  );

  if (!session || !game) return null;

  const activeSession = session;
  const activeGame = game;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const dealer = activeSession.dealerIndex >= 0 ? activeSession.players[activeSession.dealerIndex] : null;

  const recentRoundScores: Record<string, number> = {};
  activeSession.players.forEach((p) => {
    const last = p.scores[p.scores.length - 1];
    if (last !== undefined) recentRoundScores[p.id] = last;
  });

  const hasTargetScore = game.targetScore !== undefined;
  const canAddPlayer =
    !session.isComplete && session.players.length < game.maxPlayers;
  const leader = sortedPlayers[0];
  const leaderProgress = hasTargetScore && game.targetScore
    ? Math.min((leader?.totalScore ?? 0) / game.targetScore, 1)
    : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <PolymerCard color={session.gameColor} borderRadius={24} padding={16} style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <BrandButton 
                style={{ width: 44, height: 44 }}
                borderRadius={14} 
                color="#8B5CF6"
                highlight="#A78BFA"
                shadow="#6D28D9"
                glowColor="rgba(139, 92, 246, 0.4)"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </BrandButton>

              <View style={styles.headerActionRow}>

                <BrandButton 
                  style={{ width: 40, height: 40, marginLeft: 8 }}
                  borderRadius={12} 
                  color="#00F5A0"
                  highlight="#54FFC9"
                  shadow="#00D289"
                  glowColor="rgba(0, 245, 160, 0.4)"
                  onPress={() => { setShowToolsModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} 
                >
                  <MaterialCommunityIcons name="dice-5-outline" size={22} color="#FFFFFF" />
                </BrandButton>

                <BrandButton 
                  style={{ width: 40, height: 40, marginLeft: 8 }}
                  borderRadius={12} 
                  color="#FF2D78"
                  highlight="#FF6B9E"
                  shadow="#E00057"
                  glowColor="rgba(255, 45, 120, 0.4)"
                  onPress={() => { setShowAnalysisModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }} 
                >
                  <MaterialCommunityIcons name="fire" size={20} color="#FFFFFF" />
                </BrandButton>

              </View>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerGame} numberOfLines={1}>{game.name}</Text>
              {session.gameId === "five_crowns" ? (
                <NeuTrench color="rgba(255,255,255,0.15)" borderRadius={8} padding={2} style={styles.fiveCrownsBadge}>
                  <Ionicons name="flash" size={10} color="#FFB800" />
                  <Text style={styles.wildText}>Wilds: {FIVE_CROWNS_WILDS[Math.min(session.currentRound - 1, 10)]}</Text>
                </NeuTrench>
              ) : (
                <Text style={styles.headerRound}>Round {session.currentRound}</Text>
              )}
            </View>

            <View style={styles.headerRight}>
              <BrandButton 
                color="#34495E"
                highlight="#5D6D7E"
                shadow="#212F3D"
                glowColor="rgba(52, 73, 94, 0.4)"
                borderRadius={14} 
                onPress={handleEndGame}
                style={{ paddingHorizontal: 20, height: 42 }}
              >
                <Text style={[styles.endBtnText, { color: "#FFFFFF" }]}>END</Text>
              </BrandButton>
            </View>
          </View>

          {/* Info strip */}
          <View style={styles.infoStrip}>
            <Pressable onPress={toggleDirection} style={{ flex: 1 }}>
              <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={12} padding={8} style={styles.infoChip}>
                <Ionicons name={session.direction === "CW" ? "refresh" : "refresh-outline"} size={14} color="#00F5A0" />
                <Text style={[styles.infoChipText, { color: "#FFFFFF" }]}>{session.direction}</Text>
              </NeuTrench>
            </Pressable>

            <View style={{ flex: 1.5 }}>
              <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={12} padding={8} style={styles.infoChip}>
                <Ionicons name="person-outline" size={14} color="#FFB800" />
                <Text style={[styles.infoChipText, { color: "#FFFFFF" }]} numberOfLines={1}>{dealer?.name ?? "—"}</Text>
              </NeuTrench>
            </View>

            {hasTargetScore && (
              <View style={{ flex: 1.5 }}>
                <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={12} padding={8} style={styles.infoChip}>
                  <Ionicons name="flag-outline" size={14} color="#FF2D78" />
                  <Text style={[styles.infoChipText, { color: "#FFFFFF" }]}>{game.targetScore?.toLocaleString()}</Text>
                </NeuTrench>
              </View>
            )}
          </View>

          {/* Progress track */}
          {hasTargetScore && game.targetScore && (
            <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={10} padding={2} style={styles.progressTrack}>
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
          <PolymerCard color="rgba(0,0,0,0.2)" borderRadius={24} padding={12} style={styles.golfHoleBar}>
            <Text style={styles.golfHoleTitle}>9-Hole Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.golfHoleStrip}>
                {Array.from({ length: Math.max(9, session.currentRound - 1) }).map((_, r) => (
                  <View key={r} style={styles.golfHoleColumn}>
                    <Text style={styles.golfHoleLabel}>H{r + 1}</Text>
                    <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={8} padding={4} style={styles.golfHoleChip}>
                      <Text style={[styles.golfHoleScore, { color: (leader?.scores[r] ?? 0) > 0 ? "#FF2D78" : "#00F5A0" }]}>
                        {leader?.scores[r] !== undefined ? leader.scores[r] : "—"}
                      </Text>
                    </NeuTrench>
                  </View>
                ))}
              </View>
            </ScrollView>
          </PolymerCard>
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
          {canAddPlayer && (
            <NeuButton
              onPress={() => setShowAddPlayerModal(true)}
              color="rgba(0,245,160,0.12)"
              borderRadius={16}
              style={styles.addPlayerRow}
            >
              <View style={styles.addPlayerRowInner}>
                <Ionicons name="person-add-outline" size={18} color="#00F5A0" />
                <Text style={styles.addPlayerRowText}>Add player mid-game</Text>
              </View>
            </NeuButton>
          )}
        </View>

        {session.currentRound > 1 && (
          <View style={{ marginBottom: 16 }}>
            <NeuButton 
              onPress={() => { setShowHistory(!showHistory); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              color="#34495E"
              borderRadius={16}
              style={styles.historyToggle}
            >
              <View style={styles.historyToggleInner}>
                <Text style={styles.historyToggleText}>
                  {showHistory ? "HIDE" : "SHOW"} SCORE HISTORY
                </Text>
                <Ionicons
                  name={showHistory ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="rgba(255,255,255,0.6)"
                />
              </View>
            </NeuButton>
            {showHistory && (
              <PolymerCard color="#1E293B" borderRadius={24} padding={0} style={styles.historyTableCard}>
                <View style={styles.stickyTableContainer}>
                  {/* Fixed Player Column */}
                  <View style={styles.fixedPlayerColumn}>
                    <View style={styles.stickyHeaderCell}>
                      <Text style={styles.stickyHeaderText}>PLAYER</Text>
                    </View>
                    {session.players.map((p) => (
                      <View key={p.id} style={styles.fixedNameCell}>
                        <View style={[styles.historyDot, { backgroundColor: p.color }]} />
                        <Text style={[styles.historyName, { color: p.color }]} numberOfLines={1}>{p.name}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Scrollable Rounds Column */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      <View style={styles.historyHeader}>
                        {Array.from({ length: session.currentRound - 1 }).map((_, r) => (
                          <BrandButton 
                            key={r} 
                            onPress={() => handleEditRound(r)} 
                            color="#2D1B4D"
                            highlight="rgba(255,255,255,0.1)"
                            shadow="rgba(0,0,0,0.3)"
                            borderRadius={12}
                            style={styles.roundLabelBtn}
                          >
                            <Text style={styles.roundLabelText}>R{r + 1}</Text>
                          </BrandButton>
                        ))}
                      </View>
                      
                      {session.players.map((p) => (
                        <View key={p.id} style={styles.historyRow}>
                          {Array.from({ length: session.currentRound - 1 }).map((_, r) => {
                            const score = p.scores[r];
                            const log = p.roundLogs[r] || [];
                            const bid = p.bids?.[r];
                            const won = p.tricksWon?.[r];
                            const isSpades = session.gameId.startsWith("spades");
                            const isPhase10 = session.gameId.startsWith("phase10");
                            const wasCleared = p.clearedHistory[r];

                            return (
                              <NeuTrench 
                                key={r} 
                                color="rgba(255,255,255,0.05)" 
                                borderRadius={14} 
                                padding={8} 
                                style={styles.historyTrenchCell}
                              >
                                <Text style={[styles.historyScore, { color: p.color }]}>
                                  {score >= 0 ? "+" : ""}{score}
                                </Text>
                                {p.roundMetadata?.[r]?.isWinner && (
                                  <Text style={{ fontSize: 10, marginTop: 2 }}>🏆 UNO</Text>
                                )}
                                {isPhase10 && wasCleared && (
                                  <Text style={[styles.historyLogText, { color: p.color, fontFamily: "Inter_900Black", fontSize: 7 }]}>
                                    ✔️ PHASE
                                  </Text>
                                )}
                                {isSpades && bid !== undefined && (
                                  <Text style={[styles.historyLogText, { color: "#FFF", opacity: 0.4 }]}>
                                    {bid}/{won}
                                  </Text>
                                )}
                                {!isSpades && !isPhase10 && log.length > 0 && (
                                  <Text style={[styles.historyLogText, { color: "#FFF", opacity: 0.4 }]}>
                                    {log.join(",")}
                                  </Text>
                                )}
                              </NeuTrench>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </PolymerCard>
            )}
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        <BrandButton
          onPress={() => setShowScoreModal(true)}
          style={{ height: 62, width: "100%" }}
        >
          <View style={styles.bottomBtnInner}>
            <Feather name={editingRoundIndex !== null ? "check" : "plus"} size={20} color="#FFFFFF" />
            <Text style={styles.brandBtnText}>
              {editingRoundIndex !== null ? "APPLY CHANGES" : `ROUND ${session.currentRound}`}
            </Text>
          </View>
        </BrandButton>
      </View>

      <ScoreInputModal
        visible={showScoreModal}
        players={session.players}
        game={game}
        customScoreRules={session.customScoreRules}
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

      <AddPlayerModal
        visible={showAddPlayerModal}
        completedRounds={Math.max(0, session.currentRound - 1)}
        onClose={() => setShowAddPlayerModal(false)}
        onAdd={handleAddPlayer}
      />

      <PolymerAlert
        visible={showEndAlert}
        title="End Game?"
        message="This will finalize all scores and crown the winner!"
        confirmText="End Game"
        type="danger"
        onConfirm={confirmEndGame}
        onCancel={() => setShowEndAlert(false)}
      />

      <PolymerAlert
        visible={showResetAlert}
        title="Reset Round?"
        message="Are you sure? This will delete the last round scores forever."
        confirmText="Delete Round"
        type="warning"
        onConfirm={confirmResetRound}
        onCancel={() => setShowResetAlert(false)}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerRight: {
    minWidth: 50,
    alignItems: "flex-end",
  },
  headerGame: {
    fontFamily: "Bungee_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: 3,
  },
  headerRound: {
    fontFamily: "Bungee_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    paddingTop: 2,
  },
  endNeuBtn: {
    paddingHorizontal: 16,
    height: 42,
    justifyContent: "center",
  },
  endBtnText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 11,
    letterSpacing: 1,
    paddingTop: 3,
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
  addPlayerRow: {
    marginTop: 8,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0,245,160,0.25)",
  },
  addPlayerRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addPlayerRowText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 13,
    color: "#00F5A0",
    letterSpacing: 0.5,
  },
  historyToggle: {
    marginBottom: 16,
    height: 48,
  },
  historyToggleInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  historyToggleText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 10,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingTop: 3,
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
    color: "#FFFFFF",
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
    fontFamily: "Inter_800ExtraBold",
    fontSize: 14,
  },

  // Sticky History Table Styles
  historyTableCard: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stickyTableContainer: {
    flexDirection: "row",
    overflow: "hidden",
  },
  fixedPlayerColumn: {
    width: 100,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRightWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },
  stickyHeaderCell: {
    height: 54,
    justifyContent: "center",
    paddingLeft: 12,
    borderBottomWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  stickyHeaderText: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
  },
  fixedNameCell: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  historyHeader: {
    flexDirection: "row",
    height: 54,
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  roundLabelBtn: {
    width: 60,
    height: 38,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  roundLabelText: {
    fontFamily: "Inter_900Black",
    fontSize: 12,
    color: "#FFFFFF",
  },
  historyRow: {
    flexDirection: "row",
    height: 70,
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  historyTrenchCell: {
    width: 60,
    height: 54,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  historyScore: {
    fontFamily: "Inter_900Black",
    fontSize: 15,
  },
  historyLogText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    marginTop: 2,
  },
  historyDot: {
    width: 4,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  historyName: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    flex: 1,
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
  brandBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
