import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench } from "../PolymerCard";

interface GolfCalculatorProps {
  player: Player;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function GolfCalculator({ player, initialLogs, onUpdate }: GolfCalculatorProps) {
  // Golf usually uses 6 cards (2 rows of 3)
  const [grid, setGrid] = useState<(number | null)[]>(
    initialLogs && initialLogs.length === 6 ? initialLogs : Array(6).fill(null)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const totalScore = useMemo(() => {
    let total = 0;
    // Check pairs in columns (0,3), (1,4), (2,5)
    for (let col = 0; col < 3; col++) {
      const top = grid[col];
      const bot = grid[col + 3];
      
      if (top !== null && top === bot) {
        // Pair cancels out
        total += 0;
      } else {
        total += (top ?? 0) + (bot ?? 0);
      }
    }
    return total;
  }, [grid]);

  useEffect(() => {
    onUpdate(totalScore, grid);
  }, [totalScore, grid, onUpdate]);

  const handleKeyPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGrid(prev => {
      const next = [...prev];
      if (activeSlot !== null) {
        next[activeSlot] = num;
        if (activeSlot < 5) setActiveSlot(activeSlot + 1);
        else setActiveSlot(null);
      } else {
        const firstEmpty = next.findIndex(v => v === null);
        if (firstEmpty !== -1) {
          next[firstEmpty] = num;
          if (firstEmpty < 5) setActiveSlot(firstEmpty + 1);
        }
      }
      return next;
    });
  };

  const golfKeys = [
    { label: "A", val: 1 },
    { label: "2", val: -2 },
    { label: "3", val: 3 },
    { label: "4", val: 4 },
    { label: "5", val: 5 },
    { label: "6", val: 6 },
    { label: "7", val: 7 },
    { label: "8", val: 8 },
    { label: "9", val: 9 },
    { label: "10", val: 10 },
    { label: "J/Q", val: 10 },
    { label: "K", val: 0 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreText, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
        <Text style={styles.desc}>Tap a card to set its value. Pairs in columns score 0.</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {grid.map((val, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                setActiveSlot(idx);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.cell,
                activeSlot === idx && { borderColor: player.color, backgroundColor: player.color + "22" }
              ]}
            >
              <Text style={[styles.cellText, val === null && styles.cellPlaceholder]}>
                {val === -2 ? "-2" : (val ?? "?")}
              </Text>
              <Text style={styles.cellLabel}>Pos {idx + 1}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.keypad}>
          {golfKeys.map(k => (
            <Pressable
              key={k.label}
              onPress={() => handleKeyPress(k.val)}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.keyPressed
              ]}
            >
              <Text style={styles.keyText}>{k.label}</Text>
              <Text style={styles.keyVal}>{k.val > 0 ? `+${k.val}` : k.val}</Text>
            </Pressable>
          ))}
          <Pressable 
            onPress={() => {
              setGrid(Array(6).fill(null));
              setActiveSlot(0);
            }}
            style={styles.keyReset}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4757" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 16, gap: 12 },
  scoreBox: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 42 },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  desc: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  gridContainer: { marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  cell: { width: "30%", height: 70, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  cellText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  cellPlaceholder: { color: "rgba(255,255,255,0.1)" },
  cellLabel: { fontFamily: "Inter_700Bold", fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 2, textTransform: "uppercase" },
  scroll: { flex: 1 },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingBottom: 20 },
  key: { width: "22%", height: 54, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF" },
  keyVal: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.3)" },
  keyReset: { width: "22%", height: 54, backgroundColor: "rgba(255,71,87,0.1)", borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
