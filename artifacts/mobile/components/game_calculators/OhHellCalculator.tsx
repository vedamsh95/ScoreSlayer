import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface OhHellCalculatorProps {
  player: Player;
  initialBid?: number;
  initialWon?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function OhHellCalculator({ player, initialBid = 0, initialWon = 0, onUpdate }: OhHellCalculatorProps) {
  const [bid, setBid] = useState<number>(initialBid);
  const [won, setWon] = useState<number>(initialWon);
  const [mode, setMode] = useState<"bid" | "won">("bid");

  const score = useMemo(() => {
    if (bid === won) {
      return 10 + won; // Standard: 10 bonus + 1 per trick
    }
    return 0; // Standard: 0 if bid not met
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
            <Text style={[styles.slotLabel, { color: mode === "bid" ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>BID</Text>
            <Text style={[styles.slotValue, { color: mode === "bid" ? "#1A0533" : "#FFF" }]}>{bid}</Text>
          </View>
        </NeuButton>

        <View style={styles.dividerBox}>
          <NeuTrench color="#150428" borderRadius={20} padding={10} style={styles.scoreSummary}>
            <Text style={styles.summaryLabel}>VP</Text>
            <Text style={[styles.summaryValue, { color: score > 0 ? "#00D2FF" : "rgba(255,255,255,0.2)" }]}>
              +{score}
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
            <Text style={[styles.slotLabel, { color: mode === "won" ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>WON</Text>
            <Text style={[styles.slotValue, { color: mode === "won" ? "#1A0533" : "#FFF" }]}>{won}</Text>
          </View>
        </NeuButton>
      </View>

      <View style={styles.tipBox}>
        <NeuIconWell color="rgba(46,204,113,0.15)" size={40} borderRadius={12}>
          <Ionicons name="trending-up" size={24} color="#2ECC71" />
        </NeuIconWell>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>OH HELL! SCORING</Text>
          <Text style={styles.tipSub}>10 points for a correct bid + 1 per trick. Incorrect bid = 0 points.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Numeric Input</Text>
      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <NeuButton key={num} onPress={() => handleKeyPress(num)} color="#00D2FF" borderRadius={14} style={styles.key}>
            <Text style={[styles.keyText, { color: "#1A0533" }]}>{num}</Text>
          </NeuButton>
        ))}
        <NeuButton onPress={() => { setBid(0); setWon(0); setMode("bid"); }} color="#FF4757" borderRadius={14} style={styles.key}>
          <Ionicons name="refresh" size={20} color="#FFF" />
        </NeuButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  slot: { flex: 1, height: 100 },
  slotInner: { alignItems: "center", justifyContent: "center" },
  slotLabel: { fontFamily: "Inter_900Black", fontSize: 8, letterSpacing: 0.5, marginBottom: 2 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 40, lineHeight: 46 },
  dividerBox: { width: 70, alignItems: "center" },
  scoreSummary: { width: "100%", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 8, color: "rgba(255,255,255,0.2)" },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 16 },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 24, marginBottom: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontFamily: "Inter_900Black", fontSize: 12, color: "#2ECC71", letterSpacing: 0.5 },
  tipSub: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  key: { width: "23%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
});
