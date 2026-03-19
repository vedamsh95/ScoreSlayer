import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { PolymerButton } from "./PolymerButton";

interface ScoreInputModalProps {
  visible: boolean;
  players: Player[];
  game: GameDefinition;
  round: number;
  onSubmit: (scores: Record<string, number>) => void;
  onClose: () => void;
}

export function ScoreInputModal({
  visible,
  players,
  game,
  round,
  onSubmit,
  onClose,
}: ScoreInputModalProps) {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<Record<string, string>>({});

  const updateScore = useCallback((playerId: string, value: string) => {
    setScores((prev) => ({ ...prev, [playerId]: value }));
  }, []);

  const applyQuickPenalty = useCallback(
    (playerId: string, points: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setScores((prev) => {
        const current = parseFloat(prev[playerId] ?? "0") || 0;
        return { ...prev, [playerId]: String(current + points) };
      });
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const parsed: Record<string, number> = {};
    for (const p of players) {
      parsed[p.id] = parseFloat(scores[p.id] ?? "0") || 0;
    }
    onSubmit(parsed);
    setScores({});
  }, [players, scores, onSubmit]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Round {round} Scores</Text>
              <Text style={styles.subtitle}>{game.name}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {players.map((player) => (
              <View key={player.id} style={styles.playerBlock}>
                <View style={styles.playerHeader}>
                  <View
                    style={[styles.dot, { backgroundColor: player.color }]}
                  />
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.currentPhase !== undefined && (
                    <View style={styles.phasePill}>
                      <Text style={styles.phaseText}>
                        Phase {player.currentPhase}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputRow}>
                  <Pressable
                    style={styles.nudgeBtn}
                    onPress={() =>
                      updateScore(
                        player.id,
                        String((parseFloat(scores[player.id] ?? "0") || 0) - 1)
                      )
                    }
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color="rgba(255,255,255,0.7)"
                    />
                  </Pressable>

                  <View
                    style={[
                      styles.inputWrap,
                      { borderColor: player.color + "66" },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: player.color }]}
                      value={scores[player.id] ?? ""}
                      onChangeText={(v) => updateScore(player.id, v)}
                      keyboardType="numbers-and-punctuation"
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      selectTextOnFocus
                    />
                  </View>

                  <Pressable
                    style={styles.nudgeBtn}
                    onPress={() =>
                      updateScore(
                        player.id,
                        String((parseFloat(scores[player.id] ?? "0") || 0) + 1)
                      )
                    }
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color="rgba(255,255,255,0.7)"
                    />
                  </Pressable>
                </View>

                {game.quickPenalties && game.quickPenalties.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickScroll}
                  >
                    {game.quickPenalties.map((qp) => (
                      <Pressable
                        key={qp.label}
                        style={[
                          styles.quickPill,
                          { borderColor: player.color + "55" },
                        ]}
                        onPress={() => applyQuickPenalty(player.id, qp.points)}
                      >
                        <Text
                          style={[styles.quickText, { color: player.color }]}
                        >
                          {qp.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </ScrollView>

          <PolymerButton
            label="Submit Round"
            onPress={handleSubmit}
            color="#00F5A0"
            textColor="#1A0533"
            size="lg"
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#2A0A60",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    maxHeight: 420,
  },
  playerBlock: {
    marginBottom: 18,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  playerName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  phasePill: {
    backgroundColor: "rgba(0,245,160,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  phaseText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#00F5A0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nudgeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 12,
  },
  quickScroll: {
    marginTop: 8,
  },
  quickPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  quickText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 16,
  },
});
