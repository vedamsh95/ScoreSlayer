import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface DutchBlitzCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
  initialMetadata?: any;
}

export function DutchBlitzCalculator({ player, game, onUpdate, initialStats, initialMetadata }: DutchBlitzCalculatorProps) {
  const [stats, setStats] = useState({
    dutchPile: initialStats?.dutchPile || initialMetadata?.stats?.dutchPile || 0, // +2 each
    blitzPile: initialStats?.blitzPile || initialMetadata?.stats?.blitzPile || 0,  // -1 each
  });

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.dutchPile * 2;
    score -= stats.blitzPile * 1;
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <NeuTrench color="#150428" borderRadius={60} padding={10} style={styles.scoreCircle}>
          <Text style={[styles.scoreValue, { color: player.color }]}>{totalScore}</Text>
          <Text style={styles.scoreLabel}>Total</Text>
        </NeuTrench>
      </View>

      <View style={styles.mainArea}>
        {/* Dutch Pile - The BIG ONE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={12} color="#00D2FF" />
            <Text style={styles.sectionTitle}>Dutch Pile (+2 ea)</Text>
          </View>
          <NeuTrench color="#150428" borderRadius={24} padding={12} style={styles.hugeStepper}>
            <NeuButton onPress={() => updateStat("dutchPile", -1)} color="#00D2FF" borderRadius={20} style={styles.hugeBtn}>
              <Ionicons name="remove" size={32} color="rgba(26,5,51,0.5)" />
            </NeuButton>
            <View style={styles.hugeValueContainer}>
              <Text style={styles.hugeValue}>{stats.dutchPile}</Text>
              <Text style={styles.hugeLabel}>Cards</Text>
            </View>
            <NeuButton onPress={() => updateStat("dutchPile", 1)} color="#00D2FF" borderRadius={20} style={styles.hugeBtn}>
              <Ionicons name="add" size={32} color="#1A0533" />
            </NeuButton>
          </NeuTrench>
        </View>

        {/* Blitz Pile - Penalties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={12} color="#FF4757" />
            <Text style={styles.sectionTitle}>Blitz Pile (-1 ea)</Text>
          </View>
          <NeuTrench color="#150428" borderRadius={20} padding={10} style={styles.stepperContainer}>
            <NeuButton onPress={() => updateStat("blitzPile", -1)} color="#FF4757" borderRadius={14} style={styles.stepBtn}>
              <Ionicons name="remove" size={24} color="rgba(255,255,255,0.6)" />
            </NeuButton>
            <Text style={styles.stepValue}>{stats.blitzPile}</Text>
            <NeuButton onPress={() => updateStat("blitzPile", 1)} color="#FF4757" borderRadius={14} style={styles.stepBtn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </NeuButton>
          </NeuTrench>
        </View>

        {/* Manual Input Row */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitleText}>Manual Entry & Shortcuts</Text>
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
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipText}>Fast hands, faster scoring.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  scoreCircle: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 48, lineHeight: 54 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  mainArea: { gap: 20 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 4 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5 },
  sectionTitleText: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  hugeStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hugeBtn: { width: 72, height: 72 },
  hugeValueContainer: { alignItems: "center" },
  hugeValue: { fontFamily: "Inter_900Black", fontSize: 44, color: "#FFF", lineHeight: 50 },
  hugeLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: { width: 52, height: 52 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 28, color: "#FFF", lineHeight: 34 },
  manualSection: { marginBottom: 12 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  tipBox: { marginTop: 24, paddingVertical: 10, alignItems: "center", opacity: 0.3 },
  tipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }
});
