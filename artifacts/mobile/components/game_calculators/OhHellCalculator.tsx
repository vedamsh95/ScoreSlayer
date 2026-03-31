import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface OhHellCalculatorProps {
  player: Player;
  initialBid?: number;
  initialWon?: number;
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function OhHellCalculator({ player, initialBid = 0, initialWon = 0, initialMetadata, onUpdate }: OhHellCalculatorProps) {
  const [bid, setBid] = useState<number>(initialBid || initialMetadata?.bid || 0);
  const [won, setWon] = useState<number>(initialWon || initialMetadata?.won || 0);
  const [mode, setMode] = useState<"bid" | "won">("bid");

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    let score = 0;
    if (bid === won) {
      score = 10 + won; // Standard: 10 bonus + 1 per trick
    } else {
      score = 0;
    }
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return score + manualTotal;
  }, [bid, won, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, manualLogs, { bid, won, manualLogs, dynamicQuickAdds });
  }, [totalScore, bid, won, manualLogs, dynamicQuickAdds, onUpdate]);

  const handleKeyPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "bid") {
      setBid(num);
      setMode("won");
    } else {
      setWon(num);
    }
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

  const resetAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBid(0);
    setWon(0);
    setManualLogs([]);
    setMode("bid");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            <Text style={[styles.summaryValue, { color: totalScore > 0 ? "#00D2FF" : "rgba(255,255,255,0.2)" }]}>
              +{totalScore}
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

      {/* Manual Input Row */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Entry & Shortcuts</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Custom Pts..."
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
        <View style={styles.shortcutsSection}>
          <View style={styles.quickGridShortcuts}>
            {dynamicQuickAdds.map((val, idx) => (
              <NeuButton
                key={`shortcut-${idx}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setManualLogs(prev => [...prev, val]);
                }}
                color="#8B5CF6"
                borderRadius={14}
                style={styles.shortcutKey}
              >
                <Text style={styles.shortcutKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

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
        <NeuButton onPress={resetAll} color="#FF4757" borderRadius={14} style={styles.key}>
          <Ionicons name="refresh" size={20} color="#FFF" />
        </NeuButton>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 8, gap: 10 },
  slot: { flex: 1, height: 90 },
  slotInner: { alignItems: "center", justifyContent: "center" },
  slotLabel: { fontFamily: "Inter_900Black", fontSize: 8, letterSpacing: 0.5, marginBottom: 2 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 40, lineHeight: 46 },
  dividerBox: { width: 70, alignItems: "center" },
  scoreSummary: { width: "100%", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 8, color: "rgba(255,255,255,0.2)" },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 16 },
  manualSection: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGridShortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 24, marginBottom: 20 },
  tipContent: { flex: 1 },
  tipTitle: { fontFamily: "Inter_900Black", fontSize: 12, color: "#2ECC71", letterSpacing: 0.5 },
  tipSub: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  key: { width: "23%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20 },
});
