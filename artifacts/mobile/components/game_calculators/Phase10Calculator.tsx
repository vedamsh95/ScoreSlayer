import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition, PHASE10_VARIANTS } from "@/constants/games";
import { NeuTrench } from "../PolymerCard";

interface Phase10CalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  initialCleared?: boolean;
  initialPhase?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function Phase10Calculator({ player, game, initialLogs, initialCleared, initialPhase, onUpdate }: Phase10CalculatorProps) {
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

  const handlePhaseWin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCleared(true);
    setLogs([]);
  };

  const actionCards = [
    { label: "Skip", value: 15, icon: "block-helper" },
    { label: "Wild", value: 25, icon: "star-circle" }
  ];

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 16 }}>
        <Pressable 
          onPress={handlePhaseWin}
          style={[styles.winBtn, cleared && logs.length === 0 && styles.winActive]}
        >
          <MaterialCommunityIcons name="trophy-outline" size={20} color="#00F5A0" />
          <Text style={styles.winText}>FINISHED PHASE / 0 PTS</Text>
        </Pressable>
      </View>

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
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </NeuTrench>

      <Pressable onPress={toggleCleared} style={styles.phaseToggle}>
        <NeuTrench 
          color={cleared ? player.color : "#150428"} 
          borderRadius={14} 
          padding={12}
          style={styles.phaseToggleContent}
        >
          <Ionicons 
            name={cleared ? "checkmark-circle" : "ellipse-outline"} 
            size={20} 
            color={cleared ? "#1A0533" : "rgba(255,255,255,0.3)"} 
          />
          <View>
            <Text style={[styles.phaseToggleLabel, cleared && { color: "#1A0533" }]}>
              Phase {player.currentPhase || 1} Cleared
            </Text>
            <Text style={[styles.phaseToggleDesc, cleared && { color: "rgba(26,5,51,0.6)" }]}>
              {currentPhaseDesc}
            </Text>
          </View>
        </NeuTrench>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
            const pts = num <= 9 ? 5 : 10;
            return (
              <Pressable
                key={num}
                onPress={() => addValue(pts)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{num}</Text>
                <Text style={styles.keySubtext}>+{pts} pts</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Action Cards</Text>
        <View style={styles.actionRow}>
          {actionCards.map((card, i) => (
            <Pressable
              key={i}
              onPress={() => addValue(card.value)}
              style={styles.actionKey}
            >
              <MaterialCommunityIcons name={card.icon as any} size={24} color={player.color} />
              <Text style={styles.actionLabel}>{card.label}</Text>
              <Text style={styles.actionValue}>+{card.value}</Text>
            </Pressable>
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
  winBtn: { backgroundColor: "rgba(0, 245, 160, 0.05)", borderRadius: 18, padding: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(0, 245, 160, 0.1)", borderStyle: "dashed" },
  winActive: { backgroundColor: "rgba(0, 245, 160, 0.15)", borderColor: "#00F5A0", borderStyle: "solid" },
  winText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#00F5A0" },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  phaseToggle: { width: "100%", marginBottom: 16 },
  phaseToggleContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  phaseToggleLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 14, color: "#FFF" },
  phaseToggleDesc: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "23%", height: 50, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionKey: { flex: 1, height: 80, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
});
