import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface MoelkkyCalculatorProps {
  player: Player;
  initialScore?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function MoelkkyCalculator({ player, initialScore = 0, onUpdate }: MoelkkyCalculatorProps) {
  const [score, setScore] = useState<number>(initialScore);
  const [logs, setLogs] = useState<number[]>([]);

  useEffect(() => {
    onUpdate(score, logs, { logs });
  }, [score, logs, onUpdate]);

  const addPoints = (pts: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScore = score + pts;
    if (newScore > 50) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScore(25);
      setLogs(prev => [...prev, pts, "BUST -> 25"] as any);
    } else {
      if (newScore === 50) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(newScore);
      setLogs(prev => [...prev, pts]);
    }
  };

  const undo = () => {
    if (logs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const last = logs[logs.length - 1];
    if (typeof last === "string") {
      // Handle the "BUST -> 25" case
      setScore(score); // This is tricky, maybe just reset to 0 for simplicity or track full history
      setLogs([]);
      setScore(0);
    } else {
      setScore(Math.max(0, score - last));
      setLogs(prev => prev.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.header}>
           <View>
             <Text style={styles.label}>CURRENT SCORE</Text>
             <Text style={[styles.scoreVal, { color: player.color }]}>{score}</Text>
           </View>
           <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>TARGET</Text>
              <Text style={styles.targetVal}>50</Text>
           </View>
        </View>

        <View style={styles.progressBar}>
           <NeuTrench color="#150428" borderRadius={8} padding={0} style={styles.track}>
              <View style={[styles.fill, { width: `${(score / 50) * 100}%` as any, backgroundColor: player.color }]} />
           </NeuTrench>
        </View>
      </NeuTrench>

      <Text style={styles.sectionTitle}>Points Thrown</Text>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
          <NeuButton key={n} onPress={() => addPoints(n)} color="#00D2FF" borderRadius={14} style={styles.key}>
            <Text style={styles.keyText}>{n}</Text>
          </NeuButton>
        ))}
        <NeuButton onPress={() => addPoints(0)} color="#FF475722" borderRadius={14} style={styles.missKey}>
          <Text style={styles.missText}>MISS (0)</Text>
        </NeuButton>
        <NeuButton onPress={undo} color="#150428" borderRadius={14} style={styles.backKey}>
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </NeuButton>
      </View>

      <View style={styles.tipBox}>
        <NeuIconWell color="rgba(255,255,255,0.05)" size={32} borderRadius={10}>
          <Ionicons name="alert-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
        </NeuIconWell>
        <Text style={styles.tipText}>If you go over 50, you drop back to 25!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  scoreVal: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  targetBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 16 },
  targetLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.3)" },
  targetVal: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
  progressBar: { height: 10 },
  track: { height: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  key: { width: "22%", height: 54 },
  missKey: { width: "46%", height: 54 },
  backKey: { width: "46%", height: 54 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 22, color: "#FFF" },
  missText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FF4757" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 28, paddingHorizontal: 16 },
  tipText: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
});
