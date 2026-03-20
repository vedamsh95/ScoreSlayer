import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface GinRummyCalculatorProps {
  player: Player;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

type GinMode = "knock" | "gin" | "big_gin" | "undercut";

export function GinRummyCalculator({ player, onUpdate }: GinRummyCalculatorProps) {
  const [mode, setMode] = useState<GinMode>("knock");
  const [myDeadwood, setMyDeadwood] = useState<string>("0");
  const [oppDeadwood, setOppDeadwood] = useState<string>("0");
  const [activeSide, setActiveSide] = useState<"me" | "opp">("me");

  const score = useMemo(() => {
    const mine = parseInt(myDeadwood) || 0;
    const opp = parseInt(oppDeadwood) || 0;

    switch (mode) {
      case "gin": return opp + 25;
      case "big_gin": return opp + 31;
      case "undercut": return (mine - opp) + 25;
      case "knock": return Math.max(0, opp - mine);
      default: return 0;
    }
  }, [mode, myDeadwood, oppDeadwood]);

  useEffect(() => {
    onUpdate(score, [myDeadwood, oppDeadwood], { mode, myDeadwood, oppDeadwood });
  }, [score, mode, myDeadwood, oppDeadwood, onUpdate]);

  const handleModeChange = (newMode: GinMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode(newMode);
    if (newMode === "gin" || newMode === "big_gin") setMyDeadwood("0");
  };

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeSide === "me") {
      setMyDeadwood(prev => (parseInt(prev) + val).toString());
    } else {
      setOppDeadwood(prev => (parseInt(prev) + val).toString());
    }
  };

  const clearValue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeSide === "me") setMyDeadwood("0");
    else setOppDeadwood("0");
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Round Ending</Text>
        <View style={styles.modeGrid}>
          {(["knock", "gin", "big_gin", "undercut"] as GinMode[]).map((m) => (
            <NeuButton
              key={m}
              onPress={() => handleModeChange(m)}
              color={mode === m ? player.color : "#150428"}
              borderRadius={16}
              style={styles.modeButton}
            >
              <View style={styles.modeInner}>
                <Text style={[styles.modeText, { color: mode === m ? "#1A0533" : "rgba(255,255,255,0.4)" }]}>
                  {m.replace("_", " ").toUpperCase()}
                </Text>
                {(m === "gin" || m === "big_gin" || m === "undercut") && (
                  <Text style={[styles.bonusText, { color: mode === m ? "#1A0533" : "#00D2FF" }]}>
                    +{m === "gin" ? "25" : m === "big_gin" ? "31" : "25"}
                  </Text>
                )}
              </View>
            </NeuButton>
          ))}
        </View>
      </View>

      <View style={styles.deadwoodRow}>
        <NeuButton 
          onPress={() => setActiveSide("me")}
          color={activeSide === "me" ? "#00D2FF" : "#150428"}
          borderRadius={24}
          style={styles.inputBox}
        >
          <View style={styles.inputInner}>
            <Text style={[styles.inputLabel, { color: activeSide === "me" ? "#1A0533" : "rgba(255,255,255,0.3)" }]}>YOUR DEADWOOD</Text>
            <View style={[styles.displayContainer, { backgroundColor: activeSide === "me" ? "rgba(26,5,51,0.1)" : "rgba(255,255,255,0.03)" }]}>
              <Text style={[styles.displayText, { color: activeSide === "me" ? "#1A0533" : "#FFF", opacity: mode === "gin" || mode === "big_gin" ? 0.3 : 1 }]}>
                {myDeadwood}
              </Text>
            </View>
          </View>
        </NeuButton>

        <NeuButton 
          onPress={() => setActiveSide("opp")}
          color={activeSide === "opp" ? "#00D2FF" : "#150428"}
          borderRadius={24}
          style={styles.inputBox}
        >
          <View style={styles.inputInner}>
            <Text style={[styles.inputLabel, { color: activeSide === "opp" ? "#1A0533" : "rgba(255,255,255,0.3)" }]}>OPPONENT'S</Text>
            <View style={[styles.displayContainer, { backgroundColor: activeSide === "opp" ? "rgba(26,5,51,0.1)" : "rgba(255,255,255,0.03)" }]}>
              <Text style={[styles.displayText, { color: activeSide === "opp" ? "#1A0533" : "#FFF" }]}>
                {oppDeadwood}
              </Text>
            </View>
          </View>
        </NeuButton>
      </View>

      <View style={styles.quickInputRow}>
        <View style={styles.quickGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <NeuButton key={num} onPress={() => addValue(num)} color="#00D2FF" borderRadius={12} style={styles.quickBtn}>
              <Text style={[styles.quickBtnText, { color: "#1A0533" }]}>
                {num === 1 ? "A" : num === 10 ? "10/F" : num}
              </Text>
            </NeuButton>
          ))}
          <NeuButton onPress={clearValue} color="#FF4757" borderRadius={12} style={[styles.quickBtn, { width: "18.5%" }]}>
            <Ionicons name="refresh" size={16} color="#FFF" />
          </NeuButton>
        </View>
      </View>

      <NeuTrench color="#150428" borderRadius={28} padding={24} style={styles.resultBox}>
        <Text style={styles.resultLabel}>Total Score Earned</Text>
        <Text style={[styles.resultValue, { color: score > 0 ? "#00D2FF" : "rgba(255,255,255,0.1)" }]}>
          {score}
        </Text>
        
        <View style={styles.badges}>
          {mode === "undercut" && (
            <View style={styles.roastBadge}>
              <MaterialCommunityIcons name="home-analytics" size={14} color="#FFF" />
              <Text style={styles.roastText}>THE GLASS HOUSE</Text>
            </View>
          )}
          {parseInt(oppDeadwood) >= 60 && (
            <View style={[styles.roastBadge, { backgroundColor: "#8E44AD" }]}>
              <MaterialCommunityIcons name="tree" size={14} color="#FFF" />
              <Text style={styles.roastText}>DEADWOOD FOREST</Text>
            </View>
          )}
        </View>
      </NeuTrench>
      
      <Text style={styles.hint}>Aces = 1 pt | Face Cards = 10 pts</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 12, letterSpacing: 1.5 },
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  modeButton: { width: "48%", height: 60 },
  modeInner: { alignItems: "center", justifyContent: "center" },
  modeText: { fontFamily: "Inter_900Black", fontSize: 11, letterSpacing: 0.5 },
  bonusText: { fontFamily: "Inter_900Black", fontSize: 10, marginTop: 2 },
  deadwoodRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  inputBox: { flex: 1, height: 100 },
  inputInner: { alignItems: "center", justifyContent: "center", width: "100%", paddingHorizontal: 8 },
  inputLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, marginBottom: 8, letterSpacing: 0.5 },
  displayContainer: { width: "100%", height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  displayText: { fontFamily: "Inter_900Black", fontSize: 24 },
  quickInputRow: { marginBottom: 24 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  quickBtn: { width: "18.5%", height: 44 },
  quickBtnText: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.5)" },
  resultBox: { alignItems: "center" },
  resultLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  resultValue: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  badges: { flexDirection: "row", gap: 8, marginTop: 12 },
  roastBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  roastText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#FFF" },
  hint: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.1)", textAlign: "center", marginTop: 20, textTransform: "uppercase", letterSpacing: 1 },
});
