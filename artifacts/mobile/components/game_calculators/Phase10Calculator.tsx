import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  initialMetadata?: any;
  customScoreRules?: any[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function Phase10Calculator({ 
  player, 
  game, 
  initialLogs, 
  initialCleared, 
  initialPhase, 
  initialMetadata,
  customScoreRules, 
  onUpdate 
}: Phase10CalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [cleared, setCleared] = useState<boolean>(initialCleared !== undefined ? initialCleared : false);
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);

  const phase10Variant = useMemo(() => PHASE10_VARIANTS.find(v => v.id === game.id), [game.id]);
  const currentPhaseIndex = (player.currentPhase || 1) - 1;
  const currentPhaseDesc = phase10Variant?.phases[currentPhaseIndex]?.description || "Next Phase";

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { cleared, dynamicQuickAdds });
  }, [total, logs, cleared, dynamicQuickAdds, onUpdate]);

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

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      addValue(val);
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

  const actionCards = useMemo(() => {
    if (customScoreRules && customScoreRules.length > 0) {
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

      {/* Manual Input Row */}
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
        {/* Action Cards & Shortcuts - Moved UP */}
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

        {dynamicQuickAdds.length > 0 && (
          <View style={[styles.quickGrid, { marginTop: 16 }]}>
            {dynamicQuickAdds.map((val, idx) => (
              <NeuButton
                key={`shortcut-${idx}`}
                onPress={() => addValue(val)}
                color="#8B5CF6"
                borderRadius={14}
                style={styles.quickKey}
              >
                <Text style={styles.quickKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        )}

        {/* Simplified Category Buttons */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Point Categories</Text>
        <View style={styles.grid}>
          <NeuButton
            onPress={() => addValue(getNumberPoints(5))}
            color="#00D2FF"
            borderRadius={20}
            style={styles.bigKey}
          >
            <View style={styles.bigKeyInner}>
              <Text style={styles.bigKeyVal}>+{getNumberPoints(5)}</Text>
              <View>
                <Text style={styles.bigKeyLabel}>CARDS 1–9</Text>
                <Text style={[styles.bigKeySub, { color: "#1A0533" }]}>{getNumberPoints(5)} POINTS EACH</Text>
              </View>
            </View>
          </NeuButton>

          <NeuButton
            onPress={() => addValue(getNumberPoints(10))}
            color="#00D2FF"
            borderRadius={20}
            style={styles.bigKey}
          >
            <View style={styles.bigKeyInner}>
              <Text style={styles.bigKeyVal}>+{getNumberPoints(10)}</Text>
              <View>
                <Text style={styles.bigKeyLabel}>CARDS 10–12</Text>
                <Text style={[styles.bigKeySub, { color: "#1A0533" }]}>{getNumberPoints(10)} POINTS EACH</Text>
              </View>
            </View>
          </NeuButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
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
  grid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  bigKey: { flex: 1, height: 86 },
  bigKeyInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  bigKeyVal: { fontFamily: "Inter_900Black", fontSize: 24, color: "#1A0533" },
  bigKeyLabel: { fontFamily: "Inter_900Black", fontSize: 11, color: "#1A0533" },
  bigKeySub: { fontFamily: "Inter_800ExtraBold", fontSize: 7, color: "rgba(26,5,51,0.5)", marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionKey: { flex: 1, height: 86 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", marginTop: 2 },
});
