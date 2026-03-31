import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface GinRummyCalculatorProps {
  player: Player;
  initialMetadata?: any;
  alreadyDeclaredPlayerName?: string | null;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

type GinMode = "knock" | "gin" | "big_gin" | "undercut";

export function GinRummyCalculator({ 
  player, 
  initialMetadata, 
  alreadyDeclaredPlayerName,
  onUpdate 
}: GinRummyCalculatorProps) {
  const [mode, setMode] = useState<GinMode>(initialMetadata?.mode || "knock");
  const [myDeadwood, setMyDeadwood] = useState<string>(initialMetadata?.myDeadwood || "0");
  const [oppDeadwood, setOppDeadwood] = useState<string>(initialMetadata?.oppDeadwood || "0");
  const [activeSide, setActiveSide] = useState<"me" | "opp">("me");
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const calculatedBase = useMemo(() => {
    const mine = parseInt(myDeadwood) || 0;
    const opp = parseInt(oppDeadwood) || 0;

    switch (mode) {
      case "gin": return opp + 25;
      case "big_gin": return opp + 31;
      case "undercut": return Math.max(0, opp - mine) + 25;
      case "knock": return Math.max(0, opp - mine);
      default: return 0;
    }
  }, [mode, myDeadwood, oppDeadwood]);

  const totalScore = useMemo(() => {
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return calculatedBase + manualTotal;
  }, [calculatedBase, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, [myDeadwood, oppDeadwood, ...manualLogs], { 
      mode, 
      myDeadwood, 
      oppDeadwood, 
      manualLogs, 
      cleared: totalScore > 0,
      dynamicQuickAdds 
    });
  }, [totalScore, mode, myDeadwood, oppDeadwood, manualLogs, dynamicQuickAdds, onUpdate]);

  const handleModeChange = (newMode: GinMode) => {
    if (alreadyDeclaredPlayerName) {
      Alert.alert(
        "Round Already Ended",
        `${alreadyDeclaredPlayerName} has already declared a win/score for this round. In Gin Rummy, only one player scores per round.`,
        [{ text: "OK" }]
      );
      return;
    }
    
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

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setManualLogs(prev => [...prev, val]);
      setManualValue("");
    }
  };

  const handleSaveAsShortcut = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val) && !dynamicQuickAdds.includes(val)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDynamicQuickAdds(prev => [...prev, val]);
      setManualValue("");
    }
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tap Input</Text>
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

      {/* Manual Input Row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Entry</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Manual Pts..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="numeric"
              onSubmitEditing={handleManualAdd}
            />
          </NeuTrench>
          <View style={styles.manualActionGroup}>
            <Pressable onPress={handleManualAdd} style={styles.manualAddBtn}>
              <NeuIconWell color="rgba(0, 245, 160, 0.1)" size={48} borderRadius={14}>
                <Feather name="plus" size={24} color="#00F5A0" />
              </NeuIconWell>
            </Pressable>
            <Pressable onPress={handleSaveAsShortcut} style={[styles.manualAddBtn, { marginLeft: 8 }]}>
              <NeuIconWell color="rgba(139, 92, 246, 0.1)" size={48} borderRadius={14}>
                <MaterialCommunityIcons name="star-plus" size={24} color="#8B5CF6" />
              </NeuIconWell>
            </Pressable>
          </View>
        </View>
      </View>

      {dynamicQuickAdds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Shortcuts</Text>
          <View style={styles.shortcutsGrid}>
            {dynamicQuickAdds.map((val, idx) => (
              <NeuButton
                key={`shortcut-${idx}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setManualLogs(prev => [...prev, val]);
                }}
                color="#8B5CF6"
                borderRadius={14}
                style={styles.shortcutBtn}
              >
                <Text style={styles.shortcutText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

      <NeuTrench color="#150428" borderRadius={28} padding={24} style={styles.resultBox}>
        <Text style={styles.resultLabel}>Total Score Earned</Text>
        <Text style={[styles.resultValue, { color: totalScore > 0 ? "#00D2FF" : "rgba(255,255,255,0.1)" }]}>
          {totalScore}
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
  section: { marginBottom: 20 },
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
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  quickBtn: { width: "18.5%", height: 44 },
  quickBtnText: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.5)" },
  resultBox: { alignItems: "center", marginBottom: 30 },
  resultLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  resultValue: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  badges: { flexDirection: "row", gap: 8, marginTop: 12 },
  roastBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  roastText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#FFF" },
  hint: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.1)", textAlign: "center", marginTop: 20, textTransform: "uppercase", letterSpacing: 1 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 0 },
  shortcutBtn: { width: "23%", height: 44 },
  shortcutText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
