import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface SkyjoCalculatorProps {
  player: Player;
  initialGrid?: (number | null)[];
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SkyjoCalculator({ player, initialGrid, initialMetadata, onUpdate }: SkyjoCalculatorProps) {
  const [grid, setGrid] = useState<(number | null)[]>(
    initialGrid || initialMetadata?.grid || Array(12).fill(null)
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

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
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return total + manualTotal;
  }, [grid, manualLogs]);

  useEffect(() => {
    const list = [];
    const twelves = grid.filter(v => v === 12).length;
    if (twelves >= 3) list.push("The Weight: Too many 12s!");
    
    for (let col = 0; col < 4; col++) {
      if (grid[col] !== null && grid[col] === grid[col+4] && grid[col+4] === grid[col+8]) {
        list.push("Scout Move! Column Cleared.");
        break;
      }
    }

    onUpdate(totalScore, manualLogs, { 
      grid, 
      manualLogs, 
      dynamicQuickAdds, 
      roasts: list 
    });
  }, [totalScore, grid, manualLogs, dynamicQuickAdds, onUpdate]);

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

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setManualLogs(prev => [...prev, val]);
      setManualValue("");
    }
  };

  const handleSaveAsShortcut = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val) && !dynamicQuickAdds.includes(val)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDynamicQuickAdds(prev => [...prev, val]);
      setManualValue("");
    }
  };

  const resetAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGrid(Array(12).fill(null));
    setActiveSlot(0);
    setManualLogs([]);
  };

  const skyjoKeys = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <NeuTrench color="#150428" borderRadius={24} padding={12} style={styles.scoreBox}>
          <Text style={[styles.scoreText, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </NeuTrench>
        <Text style={styles.desc}>Tap cards to fill. 3 identical in a column = 0 pts.</Text>
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

      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Entry & Shortcuts</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Custom card..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="numeric"
              onSubmitEditing={handleManualAdd}
            />
          </NeuTrench>
          <View style={styles.manualActionGroup}>
            <Pressable onPress={handleManualAdd} style={styles.manualAddBtn}>
              <NeuIconWell color="rgba(0, 245, 160, 0.1)" size={48} borderRadius={14}>
                <Feather name="plus" size={24} color="#00F5A0" />
              </NeuIconWell>
            </Pressable>
            <Pressable onPress={handleSaveAsShortcut} style={[styles.manualAddBtn, { marginLeft: 8 }]}>
              <NeuIconWell color="rgba(139, 92, 246, 0.1)" size={48} borderRadius={14}>
                <MaterialCommunityIcons name="star-plus" size={24} color="#8B5CF6" />
              </NeuIconWell>
            </Pressable>
          </View>
        </View>
      </View>

      {dynamicQuickAdds.length > 0 && (
        <View style={styles.shortcutsSection}>
          <View style={styles.quickGrid}>
            {dynamicQuickAdds.map((val, idx) => (
              <NeuButton
                key={`shortcut-${idx}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setManualLogs(prev => [...prev, val]);
                }}
                color="#8B5CF6"
                borderRadius={14}
                style={styles.shortcutKey}
              >
                <Text style={styles.shortcutKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Card Values</Text>
      <View style={styles.keypad}>
        {skyjoKeys.map(num => (
          <NeuButton
            key={num}
            onPress={() => handleKeyPress(num)}
            color="#00D2FF"
            borderRadius={10}
            style={styles.key}
          >
            <Text style={styles.keyText}>{num}</Text>
          </NeuButton>
        ))}
        <NeuButton 
          onPress={resetAll}
          color="#FF4757"
          borderRadius={10}
          style={styles.key}
        >
          <Ionicons name="trash-outline" size={18} color="#FFF" />
        </NeuButton>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 16, marginTop: 8, gap: 16 },
  scoreBox: { flexDirection: "row", alignItems: "baseline", gap: 4, minWidth: 90, justifyContent: "center" },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 42 },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  desc: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  gridContainer: { marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cell: { height: 50, alignItems: "center", justifyContent: "center" },
  cellText: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  cellPlaceholder: { color: "rgba(255,255,255,0.1)" },
  manualSection: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", paddingBottom: 20 },
  key: { width: "18%", height: 44 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#1A0533" },
});
