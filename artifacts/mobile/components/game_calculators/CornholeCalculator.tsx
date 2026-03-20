import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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
      <NeuTrench color="#150428" borderRadius={32} padding={24} style={styles.header}>
        <Text style={[styles.scoreText, { color: player.color }]}>{totalRaw}</Text>
        <Text style={styles.scoreLabel}>raw pts</Text>
      </NeuTrench>

      <View style={styles.buttonRow}>
        <NeuButton 
          onPress={() => increment("holes")}
          color="#00D2FF" // Sea Blue
          borderRadius={24}
          style={styles.button}
        >
          <View style={styles.buttonInner}>
            <NeuIconWell color="rgba(26,5,51,0.2)" size={64} borderRadius={32}>
              <MaterialCommunityIcons name="star-circle" size={40} color="#1A0533" />
            </NeuIconWell>
            <Text style={styles.buttonVal}>+3 Hole</Text>
            <Text style={styles.countText}>{stats.holes} in</Text>
          </View>
        </NeuButton>

        <NeuButton 
          onPress={() => increment("board")}
          color={player.color}
          borderRadius={24}
          style={styles.button}
        >
          <View style={styles.buttonInner}>
            <NeuIconWell color="rgba(26,5,51,0.2)" size={64} borderRadius={32}>
              <MaterialCommunityIcons name="record-circle-outline" size={40} color="#1A0533" />
            </NeuIconWell>
            <Text style={styles.buttonVal}>+1 Board</Text>
            <Text style={styles.countText}>{stats.board} on</Text>
          </View>
        </NeuButton>
      </View>

      <NeuButton onPress={reset} color="#FF4757" borderRadius={18} style={styles.resetBtn}>
        <View style={styles.resetInner}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.resetText}>Reset Hole Counters</Text>
        </View>
      </NeuButton>

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.2)" />
        <Text style={styles.hintText}>Cancellation points will be applied automatically after submission.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 12, marginBottom: 32 },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 72 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 14, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  buttonRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  button: { flex: 1, height: 180 },
  buttonInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  buttonVal: { fontFamily: "Inter_900Black", fontSize: 16, color: "#1A0533" },
  countText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(26,5,51,0.5)" },
  resetBtn: { width: "100%", height: 52, marginBottom: 20 },
  resetInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  resetText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  hintBox: { flexDirection: "row", gap: 8, paddingHorizontal: 16, opacity: 0.4 },
  hintText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 },
});
