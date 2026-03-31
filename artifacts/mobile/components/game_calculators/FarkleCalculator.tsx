import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface FarkleCalculatorProps {
  player: Player;
  initialLogs?: number[];
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function FarkleCalculator({ player, initialLogs, initialMetadata, onUpdate }: FarkleCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || initialMetadata?.logs || []);
  const [currentTurn, setCurrentTurn] = useState<number>(initialMetadata?.currentTurn || 0);

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const total = useMemo(() => {
    const logTotal = logs.reduce((a, b) => a + b, 0);
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return logTotal + manualTotal;
  }, [logs, manualLogs]);

  useEffect(() => {
    onUpdate(total, logs, { currentTurn, logs, manualLogs, dynamicQuickAdds });
  }, [total, logs, currentTurn, manualLogs, dynamicQuickAdds, onUpdate]);

  const addScore = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTurn(prev => prev + val);
  };

  const commitTurn = () => {
    if (currentTurn === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogs(prev => [...prev, currentTurn]);
    setCurrentTurn(0);
  };

  const farkle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setLogs(prev => [...prev, 0]);
    setCurrentTurn(0);
  };

  const removeLast = () => {
    if (logs.length === 0 && currentTurn === 0 && manualLogs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentTurn > 0) {
      setCurrentTurn(0);
    } else if (logs.length > 0) {
      setLogs(prev => prev.slice(0, -1));
    } else {
      setManualLogs(prev => prev.slice(0, -1));
    }
  };

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // For Farkle, treat manual add as a committed turn or just a direct add?
      // Standardizing as manualLog for consistency across all.
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

  const quickScores = [
    { label: "1s (x3)", val: 1000, color: "#FF4757" },
    { label: "5s (x3)", val: 500, color: "#FFA502" },
    { label: "Single 1", val: 100, color: "#FF6B6B" },
    { label: "Single 5", val: 50, color: "#FFD32A" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.roundTitle}>TURN TOTAL</Text>
            <Text style={[styles.turnScore, { color: player.color }]}>+{currentTurn}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.roundTitle}>GRAND TOTAL</Text>
            <Text style={styles.grandTotal}>{total + currentTurn}</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholder}>Roll dice to start scoring...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: val > 0 ? player.color + "15" : "#FF475722" }]}>
                <Text style={[styles.logChipText, { color: val > 0 ? player.color : "#FF4757" }]}>
                  {val === 0 ? "FARKLE" : `+${val}`}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      {/* Manual Input Row */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Adjustment</Text>
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

      <Text style={styles.sectionTitle}>Quick Combos</Text>
      <View style={styles.quickGrid}>
        {quickScores.map((s, i) => (
          <NeuButton key={i} onPress={() => addScore(s.val)} color="#150428" borderRadius={16} style={styles.quickKey}>
            <Text style={[styles.quickVal, { color: s.color }]}>+{s.val}</Text>
            <Text style={styles.quickLabel}>{s.label}</Text>
          </NeuButton>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Turn Increments</Text>
      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 10].map(n => (
          <NeuButton key={n} onPress={() => addScore(n * 100)} color="#00D2FF" borderRadius={12} style={styles.key}>
            <Text style={styles.keyText}>+{n * 100}</Text>
          </NeuButton>
        ))}
      </View>

      <View style={styles.actionRow}>
        <NeuButton onPress={farkle} color="#FF4757" borderRadius={18} style={styles.farkleBtn}>
          <Text style={styles.farkleText}>FARKLE</Text>
        </NeuButton>
        <NeuButton onPress={commitTurn} color="#00F5A0" borderRadius={18} style={styles.bankBtn}>
          <Text style={styles.bankText}>BANK TURN</Text>
        </NeuButton>
        <NeuButton onPress={removeLast} color="#150428" borderRadius={18} style={styles.backBtn}>
          <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.4)" />
        </NeuButton>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16, marginTop: 8 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  roundTitle: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  turnScore: { fontFamily: "Inter_900Black", fontSize: 48, lineHeight: 52 },
  grandTotal: { fontFamily: "Inter_900Black", fontSize: 28, color: "rgba(255,255,255,0.4)" },
  logStrip: { flexDirection: "row", height: 26 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 11 },
  placeholder: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.1)" },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 12 },
  quickGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickKey: { flex: 1, height: 74 },
  quickVal: { fontFamily: "Inter_900Black", fontSize: 16 },
  quickLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginTop: 2 },
  numpad: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  key: { width: "31%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#1A0533" },
  manualSection: { marginBottom: 12 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGridShortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  actionRow: { flexDirection: "row", gap: 10 },
  farkleBtn: { flex: 1, height: 56 },
  bankBtn: { flex: 2, height: 56 },
  backBtn: { width: 56, height: 56 },
  farkleText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  bankText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#1A0533" },
});
