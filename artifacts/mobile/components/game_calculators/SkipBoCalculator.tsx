import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";

interface SkipBoCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
}

export function SkipBoCalculator({ player, game, onUpdate, initialStats }: SkipBoCalculatorProps) {
  const [stats, setStats] = useState({
    cards1to12: initialStats?.cards1to12 || 0, // 5 pts ea
    skipBoCards: initialStats?.skipBoCards || 0, // 25 pts ea
    isWinner: initialStats?.isWinner || false,
  });

  const totalScore = useMemo(() => {
    // Only the winner scores points in some variations, 
    // but usually, everyone scores points and the winner gets the sum.
    // However, for this app, we'll follow the rule where you enter the cards in your hand.
    let score = 0;
    score += stats.cards1to12 * 5;
    score += stats.skipBoCards * 25;
    return score;
  }, [stats]);

  useEffect(() => {
    onUpdate(totalScore, [], { stats });
  }, [totalScore]);

  const updateStat = (key: string, delta: number) => {
    setStats(prev => ({
      ...prev,
      [key]: Math.max(0, (prev as any)[key] + delta)
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderStepper = (label: string, key: string, value: number, pts: number, color: string) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardPts}>{pts} pts ea</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable onPress={() => updateStat(key, -1)} style={styles.stepBtn}>
          <Ionicons name="remove" size={20} color="rgba(255,255,255,0.4)" />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable onPress={() => updateStat(key, 1)} style={styles.stepBtn}>
          <Ionicons name="add" size={20} color={color} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Hand Penalty</Text>
        <Text style={styles.summaryValue}>{totalScore}</Text>
      </View>

      <View style={styles.grid}>
        {renderStepper("Numbers (1-12)", "cards1to12", stats.cards1to12, 5, "#E67E22")}
        {renderStepper("Skip-Bo Wilds", "skipBoCards", stats.skipBoCards, 25, "#F1C40F")}
      </View>

      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.4)" />
        <Text style={styles.tipText}>Enter the cards remaining in your hand.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: { backgroundColor: "rgba(0,245,160,0.05)", borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "rgba(0,245,160,0.2)" },
  summaryLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#00F5A0", textTransform: "uppercase", marginBottom: 4 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 44, color: "#FFF" },
  grid: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardInfo: { flex: 1 },
  cardLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  cardPts: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF", minWidth: 28, textAlign: "center" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20, padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)" },
  tipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.3)" },
});
