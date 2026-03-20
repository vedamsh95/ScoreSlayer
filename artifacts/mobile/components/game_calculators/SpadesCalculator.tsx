import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";

interface SpadesCalculatorProps {
  player: Player;
  initialBid?: number;
  initialWon?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SpadesCalculator({ player, initialBid, initialWon, onUpdate }: SpadesCalculatorProps) {
  const [bid, setBid] = useState<number>(initialBid ?? 0);
  const [won, setWon] = useState<number>(initialWon ?? 0);
  const [mode, setMode] = useState<"bid" | "won">("bid");

  const score = useMemo(() => {
    if (bid === 0) return (won === 0) ? 100 : -100; // Nil
    if (won < bid) return -(bid * 10); // Set
    return (bid * 10) + (won - bid); // Made
  }, [bid, won]);

  useEffect(() => {
    onUpdate(score, [won], { bid, won });
  }, [score, bid, won, onUpdate]);

  const handleKeyPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "bid") {
      setBid(num);
      setMode("won");
    } else {
      setWon(num);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayRow}>
        <Pressable 
          onPress={() => setMode("bid")}
          style={[styles.slot, mode === "bid" && { backgroundColor: player.color + "22", borderColor: player.color }]}
        >
          <Text style={styles.slotLabel}>BID</Text>
          <Text style={[styles.slotValue, { color: mode === "bid" ? player.color : "#FFF" }]}>{bid}</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable 
          onPress={() => setMode("won")}
          style={[styles.slot, mode === "won" && { backgroundColor: player.color + "22", borderColor: player.color }]}
        >
          <Text style={styles.slotLabel}>WON</Text>
          <Text style={[styles.slotValue, { color: mode === "won" ? player.color : "#FFF" }]}>{won}</Text>
        </Pressable>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Projected Score</Text>
        <Text style={[styles.summaryValue, { color: score >= 0 ? "#00F5A0" : "#FF4757" }]}>
          {score > 0 ? `+${score}` : score}
        </Text>
      </View>

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
          <Pressable
            key={num}
            onPress={() => handleKeyPress(num)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyText}>{num}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, height: 100 },
  slot: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%", borderRadius: 20, borderWidth: 2, borderColor: "transparent", backgroundColor: "rgba(255,255,255,0.02)" },
  slotLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 36 },
  divider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 12 },
  summaryBox: { alignItems: "center", marginBottom: 32 },
  summaryLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  key: { width: "23%", height: 50, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
});
