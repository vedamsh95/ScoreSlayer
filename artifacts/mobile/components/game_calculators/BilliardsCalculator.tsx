import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";

interface BilliardsCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialLogs?: number[];
}

export function BilliardsCalculator({ player, game, onUpdate, initialLogs }: BilliardsCalculatorProps) {
  const [totalScore, setTotalScore] = useState(() => {
    return (initialLogs || []).reduce((a, b) => a + b, 0);
  });
  const [currentRun, setCurrentRun] = useState(0);
  const [history, setHistory] = useState<number[]>(initialLogs || []);

  const targetScore = game.targetScore || 100;
  const progress = Math.min(1, totalScore / targetScore);

  useEffect(() => {
    onUpdate(totalScore, history, { currentRun });
  }, [totalScore, history]);

  const addBall = () => {
    setCurrentRun(prev => prev + 1);
    setTotalScore(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFoul = () => {
    setTotalScore(prev => prev - 1);
    setHistory(prev => [...prev, -1]);
    setCurrentRun(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const endRun = () => {
    if (currentRun > 0) {
      setHistory(prev => [...prev, currentRun]);
      setCurrentRun(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const undoLast = () => {
    if (currentRun > 0) {
      setCurrentRun(prev => prev - 1);
      setTotalScore(prev => prev - 1);
    } else if (history.length > 0) {
      const last = history[history.length - 1];
      setTotalScore(prev => prev - last);
      setHistory(prev => prev.slice(0, -1));
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Total Points</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
        </View>
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>Goal: {targetScore}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.runCard}>
        <Text style={styles.runLabel}>Current Run</Text>
        <Text style={styles.runValue}>{currentRun}</Text>
      </View>

      <View style={styles.mainControls}>
        <Pressable onPress={addBall} style={styles.addBtn}>
          <MaterialCommunityIcons name="billiards" size={48} color="#FFF" />
          <Text style={styles.addBtnText}>+1 Ball</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={handleFoul} style={[styles.actionBtn, styles.foulBtn]}>
          <Ionicons name="alert-circle" size={24} color="#E74C3C" />
          <Text style={styles.actionBtnText}>Foul (-1)</Text>
        </Pressable>
        <Pressable onPress={endRun} style={[styles.actionBtn, styles.endBtn]}>
          <Ionicons name="checkmark-circle" size={24} color="#00F5A0" />
          <Text style={styles.actionBtnText}>End Run</Text>
        </Pressable>
      </View>

      <Pressable onPress={undoLast} style={styles.undoRow}>
        <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.3)" />
        <Text style={styles.undoText}>Undo Last Entry</Text>
      </Pressable>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Run History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No runs yet</Text>
          ) : (
            history.map((run, i) => (
              <View key={i} style={[styles.historyItem, run < 0 && styles.foulItem]}>
                <Text style={styles.historyValue}>{run < 0 ? "F" : run}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: 20, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 20 },
  scoreInfo: { gap: 4 },
  scoreLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 44, color: "#FFF", lineHeight: 48 },
  targetInfo: { flex: 1, marginLeft: 32, gap: 8 },
  targetLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right" },
  progressBar: { height: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#00F5A0" },
  runCard: { alignItems: "center", justifyContent: "center", marginBottom: 24, paddingVertical: 12 },
  runLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 14, color: "#16A085", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 },
  runValue: { fontFamily: "Inter_900Black", fontSize: 80, color: "#16A085", lineHeight: 84 },
  mainControls: { marginBottom: 24 },
  addBtn: { backgroundColor: "#16A085", height: 120, borderRadius: 24, alignItems: "center", justifyContent: "center", gap: 8, elevation: 8, shadowColor: "#16A085", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  addBtnText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  actionRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  actionBtn: { flex: 1, height: 60, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1 },
  foulBtn: { backgroundColor: "rgba(231, 76, 60, 0.05)", borderColor: "rgba(231, 76, 60, 0.2)" },
  endBtn: { backgroundColor: "rgba(0, 245, 160, 0.05)", borderColor: "rgba(0, 245, 160, 0.2)" },
  actionBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  undoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 },
  undoText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.3)" },
  historySection: { gap: 12 },
  historyTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  historyScroll: { flexDirection: "row" },
  historyItem: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginRight: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  foulItem: { backgroundColor: "rgba(231, 76, 60, 0.1)", borderColor: "#E74C3C30" },
  historyValue: { fontFamily: "Inter_800ExtraBold", fontSize: 16, color: "rgba(255,255,255,0.6)" },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.1)", paddingVertical: 12 },
});
