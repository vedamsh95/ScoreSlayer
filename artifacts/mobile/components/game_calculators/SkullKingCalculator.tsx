import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface SkullKingCalculatorProps {
  player: Player;
  round: number;
  initialBid?: number;
  initialWon?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SkullKingCalculator({ player, round, initialBid = 0, initialWon = 0, onUpdate }: SkullKingCalculatorProps) {
  const [bid, setBid] = useState<number>(initialBid);
  const [won, setWon] = useState<number>(initialWon);
  const [captures, setCaptures] = useState<number>(0); // Skull King capturing Pirates
  const [mode, setMode] = useState<"bid" | "won">("bid");

  const score = useMemo(() => {
    if (bid === 0) {
      return (won === 0) ? round * 10 : -(round * 10);
    }
    if (bid === won) {
      return (bid * 20) + (captures * 30); // Standard is 20 per trick + bonuses
    }
    return -(Math.abs(bid - won) * 10);
  }, [bid, won, captures, round]);

  useEffect(() => {
    onUpdate(score, [won], { bid, won, captures });
  }, [score, bid, won, captures, onUpdate]);

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
            <Text style={[styles.slotLabel, { color: mode === "won" ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>WON</Text>
            <Text style={[styles.slotValue, { color: mode === "won" ? "#1A0533" : "#FFF" }]}>{won}</Text>
          </View>
        </NeuButton>
      </View>

      <View style={styles.bonusArea}>
        <Text style={styles.sectionTitle}>Skull King Bonuses</Text>
        <View style={styles.bonusRow}>
          <View style={styles.bonusInfo}>
            <Text style={styles.bonusLabel}>Pirates Captured</Text>
            <Text style={styles.bonusSub}>+30 pts each (only if bid is made)</Text>
          </View>
          <View style={styles.stepper}>
             <NeuButton onPress={() => setCaptures(Math.max(0, captures - 1))} color="#150428" borderRadius={10} style={styles.stepBtn}>
                <Ionicons name="remove" size={14} color="rgba(255,255,255,0.4)" />
             </NeuButton>
             <Text style={styles.stepVal}>{captures}</Text>
             <NeuButton onPress={() => setCaptures(captures + 1)} color="#00D2FF" borderRadius={10} style={styles.stepBtn}>
                <Ionicons name="add" size={14} color="#1A0533" />
             </NeuButton>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Numeric Input</Text>
      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <NeuButton key={num} onPress={() => handleKeyPress(num)} color="#00D2FF" borderRadius={14} style={styles.key}>
            <Text style={[styles.keyText, { color: "#1A0533" }]}>{num}</Text>
          </NeuButton>
        ))}
        <NeuButton onPress={() => { setBid(0); setWon(0); setCaptures(0); setMode("bid"); }} color="#FF4757" borderRadius={14} style={styles.key}>
          <Ionicons name="refresh" size={20} color="#FFF" />
        </NeuButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 28, gap: 10 },
  slot: { flex: 1, height: 100 },
  slotInner: { alignItems: "center", justifyContent: "center" },
  slotLabel: { fontFamily: "Inter_900Black", fontSize: 8, letterSpacing: 0.5, marginBottom: 2 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 40, lineHeight: 46 },
  dividerBox: { width: 70, alignItems: "center" },
  scoreSummary: { width: "100%", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 8, color: "rgba(255,255,255,0.2)" },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 16 },
  bonusArea: { marginBottom: 24, padding: 16, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 20 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  bonusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bonusInfo: { flex: 1 },
  bonusLabel: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF" },
  bonusSub: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32 },
  stepVal: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", minWidth: 20, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  key: { width: "23%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
});
