import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench } from "../PolymerCard";

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const actionCards = [
    { label: "1 pt Heart", value: 1, icon: "heart-outline" },
    { label: "Queen of Spades", value: 13, icon: "crown-outline" },
    { label: "Jack Diamonds", value: -10, icon: "diamond-outline" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.displayArea}>
        <View style={styles.displayTextRow}>
          <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
          <Text style={styles.displayPts}>pts</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>Tap cards to add scores...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>{val > 0 ? `+${val}` : val}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <Pressable onPress={removeLast} style={styles.backspace}>
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </NeuTrench>

      <Text style={styles.sectionTitle}>Tap to add Hearts/Penalty</Text>
      <View style={styles.actionRow}>
        {actionCards.map((card, i) => (
          <Pressable
            key={i}
            onPress={() => addValue(card.value)}
            style={styles.actionKey}
          >
            <MaterialCommunityIcons name={card.icon as any} size={24} color={player.color} />
            <Text style={styles.actionLabel}>{card.label}</Text>
            <Text style={styles.actionValue}>{card.value > 0 ? `+${card.value}` : card.value}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Pressable
            key={num}
            onPress={() => addValue(num)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyText}>{num}</Text>
          </Pressable>
        ))}
        <Pressable 
          onPress={() => {
            setLogs([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }}
          style={styles.keyReset}
        >
          <Ionicons name="trash-outline" size={24} color="#FF4757" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionKey: { flex: 1, height: 90, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, alignItems: "center", justifyContent: "center", padding: 8 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 6, textAlign: "center" },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  key: { width: "23%", height: 56, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  keyReset: { width: "23%", height: 56, backgroundColor: "rgba(255,71,87,0.1)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
