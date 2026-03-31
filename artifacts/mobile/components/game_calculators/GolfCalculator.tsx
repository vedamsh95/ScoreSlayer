import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface GolfCalculatorProps {
  player: Player;
  initialLogs?: (number | null)[];
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function GolfCalculator({ player, initialLogs, initialMetadata, onUpdate }: GolfCalculatorProps) {
  // Golf usually uses 6 cards (2 rows of 3)
  const [grid, setGrid] = useState<(number | null)[]>(
    initialLogs && initialLogs.length === 6 ? initialLogs : (initialMetadata?.grid || Array(6).fill(null))
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

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
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return total + manualTotal;
  }, [grid, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, manualLogs, { grid, manualLogs, dynamicQuickAdds });
  }, [totalScore, grid, manualLogs, dynamicQuickAdds, onUpdate]);

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

  const resetGrid = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setGrid(Array(6).fill(null));
    setActiveSlot(0);
    setManualLogs([]);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <NeuTrench color="#150428" borderRadius={24} padding={12} style={styles.scoreBox}>
          <Text style={[styles.scoreText, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </NeuTrench>
        <Text style={styles.desc}>Tap a card to set its value. Pairs in columns score 0.</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {grid.map((val, idx) => (
            <NeuButton
              key={idx}
              onPress={() => {
                setActiveSlot(idx);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              color={activeSlot === idx ? player.color : "#150428"}
              borderRadius={16}
              style={styles.cell}
            >
              <View style={styles.cellInner}>
                <Text style={[styles.cellText, { color: activeSlot === idx ? "#1A0533" : val === null ? "rgba(255,255,255,0.1)" : "#FFF" }]}>
                  {val === -2 ? "-2" : (val ?? "?")}
                </Text>
                <Text style={[styles.cellLabel, { color: activeSlot === idx ? "rgba(26,5,51,0.4)" : "rgba(255,255,255,0.2)" }]}>POS {idx + 1}</Text>
              </View>
            </NeuButton>
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
              placeholder="Custom Pts..."
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

      <Text style={styles.sectionTitle}>Keypad Values</Text>
      <View style={styles.keypad}>
        {golfKeys.map(k => (
          <NeuButton
            key={k.label}
            onPress={() => handleKeyPress(k.val)}
            color="#00D2FF"
            borderRadius={12}
            style={styles.key}
          >
            <View style={styles.keyInner}>
              <Text style={[styles.keyText, { color: "#1A0533" }]}>{k.label}</Text>
              <Text style={[styles.keyVal, { color: "rgba(26,5,51,0.5)" }]}>{k.val > 0 ? `+${k.val}` : k.val}</Text>
            </View>
          </NeuButton>
        ))}
        <NeuButton 
          onPress={resetGrid}
          color="#FF4757"
          borderRadius={12}
          style={styles.keyReset}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </NeuButton>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 16, marginTop: 8, gap: 16 },
  scoreBox: { flexDirection: "row", alignItems: "baseline", gap: 6, minWidth: 100, justifyContent: "center" },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 44, lineHeight: 50 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 12, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" },
  desc: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  gridContainer: { marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  cell: { width: "31%", height: 74 },
  cellInner: { alignItems: "center", justifyContent: "center" },
  cellText: { fontFamily: "Inter_900Black", fontSize: 26 },
  cellLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  manualSection: { marginBottom: 12, marginTop: 12 },
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
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center", paddingBottom: 20 },
  key: { width: "23%", height: 56 },
  keyInner: { alignItems: "center", justifyContent: "center" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF" },
  keyVal: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)" },
  keyReset: { width: "23%", height: 56 },
});
