import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Player } from "@/context/GameContext";
import { PolymerCard, NeuTrench } from "./PolymerCard";

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
}: PlayerScoreRowProps) {
  const Container = tableMode ? NeuTrench : PolymerCard;
  const containerColor = tableMode ? "rgba(255,255,255,0.05)" : player.color + "88";
  const containerStyle = tableMode 
    ? [styles.tableCell, { borderColor: player.color, borderLeftWidth: 3, borderRightWidth: 1.5 }]
    : [styles.cardContainer, { borderColor: player.color, borderWidth: 2 }];
  const containerPadding = tableMode ? 8 : 12;
  const containerBorderRadius = tableMode ? 14 : 24;

  return (
    <Container 
      color={containerColor}
      borderRadius={containerBorderRadius}
      padding={containerPadding}
      style={containerStyle}
    >
        <View style={[styles.rowInner, tableMode && styles.tableInner]}>
          {/* Rank Dot/Well */}
          {rank !== undefined ? (
            <NeuTrench
              color="rgba(0,0,0,0.25)"
              borderRadius={tableMode ? 8 : 14}
              padding={0}
              style={tableMode ? styles.tableRankDot : styles.rankWell}
            >
              <Text style={[styles.rankText, { color: rank === 1 ? "#FFB800" : "rgba(255,255,255,0.6)", fontSize: tableMode ? 11 : 14 }]}>
                #{rank}
              </Text>
            </NeuTrench>
          ) : null}

          <View style={tableMode ? styles.tableNameSection : styles.nameSection}>
            <Text style={[styles.playerName, tableMode && styles.tablePlayerName]} numberOfLines={1}>
              {player.name}
              {isDealer ? " 🃏" : ""}
            </Text>
            <View style={styles.badgesRow}>
              {isPhase10 && player.currentPhase !== undefined && (
                <Text style={[styles.phaseText, tableMode && { fontSize: 9 }]}>Phase {player.currentPhase}</Text>
              )}
              {showBags && player.totalBags !== undefined && player.totalBags > 0 && (
                <View style={[styles.bagBadge, { backgroundColor: player.color + "33" }]}>
                  <Text style={[styles.bagText, tableMode && { fontSize: 8 }]}>{player.totalBags} Bags</Text>
                </View>
              )}
            </View>
          </View>

          <View style={tableMode ? styles.tableScoreArea : styles.scoreArea}>
{showRoundScore && roundScore !== undefined && (
              <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={tableMode ? 8 : 10} padding={tableMode ? 4 : 6} style={tableMode ? [styles.deltaChip, { minWidth: 32 }] : styles.deltaChip}>
                <Text style={[styles.deltaText, { color: roundScore > 0 ? "#00F5A0" : roundScore < 0 ? "#FF2D78" : "#FFFFFF", fontSize: tableMode ? 10 : 12 }]}>
                  {roundScore >= 0 ? "+" : ""}{roundScore}
                </Text>
              </NeuTrench>
            )}

            {/* Total Score Well */}
            <View style={tableMode ? styles.tableScoreWellContainer : {}}>
              <NeuTrench
                color="rgba(0,0,0,0.25)"
                borderRadius={tableMode ? 12 : 16}
                padding={0}
                style={tableMode ? styles.tableScoreWell : styles.scoreWell}
              >
                <Text style={[styles.totalScore, tableMode && styles.tableTotalScore]}>
                  {player.totalScore.toLocaleString()}
                </Text>
              </NeuTrench>
              
              {/* Progress Bar */}
              {tableMode && progress > 0 && (
                <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={6} padding={0} style={styles.progressBarContainer}>
                  <View style={[styles.progressFill, { height: `${progress * 100}%`, backgroundColor: player.color }]} />
                </NeuTrench>
              )}
            </View>
          </View>
        </View>
    </Container>
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
  tableInner: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-start",
  },
  tableCell: {
    height: 84,
    flexDirection: "row",
    borderColor: "#FFFFFF20",
    borderBottomWidth: 1,
  },
  rankWell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tableRankDot: {
    width: 28,
    height: 28,
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
  tableNameSection: {
    flex: 1,
    marginTop: 2,
  },
  playerName: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  tablePlayerName: {
    fontSize: 14,
  },
  phaseText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
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
  tableScoreArea: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
    marginTop: 2,
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
  tableScoreWellContainer: {
    alignItems: "flex-end",
  },
  tableScoreWell: {
    width: 52,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tableTotalScore: {
    fontSize: 16,
  },
  totalScore: {
    fontFamily: "Inter_900Black",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
  },
  progressBarContainer: {
    width: 52,
    height: 20,
    marginTop: 2,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    borderRadius: 4,
  },
});
