import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";

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
  }, [totalScore]);

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
    <View style={[styles.bookCard, { borderColor: color + "30" }]}>
      <View style={[styles.bookIndicator, { backgroundColor: color }]} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookLabel}>{label}</Text>
        <Text style={styles.bookPts}>{pts} pts ea</Text>
      </View>
      <View style={styles.stepperControls}>
        <Pressable onPress={() => updateStat(key, -1)} style={styles.stepBtn}>
          <Ionicons name="remove" size={16} color="rgba(255,255,255,0.4)" />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable onPress={() => updateStat(key, 1)} style={styles.stepBtn}>
          <Ionicons name="add" size={16} color={color} />
        </Pressable>
      </View>
    </View>
  );

  const renderValueStepper = (label: string, key: string, value: number, pts: number) => (
    <View style={styles.smallStepper}>
      <View style={styles.valInfo}>
        <Text style={styles.valPts}>{pts} pts</Text>
        <Text style={styles.valLabel}>{label}</Text>
      </View>
      <View style={styles.stepperControls}>
        <Pressable onPress={() => updateStat(key, -1)} style={styles.miniBtn}>
          <Ionicons name="remove" size={14} color="rgba(255,255,255,0.3)" />
        </Pressable>
        <Text style={styles.miniValue}>{value}</Text>
        <Pressable onPress={() => updateStat(key, 1)} style={styles.miniBtn}>
          <Ionicons name="add" size={14} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.totalHeader}>
        <Text style={styles.totalLabel}>Round Total</Text>
        <Text style={styles.totalValue}>{totalScore.toLocaleString()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Books & Bonuses</Text>
      <View style={styles.booksGrid}>
        {renderBookPart("Red Books", "cleanBooks", stats.cleanBooks, "#FF4757", 500)}
        {renderBookPart("Black Books", "dirtyBooks", stats.dirtyBooks, "#2F3542", 300)}
        <View style={styles.bonusRow}>
          <View style={{ flex: 1 }}>
            {renderBookPart("Red Threes", "redThrees", stats.redThrees, "#E67E22", 100)}
          </View>
          <Pressable 
            onPress={() => updateStat("wentOut", !stats.wentOut)}
            style={[styles.wentOutBtn, stats.wentOut && styles.wentOutActive]}
          >
            <MaterialCommunityIcons 
              name={stats.wentOut ? "door-open" : "door-closed"} 
              size={24} 
              color={stats.wentOut ? "#00F5A0" : "rgba(255,255,255,0.2)"} 
            />
            <Text style={[styles.wentOutLabel, stats.wentOut && { color: "#FFF" }]}>Went Out</Text>
            <Text style={styles.wentOutPts}>+100</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Card Inventory</Text>
      <View style={styles.valuesGrid}>
        {renderValueStepper("Jokers", "points50", stats.points50, 50)}
        {renderValueStepper("2s, Aces", "points20", stats.points20, 20)}
        {renderValueStepper("8-K", "points10", stats.points10, 10)}
        {renderValueStepper("4-7", "points5", stats.points5, 5)}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  totalHeader: { backgroundColor: "rgba(0,245,160,0.05)", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: "rgba(0,245,160,0.15)" },
  totalLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "#00F5A0", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 48, color: "#FFF" },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  booksGrid: { gap: 12 },
  bookCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  bookIndicator: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  bookInfo: { flex: 1 },
  bookLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  bookPts: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", minWidth: 24, textAlign: "center" },
  bonusRow: { flexDirection: "row", gap: 12 },
  wentOutBtn: { width: 100, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  wentOutActive: { backgroundColor: "rgba(0,245,160,0.1)", borderColor: "#00F5A0" },
  wentOutLabel: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 },
  wentOutPts: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)" },
  valuesGrid: { gap: 10 },
  smallStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 12, paddingLeft: 16 },
  valInfo: { flex: 1 },
  valPts: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "#9B59B6" },
  valLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  miniBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  miniValue: { fontFamily: "Inter_800ExtraBold", fontSize: 16, color: "#FFF", minWidth: 24, textAlign: "center" },
  spacer: { height: 40 }
});
