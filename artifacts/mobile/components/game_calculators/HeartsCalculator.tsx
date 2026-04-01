import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface HeartsCalculatorProps {
  player: Player;
  initialLogs?: number[];
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function HeartsCalculator({ player, initialLogs, initialMetadata, onUpdate }: HeartsCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { dynamicQuickAdds });
  }, [total, logs, dynamicQuickAdds, onUpdate]);

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

  const actionCards = [
    { label: "Hearts", value: 1, icon: "heart", color: "#FF4757" },
    { label: "Q-Spades", value: 13, icon: "crown", color: "#6B21E8" },
    { label: "J-Diamonds", value: -10, icon: "diamond-stone", color: "#00D2FF" },
  ];

  return (
    <View style={styles.container}>
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.headerTop}>
          <View style={styles.displayTextRow}>
            <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
            <Text style={styles.displayPts}>pts</Text>
          </View>
          <NeuButton onPress={removeLast} color="#1A0533" borderRadius={12} style={styles.backButton}>
            <Ionicons name="backspace" size={20} color="rgba(255,255,255,0.4)" />
          </NeuButton>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>No penalties yet...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "15" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>{val > 0 ? `+${val}` : val}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      {/* Manual Input Row */}
      <View style={styles.manualRow}>
        <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
          <TextInput
            style={styles.manualInput}
            value={manualValue}
            onChangeText={setManualValue}
            placeholder="Custom Score..."
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

      <Text style={styles.sectionTitle}>Penalty Cards</Text>
      <View style={styles.actionRow}>
        {actionCards.map((card, i) => (
          <NeuButton
            key={i}
            onPress={() => addValue(card.value)}
            color={card.color}
            borderRadius={20}
            style={styles.actionKey}
          >
            <View style={styles.actionInner}>
              <View style={[styles.iconWell, { backgroundColor: "rgba(26,5,51,0.2)" }]}>
                <MaterialCommunityIcons name={card.icon as any} size={22} color="#1A0533" />
              </View>
              <Text style={[styles.actionValue, { color: "#1A0533" }]}>{card.value > 0 ? `+${card.value}` : card.value}</Text>
              <Text style={[styles.actionLabel, { color: "rgba(26,5,51,0.5)" }]}>{card.label}</Text>
            </View>
          </NeuButton>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
                  style={styles.quickKey}
                >
                  <Text style={styles.quickKeyText}>{val > 0 ? `+${val}` : val}</Text>
                </NeuButton>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Default Quick Taps</Text>
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <NeuButton
              key={num}
              onPress={() => addValue(num)}
              color="#00D2FF"
              borderRadius={16}
              style={styles.key}
            >
              <Text style={styles.keyText}>+{num}</Text>
              <Text style={styles.keySubtext}>pts</Text>
            </NeuButton>
          ))}
        </View>
        
        <NeuButton 
          onPress={() => {
            setLogs([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }}
          color="#FF4757"
          borderRadius={16}
          style={styles.keyReset}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="trash" size={18} color="#FFF" />
            <Text style={{ fontFamily: "Inter_900Black", fontSize: 12, color: "#FFF" }}>CLEAR ROUND</Text>
          </View>
        </NeuButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  displayPts: { fontFamily: "Inter_900Black", fontSize: 14, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" },
  backButton: { width: 44, height: 44 },
  logStrip: { flexDirection: "row", height: 28 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 13 },
  placeholderText: { fontFamily: "Inter_800ExtraBold", fontSize: 14, color: "rgba(255,255,255,0.1)", letterSpacing: 0.5 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionKey: { flex: 1, height: 100 },
  actionInner: { alignItems: "center", justifyContent: "center" },
  iconWell: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "space-between", marginBottom: 12 },
  key: { width: "18%", height: 48 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#1A0533" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.5)", textTransform: "uppercase" },
  keyReset: { width: "100%", height: 44, marginTop: 4 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
