import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";

interface CornholeCalculatorProps {
  player: Player;
  initialStats?: { holes: number; board: number };
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function CornholeCalculator({ player, initialStats, onUpdate }: CornholeCalculatorProps) {
  const [stats, setStats] = useState({
    holes: initialStats?.holes || 0,
    board: initialStats?.board || 0,
  });

  const totalRaw = useMemo(() => stats.holes * 3 + stats.board, [stats]);

  useEffect(() => {
    const roasts: string[] = [];
    if (totalRaw === 0) {
      roasts.push("Did you even throw the bags? 🤡");
    } else if (stats.holes >= 4) {
      roasts.push("Literal machine. 4/4 holes?! 🎯");
    }
    
    onUpdate(totalRaw, [stats.holes, stats.board], { ...stats, roasts });
  }, [totalRaw, stats, onUpdate]);

  const increment = (type: "holes" | "board") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStats(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const reset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setStats({ holes: 0, board: 0 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.scoreText, { color: player.color }]}>{totalRaw}</Text>
        <Text style={styles.scoreLabel}>raw pts</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable 
          onPress={() => increment("holes")}
          style={({ pressed }) => [
            styles.button,
            { borderColor: player.color + "44", backgroundColor: "rgba(255,255,255,0.03)" },
            pressed && { backgroundColor: player.color + "22" }
          ]}
        >
          <MaterialCommunityIcons name="star-circle" size={40} color={player.color} />
          <Text style={styles.buttonVal}>+3 Hole</Text>
          <Text style={styles.countText}>{stats.holes} in</Text>
        </Pressable>

        <Pressable 
          onPress={() => increment("board")}
          style={({ pressed }) => [
            styles.button,
            { borderColor: player.color + "44", backgroundColor: "rgba(255,255,255,0.03)" },
            pressed && { backgroundColor: player.color + "22" }
          ]}
        >
          <MaterialCommunityIcons name="record-circle-outline" size={40} color={player.color} />
          <Text style={styles.buttonVal}>+1 Board</Text>
          <Text style={styles.countText}>{stats.board} on</Text>
        </Pressable>
      </View>

      <Pressable onPress={reset} style={styles.resetBtn}>
        <Ionicons name="trash-outline" size={20} color="#FF4757" />
        <Text style={styles.resetText}>Reset Hole Counters</Text>
      </Pressable>

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.3)" />
        <Text style={styles.hintText}>Cancellation points will be applied automatically after submission.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 30 },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 64 },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 18, color: "rgba(255,255,255,0.3)" },
  buttonRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  button: { flex: 1, height: 160, borderRadius: 24, borderWidth: 2, alignItems: "center", justifyContent: "center", gap: 10 },
  buttonVal: { fontFamily: "Inter_800ExtraBold", fontSize: 16, color: "#FFF" },
  countText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, backgroundColor: "rgba(255,71,87,0.1)", borderRadius: 16, marginBottom: 20 },
  resetText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FF4757" },
  hintBox: { flexDirection: "row", gap: 8, paddingHorizontal: 16, opacity: 0.6 },
  hintText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.5)", flex: 1 },
});
