import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition, PHASE10_VARIANTS } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface Phase10CalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  initialCleared?: boolean;
  initialPhase?: number;
  customScoreRules?: any[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function Phase10Calculator({ player, game, initialLogs, initialCleared, initialPhase, customScoreRules, onUpdate }: Phase10CalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [cleared, setCleared] = useState<boolean>(initialCleared !== undefined ? initialCleared : false);

  const phase10Variant = useMemo(() => PHASE10_VARIANTS.find(v => v.id === game.id), [game.id]);
  const currentPhaseIndex = (player.currentPhase || 1) - 1;
  const currentPhaseDesc = phase10Variant?.phases[currentPhaseIndex]?.description || "Next Phase";

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { cleared });
  }, [total, logs, cleared, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const toggleCleared = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCleared(prev => !prev);
  };


  const actionCards = useMemo(() => {
    if (customScoreRules && customScoreRules.length > 0) {
      // Look for Skip and Wild specifically
      const skip = customScoreRules.find(r => r.label.toLowerCase().includes("skip") || r.id?.includes("skip"));
      const wild = customScoreRules.find(r => r.label.toLowerCase().includes("wild") || r.id?.includes("wild"));
      
      return [
        { label: "Skip", value: skip?.points ?? 15, icon: "block-helper", color: "#FF9F43" },
        { label: "Wild", value: wild?.points ?? 25, icon: "star-circle", color: "#FFB800" }
      ];
    }
    return [
      { label: "Skip", value: 15, icon: "block-helper", color: "#FF9F43" },
      { label: "Wild", value: 25, icon: "star-circle", color: "#FFB800" }
    ];
  }, [customScoreRules]);

  const getNumberPoints = useCallback((num: number) => {
    if (customScoreRules && customScoreRules.length > 0) {
      if (num <= 9) {
        const low = customScoreRules.find(r => r.label.toLowerCase().includes("1–9") || r.label.toLowerCase().includes("low") || r.id?.includes("low"));
        return low?.points ?? 5;
      } else {
        const high = customScoreRules.find(r => r.label.toLowerCase().includes("10–12") || r.label.toLowerCase().includes("high") || r.id?.includes("high"));
        return high?.points ?? 10;
      }
    }
    return num <= 9 ? 5 : 10;
  }, [customScoreRules]);

  return (
    <View style={styles.container}>

      <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.displayArea}>
        <View style={styles.displayTextRow}>
          <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
          <Text style={styles.displayPts}>pts</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>Tap cards to add scores...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>+{val}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <Pressable onPress={removeLast} style={styles.backspace}>
          <NeuIconWell color="#150428" size={36} borderRadius={10}>
            <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.4)" />
          </NeuIconWell>
        </Pressable>
      </NeuTrench>

      <Pressable onPress={toggleCleared} style={styles.phaseToggle}>
        <NeuTrench 
          color={cleared ? player.color : "#150428"} 
          borderRadius={18} 
          padding={14}
        >
          <View style={styles.phaseToggleRow}>
            <NeuIconWell 
              color={cleared ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.03)"} 
              size={36} 
              borderRadius={10}
            >
              <Ionicons 
                name={cleared ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={cleared ? "#1A0533" : "rgba(255,255,255,0.2)"} 
              />
            </NeuIconWell>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseToggleLabel, cleared && { color: "#1A0533" }]}>
                Phase {player.currentPhase || 1} Cleared
              </Text>
              <Text style={[styles.phaseToggleDesc, cleared && { color: "rgba(26,5,51,0.6)" }]}>
                {currentPhaseDesc}
              </Text>
            </View>
          </View>
        </NeuTrench>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
            const pts = getNumberPoints(num);
            return (
              <NeuButton
                key={num}
                onPress={() => addValue(pts)}
                color="#00D2FF"
                borderRadius={14}
                style={styles.key}
              >
                <Text style={styles.keyText}>{num}</Text>
                <Text style={styles.keySubtext}>+{pts} pts</Text>
              </NeuButton>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Action Cards</Text>
        <View style={styles.actionRow}>
          {actionCards.map((card, i) => (
            <NeuButton
              key={i}
              onPress={() => addValue(card.value)}
              color={card.color}
              borderRadius={18}
              style={styles.actionKey}
            >
              <MaterialCommunityIcons name={card.icon as any} size={24} color="#FFF" />
              <Text style={styles.actionLabel}>{card.label}</Text>
              <Text style={styles.actionValue}>+{card.value}</Text>
            </NeuButton>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
  winNeuBtn: { width: "100%", height: 48 },
  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  winText: { fontFamily: "Inter_900Black", fontSize: 11, letterSpacing: 0.5 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  phaseToggle: { width: "100%", marginBottom: 16 },
  phaseToggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  phaseToggleLabel: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", letterSpacing: 0.3 },
  phaseToggleDesc: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "23%", height: 52 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 18, color: "#1A0533" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.5)" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionKey: { flex: 1, height: 86 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", marginTop: 2 },
});
