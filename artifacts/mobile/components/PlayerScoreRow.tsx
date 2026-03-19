import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Player } from "@/context/GameContext";
import { NeuTrench } from "./PolymerCard";

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
  const isLeader = rank === 1;

  return (
    // Each row is a clay card colored by player, with neumorphic rank badge + score well
    <View style={[styles.cardShadow, { borderRadius: 20 }, isLeader && styles.leaderShadow]}>
      <View
        style={[
          styles.cardBody,
          {
            backgroundColor: isLeader
              ? player.color + "28"
              : "rgba(42,10,96,0.8)",
            borderRadius: 20,
            borderWidth: isLeader ? 1.5 : 1,
            borderColor: isLeader ? player.color + "55" : "rgba(255,255,255,0.05)",
          },
        ]}
      >
        {isLeader && (
          <>
            <View style={[styles.leaderGloss, { borderRadius: 18 }]} pointerEvents="none" />
            <View style={[styles.leaderInnerShadow, { borderRadius: 20 }]} pointerEvents="none" />
          </>
        )}

        {/* Neumorphic rank well */}
        <NeuTrench
          color="#150428"
          borderRadius={12}
          padding={0}
          style={[styles.rankWell, { width: 38, height: 38 }]}
        >
          <View style={styles.rankContent}>
            <Text style={[styles.rankText, { color: player.color }]}>#{rank}</Text>
          </View>
        </NeuTrench>

        {/* Color dot */}
        <View style={[styles.colorDot, { backgroundColor: player.color }]} />

        <View style={styles.nameSection}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.name}
            {isDealer ? "  🃏" : ""}
          </Text>
          {player.currentPhase !== undefined && (
            <Text style={styles.phaseText}>Phase {player.currentPhase}</Text>
          )}
        </View>

        {/* Score display — neumorphic well for the number */}
        <View style={styles.scoreArea}>
          {showRoundScore && roundScore !== undefined && (
            <View style={[styles.deltaChip, { backgroundColor: player.color + "22", borderColor: player.color + "44" }]}>
              <Text style={[styles.deltaText, { color: player.color }]}>
                {roundScore >= 0 ? "+" : ""}{roundScore}
              </Text>
            </View>
          )}

          <NeuTrench
            color="#150428"
            borderRadius={14}
            padding={0}
            style={styles.scoreWell}
          >
            <Text style={[styles.totalScore, isLeader && { color: player.color }]}>
              {player.totalScore.toLocaleString()}
            </Text>
          </NeuTrench>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  leaderShadow: {
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 9,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    overflow: "hidden",
    position: "relative",
  },
  leaderGloss: {
    position: "absolute",
    top: 3,
    left: 6,
    width: "45%",
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 30,
    zIndex: 1,
    pointerEvents: "none",
  },
  leaderInnerShadow: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "40%",
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderTopLeftRadius: 30,
    zIndex: 1,
    pointerEvents: "none",
  },
  rankWell: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  rankContent: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  nameSection: {
    flex: 1,
    zIndex: 2,
  },
  playerName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  phaseText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  scoreArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 2,
  },
  deltaChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  deltaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  scoreWell: {
    minWidth: 64,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  totalScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    minWidth: 50,
  },
});
