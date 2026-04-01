import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface FiveCrownsCalculatorProps {
  player: Player;
  round: number;
  initialLogs?: number[];
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function FiveCrownsCalculator({ player, round, initialLogs, initialMetadata, onUpdate }: FiveCrownsCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || initialMetadata?.logs || []);
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  
  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  // Five Crowns Wilds: Round 1 (3 cards) = 3 is wild, Round 11 (13 cards) = K is wild
  const WILDS = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const currentWild = WILDS[Math.min(round - 1, 10)] || "K";

  useEffect(() => {
    onUpdate(total, logs, { currentWild, logs, dynamicQuickAdds });
  }, [total, logs, currentWild, dynamicQuickAdds, onUpdate]);

  const addValue = (val: number) => {
    if (isNaN(val)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const removeLast = () => {
    if (logs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
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

  const cardValues = [
    { label: "3-10", val: "face", color: "#00D2FF" },
    { label: "Jack", val: 11, color: "#9B59B6" },
    { label: "Queen", val: 12, color: "#E67E22" },
    { label: "King", val: 13, color: "#E74C3C" },
    { label: "Joker", val: 50, color: "#F1C40F" },
    { label: "Wild", val: 20, color: "#FF4757" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.header}>
           <View>
             <Text style={styles.roundLabel}>ROUND {round}</Text>
             <View style={styles.wildBadge}>
               <Ionicons name="flash" size={10} color="#FFB800" />
               <Text style={styles.wildText}>WILD: {currentWild}</Text>
             </View>
           </View>
           <View style={styles.scoreBox}>
              <Text style={[styles.scoreVal, { color: player.color }]}>{total}</Text>
              <Text style={styles.scoreLabel}>PTS</Text>
           </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholder}>Tap cards to add penalty...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "15" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>+{val}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Manual Input Row */}
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Manual Pts..."
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

        {dynamicQuickAdds.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Custom Shortcuts</Text>
            <View style={styles.quickGrid}>
              {dynamicQuickAdds.map((val, idx) => (
                <NeuButton
                  key={`shortcut-${idx}`}
                  onPress={() => addValue(val)}
                  color="#8B5CF6"
                  borderRadius={14}
                  style={styles.shortcutKey}
                >
                  <Text style={styles.shortcutKeyText}>+{val}</Text>
                </NeuButton>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Quick Tap Values</Text>
        <View style={styles.grid}>
          {/* Numeric Keys 3-10 */}
          {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <NeuButton key={n} onPress={() => addValue(n)} color="#00D2FF" borderRadius={14} style={styles.key}>
              <Text style={styles.keyText}>{n}</Text>
            </NeuButton>
          ))}
          {/* Special Keys */}
          {cardValues.slice(1).map((c, i) => (
            <NeuButton key={i} onPress={() => addValue(c.val as number)} color={c.color} borderRadius={14} style={styles.wideKey}>
              <Text style={[styles.keyText, { color: "#1A0533" }]}>{c.val}</Text>
              <Text style={[styles.keySub, { color: "rgba(26,5,51,0.5)" }]}>{c.label}</Text>
            </NeuButton>
          ))}
          
          <NeuButton onPress={removeLast} color="#150428" borderRadius={14} style={styles.backKey}>
            <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
          </NeuButton>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  roundLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  wildBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,184,0,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  wildText: { fontFamily: "Inter_900Black", fontSize: 10, color: "#FFB800" },
  scoreBox: { alignItems: "baseline", flexDirection: "row", gap: 4 },
  scoreVal: { fontFamily: "Inter_900Black", fontSize: 44 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 12, color: "rgba(255,255,255,0.2)" },
  logStrip: { flexDirection: "row", height: 26 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholder: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.1)" },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "space-between" },
  key: { width: "18%", height: 50 },
  wideKey: { width: "30%", height: 60 },
  backKey: { width: "30%", height: 60 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#1A0533" },
  keySub: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.5)", textTransform: "uppercase" },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8, marginTop: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
