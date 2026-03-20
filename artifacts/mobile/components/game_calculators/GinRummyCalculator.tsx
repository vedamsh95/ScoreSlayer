import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";

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
      case "undercut": return (mine - opp) + 25; // Awarded to the opponent usually, but here 'player' is the one scoring
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Round Ending</Text>
        <View style={styles.modeGrid}>
          {(["knock", "gin", "big_gin", "undercut"] as GinMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => handleModeChange(m)}
              style={[
                styles.modeButton,
                mode === m && { backgroundColor: player.color + "22", borderColor: player.color }
              ]}
            >
              <Text style={[styles.modeText, mode === m && { color: "#FFF" }]}>
                {m.replace("_", " ").toUpperCase()}
              </Text>
              {m === "gin" && <Text style={styles.bonusText}>+25</Text>}
              {m === "big_gin" && <Text style={styles.bonusText}>+31</Text>}
              {m === "undercut" && <Text style={styles.bonusText}>+25</Text>}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.deadwoodRow}>
        <Pressable 
          onPress={() => setActiveSide("me")}
          style={[styles.inputBox, activeSide === "me" && styles.activeSide]}
        >
          <Text style={styles.inputLabel}>YOUR DEADWOOD</Text>
          <TextInput
            style={[styles.input, mode === "gin" || mode === "big_gin" ? styles.inputDisabled : null]}
            value={myDeadwood}
            onChangeText={setMyDeadwood}
            keyboardType="numeric"
            editable={mode !== "gin" && mode !== "big_gin"}
            selectTextOnFocus
            onFocus={() => setActiveSide("me")}
          />
        </Pressable>

        <Pressable 
          onPress={() => setActiveSide("opp")}
          style={[styles.inputBox, activeSide === "opp" && styles.activeSide]}
        >
          <Text style={styles.inputLabel}>OPPONENT'S</Text>
          <TextInput
            style={styles.input}
            value={oppDeadwood}
            onChangeText={setOppDeadwood}
            keyboardType="numeric"
            selectTextOnFocus
            onFocus={() => setActiveSide("opp")}
          />
        </Pressable>
      </View>

      <View style={styles.quickInputRow}>
        <View style={styles.quickGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Pressable key={num} onPress={() => addValue(num)} style={styles.quickBtn}>
              <Text style={styles.quickBtnText}>{num === 1 ? "A (1)" : num === 10 ? "10/F" : num}</Text>
            </Pressable>
          ))}
          <Pressable onPress={clearValue} style={[styles.quickBtn, { backgroundColor: "rgba(255,71,87,0.1)", width: "18.5%" }]}>
            <Ionicons name="refresh" size={16} color="#FF4757" />
          </Pressable>
        </View>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Total Score Earned</Text>
        <Text style={[styles.resultValue, { color: score > 0 ? "#00F5A0" : "#FFF" }]}>
          {score}
        </Text>
        
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
      
      <Text style={styles.hint}>Aces = 1 pt | Face Cards = 10 pts</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 },
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeButton: { width: "48%", backgroundColor: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", alignItems: "center" },
  modeText: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  bonusText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#00F5A0", marginTop: 2 },
  deadwoodRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  inputBox: { flex: 1, padding: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "transparent" },
  activeSide: { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" },
  inputLabel: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 6, textAlign: "center" },
  input: { backgroundColor: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", color: "#FFF", fontFamily: "Inter_900Black", fontSize: 20, textAlign: "center" },
  inputDisabled: { opacity: 0.3 },
  quickInputRow: { marginBottom: 24 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  quickBtn: { width: "18.5%", height: 38, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: "rgba(0,0,0,0.2)" },
  quickBtnText: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "#FFF" },
  resultBox: { alignItems: "center", paddingVertical: 24, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  resultLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  resultValue: { fontFamily: "Inter_900Black", fontSize: 48 },
  roastBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  roastText: { fontFamily: "Inter_900Black", fontSize: 10, color: "#FFF" },
  hint: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.15)", textAlign: "center", marginTop: 12 },
});
