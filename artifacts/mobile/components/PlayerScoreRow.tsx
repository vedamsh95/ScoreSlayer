import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Player } from "@/context/GameContext";

interface PlayerScoreRowProps {
  player: Player;
  rank: number;
  isDealer?: boolean;
  roundScore?: number;
  showRoundScore?: boolean;
}

export function PlayerScoreRow({
  player,
  rank,
  isDealer = false,
  roundScore,
  showRoundScore = false,
}: PlayerScoreRowProps) {
  const rankEmojis = ["", "🥇", "🥈", "🥉"];

  return (
    <View style={[styles.row, rank === 1 && styles.rowLeader]}>
      <View style={[styles.rankBadge, { backgroundColor: player.color + "33" }]}>
        <Text style={[styles.rankText, { color: player.color }]}>
          #{rank}
        </Text>
      </View>

      <View style={[styles.colorDot, { backgroundColor: player.color }]} />

      <View style={styles.nameSection}>
        <Text style={styles.playerName} numberOfLines={1}>
          {player.name}
          {isDealer ? " 🃏" : ""}
        </Text>
        {player.currentPhase !== undefined && (
          <Text style={styles.phaseText}>Phase {player.currentPhase}</Text>
        )}
      </View>

      <View style={styles.scoreSection}>
        {showRoundScore && roundScore !== undefined && (
          <View style={[styles.roundScorePill, { backgroundColor: player.color + "33" }]}>
            <Text style={[styles.roundScoreText, { color: player.color }]}>
              {roundScore >= 0 ? "+" : ""}{roundScore}
            </Text>
          </View>
        )}
        <Text style={[styles.totalScore, rank === 1 && styles.totalScoreLeader]}>
          {player.totalScore.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function AnimatedScoreItem({ player, rank, isDealer, roundScore, showRoundScore }: PlayerScoreRowProps) {
  return (
    <PlayerScoreRow
      player={player}
      rank={rank}
      isDealer={isDealer}
      roundScore={roundScore}
      showRoundScore={showRoundScore}
    />
  );
}

export { AnimatedScoreItem };

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowLeader: {
    backgroundColor: "rgba(0,245,160,0.08)",
    borderColor: "rgba(0,245,160,0.25)",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  nameSection: {
    flex: 1,
  },
  playerName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  phaseText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roundScorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roundScoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  totalScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    minWidth: 50,
    textAlign: "right",
  },
  totalScoreLeader: {
    color: "#00F5A0",
  },
});
