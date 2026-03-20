import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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

  useEffect(() => {
    onUpdate(totalScore, grid);
  }, [totalScore, grid, onUpdate]);

  const handleKeyPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGrid(prev => {
      const next = [...prev];
      if (activeSlot !== null) {
        next[activeSlot] = num;
        if (activeSlot < 11) setActiveSlot(activeSlot + 1);
        else setActiveSlot(null);
      } else {
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
            <NeuTrench key={i} color="#150428" borderRadius={8} padding={6} style={styles.roastBadge}>
              <Text style={styles.roastText}>{r}</Text>
            </NeuTrench>
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
              style={{ width: "23%", marginBottom: 8 }}
            >
              <NeuTrench
                color={activeSlot === idx ? player.color : "#150428"}
                borderRadius={12}
                padding={12}
                style={[styles.cell, activeSlot === idx ? { borderColor: "rgba(255,255,255,0.2)", borderWidth: 1 } : {}]}
              >
                <Text style={[
                  styles.cellText, 
                  val === null && styles.cellPlaceholder,
                  activeSlot === idx && { color: "#1A0533" }
                ]}>
                  {val ?? "?"}
                </Text>
              </NeuTrench>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.keypad}>
        {skyjoKeys.map(num => (
          <NeuButton
            key={num}
            onPress={() => handleKeyPress(num)}
            color="#00D2FF" // Sea Blue
            borderRadius={10}
            style={styles.key}
          >
            <Text style={styles.keyText}>{num}</Text>
          </NeuButton>
        ))}
        <NeuButton 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setGrid(Array(12).fill(null));
            setActiveSlot(0);
          }}
          color="#FF4757"
          borderRadius={10}
          style={styles.key}
        >
          <Ionicons name="trash-outline" size={18} color="#FFF" />
        </NeuButton>
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
  roastBadge: { alignSelf: "flex-start" },
  roastText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#FFB800", textTransform: "uppercase", letterSpacing: 0.5 },
  gridContainer: { marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cell: { height: 50, alignItems: "center", justifyContent: "center" },
  cellText: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  cellPlaceholder: { color: "rgba(255,255,255,0.1)" },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  key: { width: "18%", height: 44 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#1A0533" },
});
