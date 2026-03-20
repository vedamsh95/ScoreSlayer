import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface HeartsCalculatorProps {
  player: Player;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function HeartsCalculator({ player, initialLogs, onUpdate }: HeartsCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs);
  }, [total, logs, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const removeLast = () => {
    if (logs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const actionCards = [
    { label: "Hearts", value: 1, icon: "heart", color: "#FF4757" },
    { label: "Q-Spades", value: 13, icon: "crown", color: "#6B21E8" },
    { label: "J-Diamonds", value: -10, icon: "diamond-stone", color: "#00D2FF" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.headerTop}>
          <View style={styles.displayTextRow}>
            <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
            <Text style={styles.displayPts}>pts</Text>
          </View>
          <NeuButton onPress={removeLast} color="#1A0533" borderRadius={12} style={styles.backButton}>
            <Ionicons name="backspace" size={20} color="rgba(255,255,255,0.4)" />
          </NeuButton>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>No penalties yet...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "15" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>{val > 0 ? `+${val}` : val}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      <Text style={styles.sectionTitle}>Penalty Cards</Text>
      <View style={styles.actionRow}>
        {actionCards.map((card, i) => (
          <NeuButton
            key={i}
            onPress={() => addValue(card.value)}
            color={card.color}
            borderRadius={20}
            style={styles.actionKey}
          >
            <View style={styles.actionInner}>
              <View style={[styles.iconWell, { backgroundColor: "rgba(26,5,51,0.2)" }]}>
                <MaterialCommunityIcons name={card.icon as any} size={22} color="#1A0533" />
              </View>
              <Text style={[styles.actionValue, { color: "#1A0533" }]}>{card.value > 0 ? `+${card.value}` : card.value}</Text>
              <Text style={[styles.actionLabel, { color: "rgba(26,5,51,0.5)" }]}>{card.label}</Text>
            </View>
          </NeuButton>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Custom Value</Text>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <NeuButton
            key={num}
            onPress={() => addValue(num)}
            color="#00D2FF"
            borderRadius={16}
            style={styles.key}
          >
            <Text style={[styles.keyText, { color: "#1A0533" }]}>{num}</Text>
          </NeuButton>
        ))}
        <NeuButton 
          onPress={() => {
            setLogs([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }}
          color="#FF4757"
          borderRadius={16}
          style={styles.keyReset}
        >
          <Ionicons name="trash" size={20} color="#FFF" />
        </NeuButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  displayPts: { fontFamily: "Inter_900Black", fontSize: 14, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" },
  backButton: { width: 44, height: 44 },
  logStrip: { flexDirection: "row", height: 28 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 13 },
  placeholderText: { fontFamily: "Inter_800ExtraBold", fontSize: 14, color: "rgba(255,255,255,0.1)", letterSpacing: 0.5 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  actionKey: { flex: 1, height: 100 },
  actionInner: { alignItems: "center", justifyContent: "center" },
  iconWell: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  key: { width: "22%", height: 56 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  keyReset: { width: "22%", height: 56 },
});
