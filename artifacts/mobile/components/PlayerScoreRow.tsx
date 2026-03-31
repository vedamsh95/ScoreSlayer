import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSpring,
  interpolateColor
} from "react-native-reanimated";
import { Player } from "@/context/GameContext";
import { PolymerCard, NeuTrench } from "./PolymerCard";
import { RoundHistoryChip } from "./RoundHistoryChip";
import { COLORS } from "../constants/DesignTokens";

interface PlayerScoreRowProps {
  player: Player;
  rank?: number;
  isLeader?: boolean;
  isDealer?: boolean;
  isPhase10?: boolean;
  showBags?: boolean;
  roundScore?: number;
  showRoundScore?: boolean;
  progress?: number; // 0-1 for vertical progress bar
  tableMode?: boolean; // compact cell vs full card
  onEditRound?: (roundIndex: number) => void;
  onRename?: () => void;
}

export function PlayerScoreRow({
  player,
  rank,
  isLeader = false,
  isDealer = false,
  isPhase10 = false,
  showBags = false,
  roundScore,
  showRoundScore = false,
  progress = 0,
  tableMode = false,
  onEditRound,
  onRename,
}: PlayerScoreRowProps) {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.1);

  useEffect(() => {
    if (isLeader) {
      glowScale.value = withRepeat(withTiming(1.05, { duration: 1500 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.25, { duration: 1500 }), -1, true);
    } else {
      glowScale.value = 1;
      glowOpacity.value = 0.1;
    }
  }, [isLeader]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
    backgroundColor: player.color,
  }));

  // Use a transparent container to integrate with the parent 'Clay' trench
  const containerColor = "rgba(255,255,255,0.02)"; 
  const containerBorderRadius = 18;

  const history = useMemo(() => {
    return player.scores.map((s, idx) => ({
      score: s,
      isPhase: !!player.clearedHistory[idx],
      bid: player.bids?.[idx],
      won: player.tricksWon?.[idx],
    }));
  }, [player.scores, player.clearedHistory, player.bids, player.tricksWon]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.rowBody}>
        <View style={styles.barContent}>
          {/* Section 1: Identity & Rank */}
          <Pressable onPress={onRename} style={styles.identitySection}>
            <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={10} padding={0} style={styles.rankWell}>
              <Text style={[styles.rankText, { color: rank === 1 ? COLORS.accent : COLORS.muted }]}>
                {rank}
              </Text>
            </NeuTrench>
            <View style={styles.nameBadgeBlock}>
              <View style={styles.nameRow}>
                <Text style={[styles.playerName, { color: player.color }]} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
              <View style={styles.miniBadges}>
                {isLeader && (
                  <View style={[styles.miniStatusBadge, { backgroundColor: player.color }]}>
                    <Text style={[styles.miniStatusText, { color: "#1A0533" }]}>TOP</Text>
                  </View>
                )}
                {isPhase10 && player.currentPhase !== undefined && (
                  <Text style={styles.phaseSubtitle}>Phase {player.currentPhase}</Text>
                )}
              </View>
            </View>
          </Pressable>

          {/* Section 2: History Trench */}
          <View style={styles.historySection}>
            <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={12} padding={4} style={styles.historyTrench}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.historyScrollContent}
              >
                {history.length > 0 ? (
                  history.slice(-5).map((h, i) => {
                    const actualIdx = i + Math.max(0, history.length - 5);
                    return (
                      <RoundHistoryChip 
                        key={i} 
                        score={h.score} 
                        label={`R${actualIdx + 1}`}
                        color={h.isPhase ? COLORS.primary : "rgba(255,255,255,0.6)"}
                        style={styles.microChip}
                        onPress={() => onEditRound?.(actualIdx)}
                      />
                    );
                  })
                ) : (
                  <Text style={styles.noHistoryText}>No rounds yet</Text>
                )}
              </ScrollView>
            </NeuTrench>
          </View>

          {/* Section 3: Victory Well */}
          <View style={styles.victorySection}>
            <NeuTrench
              color="rgba(0,0,0,0.35)"
              borderRadius={12}
              padding={0}
              style={styles.totalWell}
            >
              <Text style={[styles.totalText, { color: player.color }]}>
                {player.totalScore.toLocaleString()}
              </Text>
            </NeuTrench>
          </View>
        </View>

        {/* Subtle Progress Underline */}
        {progress > 0 && (
          <View style={styles.progressUnderlineTrack}>
            <View 
              style={[
                styles.progressUnderlineFill, 
                { width: `${progress * 100}%` as any, backgroundColor: player.color }
              ]} 
              onLayout={() => {}}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 4,
    position: "relative",
  },
  leaderGlow: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 22,
    zIndex: -1,
  },
  rowBody: {
    height: 72,
    justifyContent: "center",
    borderRadius: 18,
    paddingHorizontal: 8,
  },
  barContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identitySection: {
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
    gap: 10,
  },
  rankWell: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  nameBadgeBlock: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playerName: {
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "#FFFFFF",
    maxWidth: "100%",
    letterSpacing: 0.5,
    paddingTop: 3,
  },
  dealerEmoji: {
    fontSize: 12,
  },
  miniBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniStatusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniStatusText: {
    fontFamily: "Inter_900Black",
    fontSize: 7,
    letterSpacing: 0.5,
  },
  microInfoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 8,
    color: "rgba(255,255,255,0.35)",
  },
  phaseSubtitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    marginTop: -2,
  },
  historySection: {
    width: "50%",
    paddingHorizontal: 4,
  },
  historyTrench: {
    height: 48,
    justifyContent: "center",
  },
  historyScrollContent: {
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 6,
  },
  microChip: {
    height: 34,
    minWidth: 40,
    paddingHorizontal: 6,
  },
  noHistoryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: "rgba(255,255,255,0.15)",
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
  },
  victorySection: {
    width: "20%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  deltaText: {
    fontFamily: "Inter_900Black",
    fontSize: 11,
  },
  totalWell: {
    minWidth: 60,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 3,
  },
  progressUnderlineTrack: {
    position: "absolute",
    bottom: 0,
    left: 18,
    right: 18,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressUnderlineFill: {
    height: "100%",
    borderRadius: 1,
  },
});
