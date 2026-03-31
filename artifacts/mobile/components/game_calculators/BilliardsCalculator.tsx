import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface BilliardsCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialLogs?: number[];
  initialMetadata?: any;
}

export function BilliardsCalculator({ player, game, onUpdate, initialLogs, initialMetadata }: BilliardsCalculatorProps) {
  const [history, setHistory] = useState<number[]>(initialLogs || initialMetadata?.history || []);
  const [currentRun, setCurrentRun] = useState(initialMetadata?.currentRun || 0);
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    const historicalTotal = history.reduce((a, b) => a + b, 0);
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return historicalTotal + currentRun + manualTotal;
  }, [history, currentRun, manualLogs]);

  const targetScore = game.targetScore || 100;
  const progress = Math.min(1, totalScore / targetScore);

  useEffect(() => {
    onUpdate(totalScore, history, { currentRun, history, manualLogs, dynamicQuickAdds });
  }, [totalScore, history, currentRun, manualLogs, dynamicQuickAdds, onUpdate]);

  const addBall = () => {
    setCurrentRun(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFoul = () => {
    setHistory(prev => [...prev, -1]);
    setCurrentRun(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const endRun = () => {
    if (currentRun > 0) {
      setHistory(prev => [...prev, currentRun]);
      setCurrentRun(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const undoLast = () => {
    if (currentRun > 0) {
      setCurrentRun(prev => prev - 1);
    } else if (history.length > 0) {
      setHistory(prev => prev.slice(0, -1));
    } else if (manualLogs.length > 0) {
      setManualLogs(prev => prev.slice(0, -1));
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <NeuTrench color="#150428" borderRadius={24} padding={20} style={styles.progressHeader}>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Total Points</Text>
          <Text style={[styles.scoreValue, { color: player.color }]}>{totalScore}</Text>
        </View>
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>Goal: {targetScore}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: player.color }]} />
          </View>
        </View>
      </NeuTrench>

      <View style={styles.runCard}>
        <Text style={[styles.runLabel, { color: player.color }]}>Current Run</Text>
        <Text style={[styles.runValue, { color: player.color }]}>{currentRun}</Text>
      </View>

      <View style={styles.mainControls}>
        <NeuButton 
          onPress={addBall} 
          color="#00D2FF"
          borderRadius={24}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="billiards" size={48} color="#1A0533" />
          <Text style={styles.addBtnText}>+1 Ball</Text>
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
                style={styles.shortcutKey}
              >
                <Text style={styles.shortcutKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <NeuButton onPress={handleFoul} color="#FF4757" borderRadius={18} style={styles.actionBtn}>
          <Ionicons name="alert-circle" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Foul (-1)</Text>
        </NeuButton>
        <NeuButton onPress={endRun} color="#00F5A0" borderRadius={18} style={styles.actionBtn}>
          <Ionicons name="checkmark-circle" size={20} color="#1A0533" />
          <Text style={[styles.actionBtnText, { color: "#1A0533" }]}>End Run</Text>
        </NeuButton>
      </View>

      <Pressable onPress={undoLast} style={styles.undoRow}>
        <NeuIconWell color="#150428" size={36} borderRadius={10}>
          <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.4)" />
        </NeuIconWell>
        <Text style={styles.undoText}>Undo Last Entry</Text>
      </Pressable>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Run History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No runs yet</Text>
          ) : (
            history.map((run, i) => (
              <NeuTrench 
                key={i} 
                color={run < 0 ? "rgba(231, 76, 60, 0.2)" : "#150428"} 
                borderRadius={12} 
                padding={10} 
                style={styles.historyItem}
              >
                <Text style={[styles.historyValue, run < 0 && { color: "#FF4757" }]}>
                  {run < 0 ? "F" : run}
                </Text>
              </NeuTrench>
            ))
          )}
        </ScrollView>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  scoreInfo: { gap: 2 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 44 },
  targetInfo: { flex: 1, marginLeft: 24, gap: 8 },
  targetLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%" },
  runCard: { alignItems: "center", justifyContent: "center", marginBottom: 16 },
  runLabel: { fontFamily: "Inter_900Black", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, opacity: 0.6 },
  runValue: { fontFamily: "Inter_900Black", fontSize: 84, lineHeight: 90 },
  mainControls: { marginBottom: 16 },
  addBtn: { width: "100%", height: 120 },
  addBtnText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#1A0533" },
  manualSection: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, height: 56 },
  actionBtnText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF" },
  undoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 },
  undoText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.3)" },
  historySection: { gap: 12 },
  historyTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5 },
  historyScroll: { flexDirection: "row" },
  historyItem: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: 8 },
  historyValue: { fontFamily: "Inter_900Black", fontSize: 16, color: "rgba(255,255,255,0.5)" },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.1)", paddingVertical: 12 },
});
