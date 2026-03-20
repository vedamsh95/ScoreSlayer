import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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
    let score = 0;
    score += stats.cards1to12 * 5;
    score += stats.skipBoCards * 25;
    return score;
  }, [stats]);

  useEffect(() => {
    onUpdate(totalScore, [], { stats });
  }, [totalScore, stats, onUpdate]);

  const updateStat = (key: string, delta: number) => {
    setStats(prev => ({
      ...prev,
      [key]: Math.max(0, (prev as any)[key] + delta)
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderStepper = (label: string, key: string, value: number, pts: number, color: string) => (
    <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardPts}>{pts} pts each</Text>
      </View>
      <View style={styles.stepper}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#00D2FF" borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color="#1A0533" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={24} style={styles.summary}>
        <Text style={styles.summaryLabel}>Hand Penalty</Text>
        <Text style={[styles.summaryValue, { color: player.color }]}>{totalScore}</Text>
      </NeuTrench>

      <View style={styles.grid}>
        {renderStepper("Numbers (1-12)", "cards1to12", stats.cards1to12, 5, "#E67E22")}
        {renderStepper("Skip-Bo Wilds", "skipBoCards", stats.skipBoCards, 25, "#00D2FF")}
      </View>

      <View style={styles.tipBox}>
        <NeuIconWell color="rgba(255,255,255,0.1)" size={32} borderRadius={10}>
          <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
        </NeuIconWell>
        <Text style={styles.tipText}>Enter cards remaining in your hand at round end.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: { alignItems: "center", marginBottom: 24 },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  grid: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center" },
  cardInfo: { flex: 1 },
  cardLabel: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF", textTransform: "uppercase" },
  cardPts: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: { width: 36, height: 36 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 22, color: "#FFF", minWidth: 28, textAlign: "center" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 28, padding: 12 },
  tipText: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
});
