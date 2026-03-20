import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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
  }, [totalScore, stats, onUpdate]);

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
        <NeuTrench color="#150428" borderRadius={60} padding={10} style={styles.scoreCircle}>
          <Text style={[styles.scoreValue, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>Total</Text>
        </NeuTrench>
      </View>

      <View style={styles.mainArea}>
        {/* Dutch Pile - The BIG ONE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={12} color="#00D2FF" />
            <Text style={styles.sectionTitle}>Dutch Pile (+2)</Text>
          </View>
          <NeuTrench color="#150428" borderRadius={24} padding={12} style={styles.hugeStepper}>
            <NeuButton onPress={() => updateStat("dutchPile", -1)} color="#1A0533" borderRadius={20} style={styles.hugeBtn}>
              <Ionicons name="remove" size={32} color="rgba(255,255,255,0.4)" />
            </NeuButton>
            <View style={styles.hugeValueContainer}>
              <Text style={styles.hugeValue}>{stats.dutchPile}</Text>
              <Text style={styles.hugeLabel}>Cards</Text>
            </View>
            <NeuButton onPress={() => updateStat("dutchPile", 1)} color="#00D2FF" borderRadius={20} style={styles.hugeBtn}>
              <Ionicons name="add" size={32} color="#1A0533" />
            </NeuButton>
          </NeuTrench>
        </View>

        {/* Blitz Pile - Penalties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={12} color="#FF4757" />
            <Text style={styles.sectionTitle}>Blitz Pile (-1)</Text>
          </View>
          <NeuTrench color="#150428" borderRadius={20} padding={10} style={styles.stepperContainer}>
            <NeuButton onPress={() => updateStat("blitzPile", -1)} color="#1A0533" borderRadius={14} style={styles.stepBtn}>
              <Ionicons name="remove" size={24} color="rgba(255,255,255,0.4)" />
            </NeuButton>
            <Text style={styles.stepValue}>{stats.blitzPile}</Text>
            <NeuButton onPress={() => updateStat("blitzPile", 1)} color="#FF4757" borderRadius={14} style={styles.stepBtn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </NeuButton>
          </NeuTrench>
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
  scoreCircle: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 48, lineHeight: 54 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  mainArea: { gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 4 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5 },
  hugeStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hugeBtn: { width: 72, height: 72 },
  hugeValueContainer: { alignItems: "center" },
  hugeValue: { fontFamily: "Inter_900Black", fontSize: 44, color: "#FFF", lineHeight: 50 },
  hugeLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: { width: 52, height: 52 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 28, color: "#FFF", lineHeight: 34 },
  tipBox: { marginTop: "auto", paddingVertical: 20, alignItems: "center", opacity: 0.3 },
  tipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }
});
