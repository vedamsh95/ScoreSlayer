import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface FarkleCalculatorProps {
  player: Player;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function FarkleCalculator({ player, initialLogs, onUpdate }: FarkleCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [currentTurn, setCurrentTurn] = useState<number>(0);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { currentTurn });
  }, [total, logs, currentTurn, onUpdate]);

  const addScore = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTurn(prev => prev + val);
  };

  const commitTurn = () => {
    if (currentTurn === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogs(prev => [...prev, currentTurn]);
    setCurrentTurn(0);
  };

  const farkle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setLogs(prev => [...prev, 0]);
    setCurrentTurn(0);
  };

  const removeLast = () => {
    if (logs.length === 0 && currentTurn === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentTurn > 0) {
      setCurrentTurn(0);
    } else {
      setLogs(prev => prev.slice(0, -1));
    }
  };

  const quickScores = [
    { label: "1s (x3)", val: 1000, color: "#FF4757" },
    { label: "5s (x3)", val: 500, color: "#FFA502" },
    { label: "Single 1", val: 100, color: "#FF6B6B" },
    { label: "Single 5", val: 50, color: "#FFD32A" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.roundTitle}>TURN TOTAL</Text>
            <Text style={[styles.turnScore, { color: player.color }]}>+{currentTurn}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.roundTitle}>GRAND TOTAL</Text>
            <Text style={styles.grandTotal}>{total + currentTurn}</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholder}>Roll dice to start scoring...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: val > 0 ? player.color + "15" : "#FF475722" }]}>
                <Text style={[styles.logChipText, { color: val > 0 ? player.color : "#FF4757" }]}>
                  {val === 0 ? "FARKLE" : `+${val}`}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      <Text style={styles.sectionTitle}>Quick Combos</Text>
      <View style={styles.quickGrid}>
        {quickScores.map((s, i) => (
          <NeuButton key={i} onPress={() => addScore(s.val)} color="#150428" borderRadius={16} style={styles.quickKey}>
            <Text style={[styles.quickVal, { color: s.color }]}>+{s.val}</Text>
            <Text style={styles.quickLabel}>{s.label}</Text>
          </NeuButton>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Custom Score</Text>
      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 0].map(n => (
          <NeuButton key={n} onPress={() => addScore(n * 100)} color="#00D2FF" borderRadius={12} style={styles.key}>
            <Text style={styles.keyText}>+{n * 100}</Text>
          </NeuButton>
        ))}
      </View>

      <View style={styles.actionRow}>
        <NeuButton onPress={farkle} color="#FF4757" borderRadius={18} style={styles.farkleBtn}>
          <Text style={styles.farkleText}>FARKLE</Text>
        </NeuButton>
        <NeuButton onPress={commitTurn} color="#00F5A0" borderRadius={18} style={styles.bankBtn}>
          <Text style={styles.bankText}>BANK SCORE</Text>
        </NeuButton>
        <NeuButton onPress={removeLast} color="#150428" borderRadius={18} style={styles.backBtn}>
          <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.4)" />
        </NeuButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  roundTitle: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  turnScore: { fontFamily: "Inter_900Black", fontSize: 48, lineHeight: 52 },
  grandTotal: { fontFamily: "Inter_900Black", fontSize: 28, color: "rgba(255,255,255,0.4)" },
  logStrip: { flexDirection: "row", height: 26 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 11 },
  placeholder: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.1)" },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 },
  quickGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickKey: { flex: 1, height: 74 },
  quickVal: { fontFamily: "Inter_900Black", fontSize: 16 },
  quickLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginTop: 2 },
  numpad: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  key: { width: "31%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#1A0533" },
  actionRow: { flexDirection: "row", gap: 10 },
  farkleBtn: { flex: 1, height: 56 },
  bankBtn: { flex: 2, height: 56 },
  backBtn: { width: 56, height: 56 },
  farkleText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  bankText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#1A0533" },
});
