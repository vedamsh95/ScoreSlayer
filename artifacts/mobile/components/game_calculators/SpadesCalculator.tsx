import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface SpadesCalculatorProps {
  player: Player;
  initialBid?: number;
  initialWon?: number;
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SpadesCalculator({ player, initialBid, initialWon, initialMetadata, onUpdate }: SpadesCalculatorProps) {
  const [bid, setBid] = useState<number>(initialBid ?? 0);
  const [won, setWon] = useState<number>(initialWon ?? 0);
  const [mode, setMode] = useState<"bid" | "won">("bid");
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const calculatedScore = useMemo(() => {
    if (bid === 0) return (won === 0) ? 100 : -100; // Nil
    if (won < bid) return -(bid * 10); // Set
    return (bid * 10) + (won - bid); // Made
  }, [bid, won]);

  const totalScore = useMemo(() => {
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return calculatedScore + manualTotal;
  }, [calculatedScore, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, [won, ...manualLogs], { bid, won, manualLogs, dynamicQuickAdds });
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
            <Text style={styles.summaryLabel}>TOTAL</Text>
            <Text style={[styles.summaryValue, { color: totalScore >= 0 ? "#00D2FF" : "#FF4757" }]}>
              {totalScore > 0 ? `+${totalScore}` : totalScore}
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Manual Input Row */}
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

        {dynamicQuickAdds.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Custom Shortcuts</Text>
            <View style={styles.quickGrid}>
              {dynamicQuickAdds.map((val, idx) => (
                <NeuButton
                  key={`shortcut-${idx}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setManualLogs(prev => [...prev, val]);
                  }}
                  color="#8B5CF6"
                  borderRadius={14}
                  style={styles.quickKey}
                >
                  <Text style={styles.quickKeyText}>+{val}</Text>
                </NeuButton>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Numeric Input (Bid/Won)</Text>
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
              setManualLogs([]);
              setMode("bid");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }}
            color="#FF4757"
            borderRadius={16}
            style={styles.keyReset}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
          </NeuButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 },
  slot: { flex: 1, height: 110 },
  slotInner: { alignItems: "center", justifyContent: "center" },
  slotLabel: { fontFamily: "Inter_900Black", fontSize: 8, letterSpacing: 0.5, marginBottom: 4 },
  slotValue: { fontFamily: "Inter_900Black", fontSize: 44, lineHeight: 50 },
  dividerBox: { width: 80, alignItems: "center" },
  scoreSummary: { width: "100%", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_700Bold", fontSize: 7, color: "rgba(255,255,255,0.2)", marginBottom: 2 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 18 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 30 },
  key: { width: "22%", height: 56 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 22, color: "#1A0533" },
  keyReset: { width: "22%", height: 56 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
