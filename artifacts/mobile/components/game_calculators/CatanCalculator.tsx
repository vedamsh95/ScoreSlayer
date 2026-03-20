import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface CatanCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
}

export function CatanCalculator({ player, game, onUpdate, initialStats }: CatanCalculatorProps) {
  const [stats, setStats] = useState({
    settlements: initialStats?.settlements || 0,
    cities: initialStats?.cities || 0,
    vpCards: initialStats?.vpCards || 0,
    longestRoad: initialStats?.longestRoad || false,
    largestArmy: initialStats?.largestArmy || false,
    harborMaster: initialStats?.harborMaster || false,
  });

  const hasHarborMaster = useMemo(() => {
    return game.houseRules.find(r => r.ruleId === "harbor_master")?.currentValue === 1;
  }, [game.houseRules]);

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.settlements * 1;
    score += stats.cities * 2;
    score += stats.vpCards * 1;
    if (stats.longestRoad) score += 2;
    if (stats.largestArmy) score += 2;
    if (stats.harborMaster) score += 2;
    return score;
  }, [stats]);

  useEffect(() => {
    onUpdate(totalScore, [], { stats });
  }, [totalScore, stats, onUpdate]);

  const updateStat = (key: string, delta: number | boolean) => {
    setStats(prev => {
      const next = { ...prev };
      if (typeof delta === "boolean") {
        (next as any)[key] = delta;
      } else {
        (next as any)[key] = Math.max(0, (prev as any)[key] + delta);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderStepper = (label: string, key: string, value: number, icon: any, color: string) => (
    <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.stepperCard}>
      <NeuIconWell color={color + "20"} size={44} borderRadius={22}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </NeuIconWell>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#150428" borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="remove" size={20} color="rgba(255,255,255,0.6)" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="add" size={20} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  const renderToggle = (label: string, key: string, active: boolean, icon: any, color: string) => (
    <NeuButton 
      onPress={() => updateStat(key, !active)}
      color={active ? color : "#150428"}
      borderRadius={16}
      style={styles.toggleCard}
    >
      <View style={styles.toggleInner}>
        <MaterialCommunityIcons name={icon} size={28} color={active ? "#1A0533" : "rgba(255,255,255,0.2)"} />
        <View style={styles.toggleText}>
          <Text style={[styles.toggleLabel, { color: active ? "#1A0533" : "rgba(255,255,255,0.4)" }]}>{label}</Text>
          <Text style={[styles.togglePoints, { color: active ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>+2 VP</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: active ? "#1A0533" : "rgba(255,255,255,0.05)" }]} />
      </View>
    </NeuButton>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Foundations</Text>
      <View style={styles.row}>
        {renderStepper("Settlements", "settlements", stats.settlements, "home", "#E67E22")}
        {renderStepper("Cities", "cities", stats.cities, "office-building", "#3498DB")}
      </View>
      <View style={styles.row}>
        {renderStepper("VP Cards", "vpCards", stats.vpCards, "cards-playing-outline", "#9B59B6")}
        <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.scoreSummary}>
          <Text style={styles.summaryLabel}>Total Score</Text>
          <Text style={[styles.summaryValue, { color: player.color }]}>{totalScore}</Text>
        </NeuTrench>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Achievements</Text>
      <View style={styles.toggleGrid}>
        {renderToggle("Longest Road", "longestRoad", stats.longestRoad, "map-marker-distance", "#F1C40F")}
        {renderToggle("Largest Army", "largestArmy", stats.largestArmy, "sword-cross", "#E74C3C")}
        {hasHarborMaster && renderToggle("Harbor Master", "harborMaster", stats.harborMaster, "anchor", "#00D2FF")}
      </View>

      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.2)" />
        <Text style={styles.tipText}>Target score is {game.targetScore} VP.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stepperCard: { flex: 1, alignItems: "center" },
  stepperLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF", minWidth: 24, textAlign: "center" },
  scoreSummary: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 2 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 36 },
  toggleGrid: { gap: 10 },
  toggleCard: { width: "100%", height: 64 },
  toggleInner: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 16 },
  toggleText: { flex: 1, marginLeft: 16 },
  toggleLabel: { fontFamily: "Inter_900Black", fontSize: 15 },
  togglePoints: { fontFamily: "Inter_800ExtraBold", fontSize: 11 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24, padding: 12, opacity: 0.5 },
  tipText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)" },
});
