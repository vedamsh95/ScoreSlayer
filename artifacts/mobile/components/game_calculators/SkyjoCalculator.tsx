import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench } from "../PolymerCard";

interface SkyjoCalculatorProps {
  player: Player;
  initialGrid?: (number | null)[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SkyjoCalculator({ player, initialGrid, onUpdate }: SkyjoCalculatorProps) {
  const [grid, setGrid] = useState<(number | null)[]>(
    initialGrid || Array(12).fill(null)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const totalScore = useMemo(() => {
    let total = 0;
    for (let col = 0; col < 4; col++) {
      const c1 = grid[col];
      const c2 = grid[col + 4];
      const c3 = grid[col + 8];
      
      if (c1 !== null && c1 === c2 && c2 === c3) {
        total += 0; // Column cancels out
      } else {
        total += (c1 ?? 0) + (c2 ?? 0) + (c3 ?? 0);
      }
    }
    return total;
  }, [grid]);

  // Sync with parent whenever grid changes
  useEffect(() => {
    onUpdate(totalScore, grid);
  }, [totalScore, grid, onUpdate]);

  const handleKeyPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGrid(prev => {
      const next = [...prev];
      if (activeSlot !== null) {
        next[activeSlot] = num;
        // Auto-advance
        if (activeSlot < 11) setActiveSlot(activeSlot + 1);
        else setActiveSlot(null);
      } else {
        // Find first empty
        const firstEmpty = next.findIndex(v => v === null);
        if (firstEmpty !== -1) {
          next[firstEmpty] = num;
          if (firstEmpty < 11) setActiveSlot(firstEmpty + 1);
        }
      }
      return next;
    });
  };

  const roasts = useMemo(() => {
    const list = [];
    const twelves = grid.filter(v => v === 12).length;
    if (twelves >= 3) list.push("The Weight: Too many 12s!");
    
    for (let col = 0; col < 4; col++) {
      if (grid[col] !== null && grid[col] === grid[col+4] && grid[col+4] === grid[col+8]) {
        list.push("Scout Move! Column Cleared.");
        break;
      }
    }
    return list;
  }, [grid]);

  const skyjoKeys = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreText, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
        <View style={styles.roastContainer}>
          {roasts.map((r, i) => (
            <View key={i} style={styles.roastBadge}>
              <Text style={styles.roastText}>{r}</Text>
            </View>
          ))}
        </View>
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
                {val ?? "?"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.keypad}>
        {skyjoKeys.map(num => (
          <Pressable
            key={num}
            onPress={() => handleKeyPress(num)}
            style={({ pressed }) => [
              styles.key,
              pressed && styles.keyPressed
            ]}
          >
            <Text style={styles.keyText}>{num}</Text>
          </Pressable>
        ))}
        <Pressable 
          onPress={() => {
            setGrid(Array(12).fill(null));
            setActiveSlot(0);
          }}
          style={styles.keyReset}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4757" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 16, gap: 16 },
  scoreBox: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 42 },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  roastContainer: { flex: 1, gap: 4 },
  roastBadge: { backgroundColor: "rgba(255,184,0,0.1)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  roastText: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "#FFB800", textTransform: "uppercase" },
  gridContainer: { marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  cell: { width: "23%", height: 50, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  cellText: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  cellPlaceholder: { color: "rgba(255,255,255,0.1)" },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  key: { width: "18%", height: 46, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_800ExtraBold", fontSize: 16, color: "#FFF" },
  keyReset: { width: "18%", height: 46, backgroundColor: "rgba(255,71,87,0.1)", borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
