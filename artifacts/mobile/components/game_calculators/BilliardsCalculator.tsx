import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

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
  }, [totalScore, history, currentRun, onUpdate]);

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
      <NeuTrench color="#150428" borderRadius={24} padding={20} style={styles.progressHeader}>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Total Points</Text>
          <Text style={[styles.scoreValue, { color: player.color }]}>{totalScore}</Text>
        </View>
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>Goal: {targetScore}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: player.color }]} />
          </View>
        </View>
      </NeuTrench>

      <View style={styles.runCard}>
        <Text style={[styles.runLabel, { color: player.color }]}>Current Run</Text>
        <Text style={[styles.runValue, { color: player.color }]}>{currentRun}</Text>
      </View>

      <View style={styles.mainControls}>
        <NeuButton 
          onPress={addBall} 
          color="#00D2FF" // Sea Blue
          borderRadius={24}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="billiards" size={48} color="#1A0533" />
          <Text style={styles.addBtnText}>+1 Ball</Text>
        </NeuButton>
      </View>

      <View style={styles.actionRow}>
        <NeuButton onPress={handleFoul} color="#FF4757" borderRadius={18} style={styles.actionBtn}>
          <Ionicons name="alert-circle" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Foul (-1)</Text>
        </NeuButton>
        <NeuButton onPress={endRun} color="#00F5A0" borderRadius={18} style={styles.actionBtn}>
          <Ionicons name="checkmark-circle" size={20} color="#1A0533" />
          <Text style={[styles.actionBtnText, { color: "#1A0533" }]}>End Run</Text>
        </NeuButton>
      </View>

      <Pressable onPress={undoLast} style={styles.undoRow}>
        <NeuIconWell color="#150428" size={36} borderRadius={10}>
          <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.4)" />
        </NeuIconWell>
        <Text style={styles.undoText}>Undo Last Entry</Text>
      </Pressable>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Run History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No runs yet</Text>
          ) : (
            history.map((run, i) => (
              <NeuTrench 
                key={i} 
                color={run < 0 ? "rgba(231, 76, 60, 0.2)" : "#150428"} 
                borderRadius={12} 
                padding={10} 
                style={styles.historyItem}
              >
                <Text style={[styles.historyValue, run < 0 && { color: "#FF4757" }]}>
                  {run < 0 ? "F" : run}
                </Text>
              </NeuTrench>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  scoreInfo: { gap: 2 },
  scoreLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1 },
  scoreValue: { fontFamily: "Inter_900Black", fontSize: 44 },
  targetInfo: { flex: 1, marginLeft: 24, gap: 8 },
  targetLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%" },
  runCard: { alignItems: "center", justifyContent: "center", marginBottom: 20 },
  runLabel: { fontFamily: "Inter_900Black", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, opacity: 0.6 },
  runValue: { fontFamily: "Inter_900Black", fontSize: 84, lineHeight: 90 },
  mainControls: { marginBottom: 24 },
  addBtn: { width: "100%", height: 120 },
  addBtnText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#1A0533" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, height: 56 },
  actionBtnText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF" },
  undoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 },
  undoText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "rgba(255,255,255,0.3)" },
  historySection: { gap: 12 },
  historyTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5 },
  historyScroll: { flexDirection: "row" },
  historyItem: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: 8 },
  historyValue: { fontFamily: "Inter_900Black", fontSize: 16, color: "rgba(255,255,255,0.5)" },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.1)", paddingVertical: 12 },
});
