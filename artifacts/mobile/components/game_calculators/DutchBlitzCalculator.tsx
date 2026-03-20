import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";

interface DutchBlitzCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
}

export function DutchBlitzCalculator({ player, game, onUpdate, initialStats }: DutchBlitzCalculatorProps) {
  const [stats, setStats] = useState({
    dutchPile: initialStats?.dutchPile || 0, // +2 each
    blitzPile: initialStats?.blitzPile || 0,  // -1 each
  });

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.dutchPile * 2;
    score -= stats.blitzPile * 1;
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.mainArea}>
        {/* Dutch Pile - The BIG ONE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color="#00F5A0" />
            <Text style={styles.sectionTitle}>Dutch Pile (+2)</Text>
          </View>
          <View style={styles.hugeStepper}>
            <Pressable onPress={() => updateStat("dutchPile", -1)} style={styles.hugeBtn}>
              <Ionicons name="remove" size={32} color="rgba(255,255,255,0.4)" />
            </Pressable>
            <View style={styles.hugeValueContainer}>
              <Text style={styles.hugeValue}>{stats.dutchPile}</Text>
              <Text style={styles.hugeLabel}>Cards</Text>
            </View>
            <Pressable onPress={() => updateStat("dutchPile", 1)} style={[styles.hugeBtn, { backgroundColor: "rgba(0,245,160,0.15)" }]}>
              <Ionicons name="add" size={32} color="#00F5A0" />
            </Pressable>
          </View>
        </View>

        {/* Blitz Pile - Penalties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={18} color="#FF4757" />
            <Text style={styles.sectionTitle}>Blitz Pile (-1)</Text>
          </View>
          <View style={styles.stepperContainer}>
            <Pressable onPress={() => updateStat("blitzPile", -1)} style={styles.stepBtn}>
              <Ionicons name="remove" size={24} color="rgba(255,255,255,0.4)" />
            </Pressable>
            <Text style={styles.stepValue}>{stats.blitzPile}</Text>
            <Pressable onPress={() => updateStat("blitzPile", 1)} style={[styles.stepBtn, { backgroundColor: "rgba(255,71,87,0.15)" }]}>
              <Ionicons name="add" size={24} color="#FF4757" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipText}>Fast hands, faster scoring.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", marginBottom: 32 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.1)" },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 48, color: "#FFF" },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  mainArea: { gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 4 },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 },
  hugeStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  hugeBtn: { width: 80, height: 80, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  hugeValueContainer: { alignItems: "center" },
  hugeValue: { fontFamily: "Inter_900Black", fontSize: 44, color: "#FFF" },
  hugeLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" },
  stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  stepBtn: { width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 28, color: "#FFF" },
  tipBox: { marginTop: "auto", paddingVertical: 20, alignItems: "center" },
  tipText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.15)", fontStyle: "italic" }
});
