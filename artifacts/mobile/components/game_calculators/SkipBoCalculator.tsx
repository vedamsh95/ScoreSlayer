import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface SkipBoCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
  initialMetadata?: any;
}

export function SkipBoCalculator({ player, game, onUpdate, initialStats, initialMetadata }: SkipBoCalculatorProps) {
  const [stats, setStats] = useState({
    cards1to12: initialStats?.cards1to12 || initialMetadata?.stats?.cards1to12 || 0, // 5 pts ea
    skipBoCards: initialStats?.skipBoCards || initialMetadata?.stats?.skipBoCards || 0, // 25 pts ea
    isWinner: initialStats?.isWinner || initialMetadata?.stats?.isWinner || false,
  });

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.cards1to12 * 5;
    score += stats.skipBoCards * 25;
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return score + manualTotal;
  }, [stats, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, manualLogs, { stats, manualLogs, dynamicQuickAdds });
  }, [totalScore, stats, manualLogs, dynamicQuickAdds, onUpdate]);

  const updateStat = (key: string, delta: number) => {
    setStats(prev => ({
      ...prev,
      [key]: Math.max(0, (prev as any)[key] + delta)
    }));
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

  const renderStepper = (label: string, key: string, value: number, pts: number, color: string) => (
    <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardPts}>{pts} pts each</Text>
      </View>
      <View style={styles.stepper}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#00D2FF" borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color="#1A0533" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={10} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color="#1A0533" />
        </NeuButton>
      </View>
    </NeuTrench>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <NeuTrench color="#150428" borderRadius={28} padding={24} style={styles.summary}>
        <Text style={styles.summaryLabel}>Hand Penalty</Text>
        <Text style={[styles.summaryValue, { color: player.color }]}>{totalScore}</Text>
      </NeuTrench>

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

      <Text style={styles.sectionTitle}>Remaining Hand</Text>
      <View style={styles.grid}>
        {renderStepper("Numbers (1-12)", "cards1to12", stats.cards1to12, 5, "#E67E22")}
        {renderStepper("Skip-Bo Wilds", "skipBoCards", stats.skipBoCards, 25, "#00D2FF")}
      </View>

      <View style={styles.tipBox}>
        <NeuIconWell color="rgba(255,255,255,0.1)" size={32} borderRadius={10}>
          <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
        </NeuIconWell>
        <Text style={styles.tipText}>Enter cards remaining in your hand at round end.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  summaryLabel: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  summaryValue: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
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
  grid: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center" },
  cardInfo: { flex: 1 },
  cardLabel: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", textTransform: "uppercase" },
  cardPts: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: { width: 36, height: 36 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 22, color: "#FFF", minWidth: 28, textAlign: "center" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, padding: 12 },
  tipText: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
});
