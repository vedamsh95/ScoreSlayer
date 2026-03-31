import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface CornholeCalculatorProps {
  player: Player;
  initialStats?: { holes: number; board: number };
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function CornholeCalculator({ player, initialStats, initialMetadata, onUpdate }: CornholeCalculatorProps) {
  const [stats, setStats] = useState({
    holes: initialStats?.holes || initialMetadata?.holes || 0,
    board: initialStats?.board || initialMetadata?.board || 0,
  });

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalRaw = useMemo(() => {
    const base = stats.holes * 3 + stats.board;
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return base + manualTotal;
  }, [stats, manualLogs]);

  useEffect(() => {
    const roasts: string[] = [];
    if (totalRaw === 0) {
      roasts.push("Did you even throw the bags? 🤡");
    } else if (stats.holes >= 4) {
      roasts.push("Literal machine. 4/4 holes?! 🎯");
    }
    
    onUpdate(totalRaw, [stats.holes, stats.board, ...manualLogs], { 
      ...stats, 
      manualLogs, 
      dynamicQuickAdds, 
      roasts 
    });
  }, [totalRaw, stats, manualLogs, dynamicQuickAdds, onUpdate]);

  const increment = (type: "holes" | "board") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStats(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const reset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setStats({ holes: 0, board: 0 });
    setManualLogs([]);
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
      <NeuTrench color="#150428" borderRadius={32} padding={24} style={styles.header}>
        <Text style={[styles.scoreText, { color: player.color }]}>{totalRaw}</Text>
        <Text style={styles.scoreLabel}>raw pts</Text>
      </NeuTrench>

      <View style={styles.buttonRow}>
        <NeuButton 
          onPress={() => increment("holes")}
          color="#00D2FF"
          borderRadius={24}
          style={styles.button}
        >
          <View style={styles.buttonInner}>
            <NeuIconWell color="rgba(26,5,51,0.2)" size={64} borderRadius={32}>
              <MaterialCommunityIcons name="star-circle" size={40} color="#1A0533" />
            </NeuIconWell>
            <Text style={styles.buttonVal}>+3 Hole</Text>
            <Text style={styles.countText}>{stats.holes} in</Text>
          </View>
        </NeuButton>

        <NeuButton 
          onPress={() => increment("board")}
          color={player.color}
          borderRadius={24}
          style={styles.button}
        >
          <View style={styles.buttonInner}>
            <NeuIconWell color="rgba(26,5,51,0.2)" size={64} borderRadius={32}>
              <MaterialCommunityIcons name="record-circle-outline" size={40} color="#1A0533" />
            </NeuIconWell>
            <Text style={styles.buttonVal}>+1 Board</Text>
            <Text style={styles.countText}>{stats.board} on</Text>
          </View>
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

      <NeuButton onPress={reset} color="#FF4757" borderRadius={18} style={styles.resetBtn}>
        <View style={styles.resetInner}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.resetText}>Reset All Counters</Text>
        </View>
      </NeuButton>

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.2)" />
        <Text style={styles.hintText}>Cancellation points will be applied automatically after submission.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 12, marginBottom: 24 },
  scoreText: { fontFamily: "Inter_900Black", fontSize: 72 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 14, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  buttonRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  button: { flex: 1, height: 180 },
  buttonInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  buttonVal: { fontFamily: "Inter_900Black", fontSize: 16, color: "#1A0533" },
  countText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(26,5,51,0.5)" },
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
  resetBtn: { width: "100%", height: 52, marginBottom: 20 },
  resetInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  resetText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  hintBox: { flexDirection: "row", gap: 8, paddingHorizontal: 16, opacity: 0.4 },
  hintText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 },
});
