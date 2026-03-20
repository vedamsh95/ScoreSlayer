import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Player } from "@/context/GameContext";
import { PolymerCard, NeuTrench } from "./PolymerCard";

interface PlayerScoreRowProps {
  player: Player;
  rank: number;
  isLeader?: boolean;
  isDealer?: boolean;
  isPhase10?: boolean;
  showBags?: boolean;
  roundScore?: number;
  showRoundScore?: boolean;
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
}: PlayerScoreRowProps) {

  return (
    <PolymerCard 
      color={player.color + "88"} 
      borderRadius={24} 
      padding={12} 
      style={[styles.cardContainer, { borderColor: player.color, borderWidth: 2 }]}
    >
      <View style={styles.rowInner}>
        {/* Neumorphic rank well */}
        <NeuTrench
          color="rgba(0,0,0,0.25)"
          borderRadius={14}
          padding={0}
          style={styles.rankWell}
        >
          <Text style={[styles.rankText, { color: rank === 1 ? "#FFB800" : "rgba(255,255,255,0.6)" }]}>
            #{rank}
          </Text>
        </NeuTrench>

        <View style={styles.nameSection}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.name}
            {isDealer ? "  🃏" : ""}
          </Text>
          <View style={styles.badgesRow}>
            {isPhase10 && player.currentPhase !== undefined && (
              <Text style={styles.phaseText}>Phase {player.currentPhase}</Text>
            )}
            {showBags && player.totalBags !== undefined && player.totalBags > 0 && (
              <View style={[styles.bagBadge, { backgroundColor: player.color + "33" }]}>
                <Text style={[styles.bagText, { color: player.color }]}>{player.totalBags} Bags</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.scoreArea}>
          {showRoundScore && roundScore !== undefined && (
            <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={10} padding={6} style={styles.deltaChip}>
            <Text style={[styles.deltaText, { color: roundScore > 0 ? "#00F5A0" : roundScore < 0 ? "#FF2D78" : "#FFFFFF" }]}>
              {roundScore >= 0 ? "+" : ""}{roundScore}
            </Text>
          </NeuTrench>
          )}

          <NeuTrench
            color="rgba(0,0,0,0.25)"
            borderRadius={16}
            padding={0}
            style={styles.scoreWell}
          >
            <Text style={[styles.totalScore, { color: "#FFFFFF" }]}>
              {player.totalScore.toLocaleString()}
            </Text>
          </NeuTrench>
        </View>
      </View>
    </PolymerCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankWell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 14,
  },
  nameSection: {
    flex: 1,
  },
  playerName: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  phaseText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  bagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  bagText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deltaChip: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deltaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  scoreWell: {
    minWidth: 70,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  totalScore: {
    fontFamily: "Inter_900Black",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
