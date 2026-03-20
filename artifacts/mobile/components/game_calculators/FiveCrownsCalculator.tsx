import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface FiveCrownsCalculatorProps {
  player: Player;
  round: number;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function FiveCrownsCalculator({ player, round, initialLogs, onUpdate }: FiveCrownsCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  
  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  // Five Crowns Wilds: Round 1 (3 cards) = 3 is wild, Round 11 (13 cards) = K is wild
  const WILDS = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const currentWild = WILDS[Math.min(round - 1, 10)] || "K";

  useEffect(() => {
    onUpdate(total, logs, { currentWild });
  }, [total, logs, currentWild, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const removeLast = () => {
    if (logs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const cardValues = [
    { label: "3-10", val: "face", color: "#00D2FF" },
    { label: "Jack", val: 11, color: "#9B59B6" },
    { label: "Queen", val: 12, color: "#E67E22" },
    { label: "King", val: 13, color: "#E74C3C" },
    { label: "Joker", val: 50, color: "#F1C40F" },
    { label: "Wild", val: 20, color: "#FF4757" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.header}>
           <View>
             <Text style={styles.roundLabel}>ROUND {round}</Text>
             <View style={styles.wildBadge}>
               <Ionicons name="flash" size={10} color="#FFB800" />
               <Text style={styles.wildText}>WILD: {currentWild}</Text>
             </View>
           </View>
           <View style={styles.scoreBox}>
             <Text style={[styles.scoreVal, { color: player.color }]}>{total}</Text>
             <Text style={styles.scoreLabel}>PTS</Text>
           </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholder}>Tap cards to add penalty...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "15" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>+{val}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      <View style={styles.grid}>
        {/* Numeric Keys 3-10 */}
        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <NeuButton key={n} onPress={() => addValue(n)} color="#00D2FF" borderRadius={14} style={styles.key}>
            <Text style={styles.keyText}>{n}</Text>
          </NeuButton>
        ))}
        {/* Special Keys */}
        {cardValues.slice(1).map((c, i) => (
          <NeuButton key={i} onPress={() => addValue(c.val as number)} color={c.color} borderRadius={14} style={styles.wideKey}>
            <Text style={[styles.keyText, { color: "#1A0533" }]}>{c.val}</Text>
            <Text style={[styles.keySub, { color: "rgba(26,5,51,0.5)" }]}>{c.label}</Text>
          </NeuButton>
        ))}
        
        <NeuButton onPress={removeLast} color="#150428" borderRadius={14} style={styles.backKey}>
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </NeuButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  roundLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  wildBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,184,0,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  wildText: { fontFamily: "Inter_900Black", fontSize: 10, color: "#FFB800" },
  scoreBox: { alignItems: "baseline", flexDirection: "row", gap: 4 },
  scoreVal: { fontFamily: "Inter_900Black", fontSize: 44 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 12, color: "rgba(255,255,255,0.2)" },
  logStrip: { flexDirection: "row", height: 26 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholder: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.1)" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  key: { width: "22%", height: 50 },
  wideKey: { width: "30%", height: 64 },
  backKey: { width: "30%", height: 64 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#1A0533" },
  keySub: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.5)", textTransform: "uppercase" },
});
