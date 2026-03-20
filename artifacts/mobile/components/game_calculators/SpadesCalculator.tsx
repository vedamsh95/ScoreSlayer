import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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
        <NeuButton 
          onPress={() => setMode("bid")}
          color={mode === "bid" ? player.color : "#150428"}
          borderRadius={24}
          style={styles.slot}
        >
          <View style={styles.slotInner}>
            <Text style={[styles.slotLabel, { color: mode === "bid" ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>PLAYER BID</Text>
            <Text style={[styles.slotValue, { color: mode === "bid" ? "#1A0533" : "#FFF" }]}>{bid}</Text>
          </View>
        </NeuButton>

        <View style={styles.dividerBox}>
          <NeuTrench color="#150428" borderRadius={20} padding={10} style={styles.scoreSummary}>
            <Text style={styles.summaryLabel}>PROJECTION</Text>
            <Text style={[styles.summaryValue, { color: score >= 0 ? "#00D2FF" : "#FF4757" }]}>
              {score > 0 ? `+${score}` : score}
            </Text>
          </NeuTrench>
        </View>

        <NeuButton 
          onPress={() => setMode("won")}
          color={mode === "won" ? player.color : "#150428"}
          borderRadius={24}
          style={styles.slot}
        >
          <View style={styles.slotInner}>
            <Text style={[styles.slotLabel, { color: mode === "won" ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>TRICKS WON</Text>
            <Text style={[styles.slotValue, { color: mode === "won" ? "#1A0533" : "#FFF" }]}>{won}</Text>
          </View>
        </NeuButton>
      </View>

      <View style={styles.numPadContainer}>
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
            <NeuButton
              key={num}
              onPress={() => handleKeyPress(num)}
              color="#00D2FF"
              borderRadius={16}
              style={styles.key}
            >
              <Text style={[styles.keyText, { color: "#1A0533" }]}>{num}</Text>
            </NeuButton>
          ))}
          <NeuButton 
            onPress={() => {
              setBid(0);
              setWon(0);
              setMode("bid");
            }}
            color="#FF4757"
            borderRadius={16}
            style={styles.keyReset}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
          </NeuButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 32, gap: 12 },
  slot: { flex: 1, height: 110 },
  slotInner: { alignItems: "center", justifyContent: "center" },
  slotLabel: { fontFamily: "Inter_900Black", fontSize: 8, letterSpacing: 0.5, marginBottom: 4 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 44, lineHeight: 50 },
  dividerBox: { width: 80, alignItems: "center" },
  scoreSummary: { width: "100%", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 7, color: "rgba(255,255,255,0.2)", marginBottom: 2 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 18 },
  numPadContainer: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  key: { width: "23%", height: 56 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 22, color: "#FFF" },
  keyReset: { width: "23%", height: 56 },
});
