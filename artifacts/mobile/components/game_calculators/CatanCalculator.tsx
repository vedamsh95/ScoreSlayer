import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface CatanCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
  initialMetadata?: any;
}

export function CatanCalculator({ player, game, onUpdate, initialStats, initialMetadata }: CatanCalculatorProps) {
  const [stats, setStats] = useState({
    settlements: initialStats?.settlements || initialMetadata?.stats?.settlements || 0,
    cities: initialStats?.cities || initialMetadata?.stats?.cities || 0,
    vpCards: initialStats?.vpCards || initialMetadata?.stats?.vpCards || 0,
    longestRoad: initialStats?.longestRoad || initialMetadata?.stats?.longestRoad || false,
    largestArmy: initialStats?.largestArmy || initialMetadata?.stats?.largestArmy || false,
    harborMaster: initialStats?.harborMaster || initialMetadata?.stats?.harborMaster || false,
  });

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const hasHarborMaster = useMemo(() => {
    return game.houseRules.find(r => r.ruleId === "harbor_master")?.currentValue === 1;
  }, [game.houseRules]);

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.settlements * 1;
    score += stats.cities * 2;
    score += stats.vpCards * 1;
    if (stats.longestRoad) score += 2;
    if (stats.largestArmy) score += 2;
    if (stats.harborMaster) score += 2;
    
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return score + manualTotal;
  }, [stats, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, manualLogs, { stats, manualLogs, dynamicQuickAdds });
  }, [totalScore, stats, manualLogs, dynamicQuickAdds, onUpdate]);

  const updateStat = (key: string, delta: number | boolean) => {
    setStats(prev => {
      const next = { ...prev };
      if (typeof delta === "boolean") {
        (next as any)[key] = delta;
      } else {
        (next as any)[key] = Math.max(0, (prev as any)[key] + delta);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const renderStepper = (label: string, key: string, value: number, icon: any, color: string) => (
    <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.stepperCard}>
      <NeuIconWell color={color + "20"} size={44} borderRadius={22}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </NeuIconWell>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#4A4A4A" borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="remove" size={20} color="rgba(255,255,255,0.6)" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="add" size={20} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  const renderToggle = (label: string, key: string, active: boolean, icon: any, color: string) => (
    <NeuButton 
      onPress={() => updateStat(key, !active)}
      color={active ? color : "#150428"}
      borderRadius={16}
      style={styles.toggleCard}
    >
      <View style={styles.toggleInner}>
        <MaterialCommunityIcons name={icon} size={28} color={active ? "#1A0533" : "rgba(255,255,255,0.2)"} />
        <View style={styles.toggleText}>
          <Text style={[styles.toggleLabel, { color: active ? "#1A0533" : "rgba(255,255,255,0.4)" }]}>{label}</Text>
          <Text style={[styles.togglePoints, { color: active ? "#1A0533" : "rgba(255,255,255,0.2)" }]}>+2 VP</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: active ? "#1A0533" : "rgba(255,255,255,0.05)" }]} />
      </View>
    </NeuButton>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Foundations</Text>
      <View style={styles.row}>
        {renderStepper("Settlements", "settlements", stats.settlements, "home", "#E67E22")}
        {renderStepper("Cities", "cities", stats.cities, "office-building", "#3498DB")}
      </View>
      <View style={styles.row}>
        {renderStepper("VP Cards", "vpCards", stats.vpCards, "cards-playing-outline", "#9B59B6")}
        <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.scoreSummary}>
          <Text style={styles.summaryLabel}>Total VP</Text>
          <Text style={[styles.summaryValue, { color: player.color }]}>{totalScore}</Text>
        </NeuTrench>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Achievements</Text>
      <View style={styles.toggleGrid}>
        {renderToggle("Longest Road", "longestRoad", stats.longestRoad, "map-marker-distance", "#F1C40F")}
        {renderToggle("Largest Army", "largestArmy", stats.largestArmy, "sword-cross", "#E74C3C")}
        {hasHarborMaster && renderToggle("Harbor Master", "harborMaster", stats.harborMaster, "anchor", "#00D2FF")}
      </View>

      {/* Manual Input Row */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Entry</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Custom VPs..."
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
          <Text style={styles.sectionTitle}>Shortcuts</Text>
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

      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.2)" />
        <Text style={styles.tipText}>Target score is {game.targetScore} VP.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stepperCard: { flex: 1, alignItems: "center" },
  stepperLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF", minWidth: 24, textAlign: "center" },
  scoreSummary: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 2 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 36 },
  toggleGrid: { gap: 10 },
  toggleCard: { width: "100%", height: 64 },
  toggleInner: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 16 },
  toggleText: { flex: 1, marginLeft: 16 },
  toggleLabel: { fontFamily: "Inter_900Black", fontSize: 15 },
  togglePoints: { fontFamily: "Inter_800ExtraBold", fontSize: 11 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  manualSection: { marginBottom: 16, marginTop: 12 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 12, opacity: 0.5 },
  tipText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)" },
});
