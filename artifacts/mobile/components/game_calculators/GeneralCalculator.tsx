import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface GeneralCalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  initialMetadata?: any;
  customScoreRules?: any[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function GeneralCalculator({ player, game, initialLogs, initialMetadata, customScoreRules, onUpdate }: GeneralCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { ...initialMetadata, dynamicQuickAdds });
  }, [total, logs, dynamicQuickAdds, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const handleManualAdd = () => {
    const val = parseFloat(manualValue);
    if (!isNaN(val)) {
      addValue(val);
      setManualValue("");
    }
  };

  const handleSaveAsShortcut = () => {
    const val = parseFloat(manualValue);
    if (!isNaN(val) && !dynamicQuickAdds.includes(val)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDynamicQuickAdds(prev => [...prev, val]);
        setManualValue("");
    }
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setLogs([]);
  };

  const numberKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const defaultQuickAdds = [10, 25, 50, 100];
  const allQuickAdds = [...defaultQuickAdds, ...dynamicQuickAdds];

  return (
    <View style={styles.container}>
      {/* Compact Display Area - Uno Style */}
      <NeuTrench color="#150428" borderRadius={20} padding={8} style={styles.displayArea}>
        <View style={styles.headerRow}>
          <View style={styles.scoreInfo}>
            <Text style={[styles.displayTotal, { color: player.color }]}>{total > 0 ? `+${total}` : total}</Text>
            <Text style={styles.displayPts}>pts</Text>
          </View>
          
          <View style={styles.compactActions}>
            <Pressable onPress={removeLast}>
                <NeuIconWell color="#150428" size={30} borderRadius={8}>
                    <Ionicons name="backspace-outline" size={14} color="rgba(255,184,0,0.9)" />
                </NeuIconWell>
            </Pressable>
            <Pressable onPress={clearAll} style={{ marginLeft: 6 }}>
                <NeuIconWell color="#150428" size={30} borderRadius={8}>
                    <Ionicons name="refresh" size={14} color="rgba(255,71,87,0.9)" />
                </NeuIconWell>
            </Pressable>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>Tap numbers to add scores...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>
                  {val > 0 ? `+${val}` : val}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      {/* Manual Input + Shortcut Creator */}
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Numpad - Uno Style */}
        <View style={styles.grid}>
          {numberKeys.map((num) => (
            <NeuButton
              key={num}
              onPress={() => addValue(num)}
              color="#00D2FF"
              borderRadius={16}
              style={styles.key}
            >
              <Text style={styles.keyText}>{num}</Text>
              <Text style={styles.keySubtext}>+{num} pts</Text>
            </NeuButton>
          ))}
        </View>

        {/* Quick Adds */}
        <Text style={styles.sectionTitle}>QUICK ADDS & SHORTCUTS</Text>
        <View style={styles.quickGrid}>
           {allQuickAdds.map((val, idx) => (
              <NeuButton
                key={`${val}-${idx}`}
                onPress={() => addValue(val)}
                color={idx < defaultQuickAdds.length ? "#8B5CF6" : "#A29BFE"}
                borderRadius={16}
                style={styles.quickKey}
              >
                <Text style={styles.quickKeyText}>+{val}</Text>
              </NeuButton>
           ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 4 },
  displayArea: { marginBottom: 10, position: "relative" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  scoreInfo: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  displayTotal: { fontFamily: "Bungee_400Regular", fontSize: 30 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  compactActions: { flexDirection: "row", alignItems: "center" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 5 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 11 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.2)" },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  manualInputTrench: { flex: 1, height: 44 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 15, paddingHorizontal: 12 },
  manualAddBtn: { height: 44 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "31%", height: 54 },
  keyText: { fontFamily: "Bungee_400Regular", fontSize: 20, color: "#1A0533", marginBottom: -6 },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(26,5,51,0.6)", textTransform: "uppercase" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 11, color: "#1A0533" },
});
