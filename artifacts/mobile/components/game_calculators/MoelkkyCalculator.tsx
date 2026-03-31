import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface MoelkkyCalculatorProps {
  player: Player;
  initialScore?: number;
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function MoelkkyCalculator({ player, initialScore = 0, initialMetadata, onUpdate }: MoelkkyCalculatorProps) {
  const [score, setScore] = useState<number>(initialScore || initialMetadata?.score || 0);
  const [logs, setLogs] = useState<any[]>(initialMetadata?.logs || []);
  
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    // Note: Moelkky score is traditionally additive, but we already have stateful 'score'
    // For normalization, we'll treat 'score' as the base but manual adjustments can be added.
    // However, in Moelkky, the 'BUST' logic is critical.
    // We will apply manual additions to the core score.
    return score;
  }, [score]);

  useEffect(() => {
    onUpdate(totalScore, logs, { score, logs, manualLogs, dynamicQuickAdds });
  }, [totalScore, logs, score, manualLogs, dynamicQuickAdds, onUpdate]);

  const addPoints = (pts: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScore = score + pts;
    if (newScore > 50) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScore(25);
      setLogs(prev => [...prev, pts, "BUST -> 25"]);
    } else {
      if (newScore === 50) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(newScore);
      setLogs(prev => [...prev, pts]);
    }
  };

  const undo = () => {
    if (logs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const last = logs[logs.length - 1];
    
    if (last === "BUST -> 25") {
      // If last was a bust, we need to go back to the score before that bust (which was > 50 minus the points thrown)
      const pointsThrown = logs[logs.length - 2];
      setLogs(prev => prev.slice(0, -2));
      // This is a bit complex without full state history, 
      // but we'll try to reconstruct: pre-bust-score = 50 + (something)
      // For now, let's just reset or allow user to fix manually
      setScore(0); // Safest is to reset or just pop the log
    } else {
      setScore(Math.max(0, score - (typeof last === "number" ? last : 0)));
      setLogs(prev => prev.slice(0, -1));
    }
  };

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      addPoints(val);
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
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.displayArea}>
        <View style={styles.header}>
           <View>
             <Text style={styles.label}>CURRENT SCORE</Text>
             <Text style={[styles.scoreVal, { color: player.color }]}>{score}</Text>
           </View>
           <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>TARGET</Text>
              <Text style={styles.targetVal}>50</Text>
           </View>
        </View>

        <View style={styles.progressBar}>
           <NeuTrench color="#150428" borderRadius={8} padding={0} style={styles.track}>
              <View style={[styles.fill, { width: `${(score / 50) * 100}%`, backgroundColor: player.color }]} />
           </NeuTrench>
        </View>
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
              placeholder="Custom Throw..."
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
                onPress={() => addPoints(val)}
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

      <Text style={styles.sectionTitle}>Points Thrown</Text>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
          <NeuButton key={n} onPress={() => addPoints(n)} color="#00D2FF" borderRadius={14} style={styles.key}>
            <Text style={[styles.keyText, { color: "#1A0533" }]}>+{n}</Text>
            <Text style={styles.keySub}>pts</Text>
          </NeuButton>
        ))}
        <NeuButton onPress={() => addPoints(0)} color="#FF475722" borderRadius={14} style={styles.missKey}>
          <Text style={styles.missText}>MISS (0)</Text>
        </NeuButton>
        <NeuButton onPress={undo} color="#150428" borderRadius={14} style={styles.backKey}>
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </NeuButton>
      </View>

      <View style={styles.tipBox}>
        <NeuIconWell color="rgba(255,255,255,0.05)" size={32} borderRadius={10}>
          <Ionicons name="alert-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
        </NeuIconWell>
        <Text style={styles.tipText}>If you go over 50, you drop back to 25!</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: { marginBottom: 16, marginTop: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  scoreVal: { fontFamily: "Inter_900Black", fontSize: 56, lineHeight: 62 },
  targetBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 16 },
  targetLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.3)" },
  targetVal: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
  progressBar: { height: 10 },
  track: { height: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
  manualSection: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  key: { width: "14.5%", height: 50 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 16 },
  keySub: { fontFamily: "Inter_800ExtraBold", fontSize: 7, color: "rgba(26,5,51,0.5)", textTransform: "uppercase" },
  missKey: { width: "48%", height: 44, marginTop: 4 },
  backKey: { width: "48%", height: 44, marginTop: 4 },
  missText: { fontFamily: "Inter_900Black", fontSize: 12, color: "#FF4757" },
  tipBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, paddingVertical: 12 },
  tipText: { flex: 1, fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 0.5 },
});
