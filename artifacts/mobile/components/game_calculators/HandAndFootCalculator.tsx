import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface HandAndFootCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
}

export function HandAndFootCalculator({ player, game, onUpdate, initialStats }: HandAndFootCalculatorProps) {
  const [stats, setStats] = useState({
    cleanBooks: initialStats?.cleanBooks || 0,       // 500 each
    dirtyBooks: initialStats?.dirtyBooks || 0,       // 300 each
    redThrees: initialStats?.redThrees || 0,         // 100 each
    points50: initialStats?.points50 || 0,           // Jokers
    points20: initialStats?.points20 || 0,           // 2s, Aces
    points10: initialStats?.points10 || 0,           // 8-K
    points5: initialStats?.points5 || 0,             // 4-7
    wentOut: initialStats?.wentOut || false,         // 100 bonus
  });

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.cleanBooks * 500;
    score += stats.dirtyBooks * 300;
    score += stats.redThrees * 100;
    score += stats.points50 * 50;
    score += stats.points20 * 20;
    score += stats.points10 * 10;
    score += stats.points5 * 5;
    if (stats.wentOut) score += 100;
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

  const renderBookPart = (label: string, key: string, value: number, color: string, pts: number) => (
    <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.bookCard}>
      <View style={[styles.bookIndicator, { backgroundColor: color }]} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookLabel}>{label}</Text>
        <Text style={styles.bookPts}>{pts} pts ea</Text>
      </View>
      <View style={styles.stepperControls}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#00D2FF" borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="remove" size={16} color="#1A0533" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="add" size={16} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  const renderValueStepper = (label: string, key: string, value: number, pts: number, color: string) => (
    <NeuTrench color="#150428" borderRadius={16} padding={12} style={styles.smallStepper}>
      <View style={styles.valInfo}>
        <Text style={[styles.valPts, { color }]}>{pts} pts</Text>
        <Text style={styles.valLabel}>{label}</Text>
      </View>
      <View style={styles.stepperControls}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#00D2FF" borderRadius={8} style={styles.miniBtn}>
          <Ionicons name="remove" size={14} color="#1A0533" />
        </NeuButton>
        <Text style={styles.miniValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={8} style={styles.miniBtn}>
          <Ionicons name="add" size={14} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.totalHeader}>
        <Text style={styles.totalLabel}>Round Total</Text>
        <Text style={[styles.totalValue, { color: player.color }]}>{totalScore.toLocaleString()}</Text>
      </NeuTrench>

      <Text style={styles.sectionTitle}>Books & Bonuses</Text>
      <View style={styles.booksGrid}>
        {renderBookPart("Red Books", "cleanBooks", stats.cleanBooks, "#FF4757", 500)}
        {renderBookPart("Black Books", "dirtyBooks", stats.dirtyBooks, "#00D2FF", 300)}
        <View style={styles.bonusRow}>
          <View style={{ flex: 1 }}>
            {renderBookPart("Red Threes", "redThrees", stats.redThrees, "#E67E22", 100)}
          </View>
          <NeuButton 
            onPress={() => updateStat("wentOut", !stats.wentOut)}
            color={stats.wentOut ? "#00D2FF" : "#150428"}
            borderRadius={20}
            style={styles.wentOutBtn}
          >
            <View style={styles.wentOutInner}>
              <MaterialCommunityIcons 
                name={stats.wentOut ? "door-open" : "door-closed"} 
                size={24} 
                color={stats.wentOut ? "#1A0533" : "rgba(255,255,255,0.2)"} 
              />
              <Text style={[styles.wentOutLabel, { color: stats.wentOut ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>OUT</Text>
              <Text style={[styles.wentOutPts, { color: stats.wentOut ? "#1A0533" : "rgba(255,255,255,0.1)" }]}>+100</Text>
            </View>
          </NeuButton>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Card Inventory</Text>
      <View style={styles.valuesGrid}>
        {renderValueStepper("Jokers", "points50", stats.points50, 50, "#9B59B6")}
        {renderValueStepper("2s, Aces", "points20", stats.points20, 20, "#3498DB")}
        {renderValueStepper("8-K", "points10", stats.points10, 10, "#E67E22")}
        {renderValueStepper("4-7", "points5", stats.points5, 5, "#1ABC9C")}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  totalHeader: { alignItems: "center", marginBottom: 24 },
  totalLabel: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 },
  booksGrid: { gap: 12 },
  bookCard: { flexDirection: "row", alignItems: "center" },
  bookIndicator: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  bookInfo: { flex: 1 },
  bookLabel: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", textTransform: "uppercase" },
  bookPts: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 34, height: 34 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF", minWidth: 28, textAlign: "center" },
  bonusRow: { flexDirection: "row", gap: 12 },
  wentOutBtn: { width: 90 },
  wentOutInner: { alignItems: "center", justifyContent: "center" },
  wentOutLabel: { fontFamily: "Inter_900Black", fontSize: 9, marginTop: 4 },
  wentOutPts: { fontFamily: "Inter_900Black", fontSize: 8 },
  valuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  smallStepper: { width: "48.5%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  valInfo: { flex: 1 },
  valPts: { fontFamily: "Inter_900Black", fontSize: 12 },
  valLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" },
  miniBtn: { width: 30, height: 30 },
  miniValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", minWidth: 20, textAlign: "center" },
  spacer: { height: 40 }
});
