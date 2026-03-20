import React, { useCallback, useState, useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { PolymerButton } from "./PolymerButton";
import { NeuTrench, NeuIconWell } from "./PolymerCard";

interface ScoreInputModalProps {
  visible: boolean;
  players: Player[];
  game: GameDefinition;
  round: number;
  initialLogs?: Record<string, number[]>;
  initialCleared?: Record<string, boolean>;
  onSubmit: (scores: Record<string, number>, logs: Record<string, number[]>, cleared: Record<string, boolean>) => void;
  onClose: () => void;
  isEditing?: boolean;
}

const ACTION_CARDS = [
  { label: "Skip", value: 20, icon: "block-helper" },
  { label: "Reverse", value: 20, icon: "cached" },
  { label: "Draw 2", value: 20, icon: "plus-box-multiple" },
  { label: "Wild", value: 50, icon: "star-circle" },
  { label: "Draw 4", value: 50, icon: "plus-box-multiple-outline" },
];

export function ScoreInputModal({
  visible,
  players,
  game,
  round,
  initialLogs,
  initialCleared,
  onSubmit,
  onClose,
  isEditing = false,
}: ScoreInputModalProps) {
  const insets = useSafeAreaInsets();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [playerLogs, setPlayerLogs] = useState<Record<string, number[]>>(initialLogs || {});
  const [clearedPlayers, setClearedPlayers] = useState<Set<string>>(
    new Set(Object.keys(initialCleared || {}).filter(k => initialCleared?.[k]))
  );

  const activePlayer = players[activePlayerIndex];

  const currentLog = useMemo(() => playerLogs[activePlayer.id] || [], [playerLogs, activePlayer.id]);
  const currentTotal = useMemo(() => currentLog.reduce((a, b) => a + b, 0), [currentLog]);

  const addCard = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayerLogs(prev => ({
      ...prev,
      [activePlayer.id]: [...(prev[activePlayer.id] || []), value]
    }));
  }, [activePlayer.id]);

  const removeLast = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlayerLogs(prev => {
      const logs = [...(prev[activePlayer.id] || [])];
      logs.pop();
      return { ...prev, [activePlayer.id]: logs };
    });
  }, [activePlayer.id]);

  const clearLogs = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPlayerLogs(prev => ({ ...prev, [activePlayer.id]: [] }));
  }, [activePlayer.id]);

  const toggleCleared = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClearedPlayers(prev => {
      const next = new Set(prev);
      if (next.has(activePlayer.id)) next.delete(activePlayer.id);
      else next.add(activePlayer.id);
      return next;
    });
  }, [activePlayer.id]);

  const handleSubmit = useCallback(() => {
    const scores: Record<string, number> = {};
    const clearedMap: Record<string, boolean> = {};
    players.forEach(p => {
      scores[p.id] = (playerLogs[p.id] || []).reduce((a, b) => a + b, 0);
      clearedMap[p.id] = clearedPlayers.has(p.id);
    });
    onSubmit(scores, playerLogs, clearedMap);
    setPlayerLogs({});
    setClearedPlayers(new Set());
    setActivePlayerIndex(0);
  }, [players, playerLogs, clearedPlayers, onSubmit]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.title}>{isEditing ? "Edit" : "Enter"} Round {round}</Text>
              <Text style={styles.subtitle}>{game.name}</Text>
            </View>
            <NeuIconWell color="#150428" size={38} borderRadius={12}>
              <Pressable onPress={onClose} style={styles.closePressable}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </NeuIconWell>
          </View>

          {/* Player Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerStrip}>
            {players.map((p, i) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  setActivePlayerIndex(i);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.playerTab,
                  activePlayerIndex === i && { backgroundColor: p.color + "33", borderColor: p.color }
                ]}
              >
                <View style={[styles.tabDot, { backgroundColor: p.color }]} />
                <Text style={[styles.tabText, activePlayerIndex === i && { color: "#FFF" }]}>{p.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Active Player Calculator */}
          <View style={styles.calcArea}>
            <NeuTrench color="#150428" borderRadius={20} padding={12} style={styles.displayArea}>
              <View style={styles.displayTextRow}>
                <Text style={[styles.displayTotal, { color: activePlayer.color }]}>{currentTotal}</Text>
                <Text style={styles.displayPts}>pts</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logScroll}>
                {currentLog.length === 0 ? (
                  <Text style={styles.placeholderText}>Tap cards to add scores...</Text>
                ) : (
                  currentLog.map((val, idx) => (
                    <View key={idx} style={[styles.logChip, { backgroundColor: activePlayer.color + "22" }]}>
                      <Text style={[styles.logChipText, { color: activePlayer.color }]}>{val}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
              
              <Pressable onPress={removeLast} style={styles.backspace}>
                <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </NeuTrench>

            {/* Grid 0-9 */}
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => addCard(num)}
                  style={({ pressed }: { pressed: boolean }) => [styles.key, pressed && styles.keyPressed]}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </Pressable>
              ))}
              <Pressable onPress={clearLogs} style={[styles.key, { backgroundColor: "rgba(255,45,120,0.1)" }]}>
                <Text style={[styles.keyText, { color: "#FF2D78" }]}>C</Text>
              </Pressable>
              
              {/* Phase Toggle for Phase 10 */}
              {game.phases && (
                <Pressable 
                  onPress={toggleCleared} 
                  style={[styles.key, clearedPlayers.has(activePlayer.id) && { backgroundColor: "#00F5A022" }]}
                >
                  <MaterialCommunityIcons 
                    name={clearedPlayers.has(activePlayer.id) ? "check-circle" : "circle-outline"} 
                    size={24} 
                    color={clearedPlayers.has(activePlayer.id) ? "#00F5A0" : "rgba(255,255,255,0.3)"} 
                  />
                  <Text style={[styles.keySubtext, clearedPlayers.has(activePlayer.id) && { color: "#00F5A0" }]}>CLEARED</Text>
                </Pressable>
              )}
            </View>

            {/* Action Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionStrip}>
              {ACTION_CARDS.map((card) => (
                <Pressable
                  key={card.label}
                  onPress={() => addCard(card.value)}
                  style={styles.actionKey}
                >
                  <MaterialCommunityIcons name={card.icon as any} size={20} color={activePlayer.color} />
                  <Text style={styles.actionLabel}>{card.label}</Text>
                  <Text style={styles.actionValue}>+{card.value}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <PolymerButton
              label={activePlayerIndex < players.length - 1 ? "Next Player" : "Submit All Scores"}
              onPress={() => {
                if (activePlayerIndex < players.length - 1) {
                  setActivePlayerIndex(idx => idx + 1);
                } else {
                  handleSubmit();
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              color={activePlayerIndex < players.length - 1 ? "rgba(255,255,255,0.1)" : "#00F5A0"}
              textColor={activePlayerIndex < players.length - 1 ? "#FFF" : "#1A0533"}
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1A0533",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    maxHeight: "92%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFFFFF" },
  subtitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  closePressable: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  playerStrip: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  playerTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.05)",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  tabDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  tabText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  calcArea: {
    paddingHorizontal: 20,
  },
  displayArea: {
    height: 100,
    marginBottom: 20,
    position: "relative",
    justifyContent: "center",
  },
  displayTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 4,
  },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42, lineHeight: 42 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logScroll: { flexGrow: 0 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  logChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  backspace: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 16,
  },
  key: {
    width: "30%",
    height: 52,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)" },
  actionStrip: {
    flexGrow: 0,
    marginBottom: 20,
  },
  actionKey: {
    width: 76,
    height: 76,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  footer: {
    paddingHorizontal: 20,
    marginTop: "auto",
  },
});
