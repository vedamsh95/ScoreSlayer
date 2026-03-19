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
import { NeuTrench, NeuIconWell } from "./PolymerCard";

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

  const nudge = useCallback((playerId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScores((prev) => {
      const current = parseFloat(prev[playerId] ?? "0") || 0;
      return { ...prev, [playerId]: String(current + delta) };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const parsed: Record<string, number> = {};
    for (const p of players) {
      parsed[p.id] = parseFloat(scores[p.id] ?? "0") || 0;
    }
    onSubmit(parsed);
    setScores({});
  }, [players, scores, onSubmit]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        {/* Clay bottom sheet */}
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          {/* Top gloss on the sheet */}
          <View style={styles.sheetGloss} pointerEvents="none" />

          {/* Neumorphic pill handle */}
          <NeuTrench color="#200644" borderRadius={4} padding={0} style={styles.handle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.title}>Round {round} Scores</Text>
              <Text style={styles.subtitle}>{game.name}</Text>
            </View>
            {/* Neumorphic close button */}
            <NeuIconWell color="#200644" size={38} borderRadius={12}>
              <Pressable onPress={onClose} style={styles.closePressable}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </NeuIconWell>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {players.map((player) => (
              <View key={player.id} style={styles.playerBlock}>
                {/* Player label row */}
                <View style={styles.playerHeaderRow}>
                  <View style={[styles.colorDot, { backgroundColor: player.color }]} />
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.currentPhase !== undefined && (
                    <NeuTrench color="#200644" borderRadius={8} padding={4} style={styles.phaseBadge}>
                      <Text style={[styles.phaseText, { color: player.color }]}>
                        Ph.{player.currentPhase}
                      </Text>
                    </NeuTrench>
                  )}
                </View>

                {/* Score input row: clay minus | neu input well | clay plus */}
                <View style={styles.inputRow}>
                  {/* Clay minus button */}
                  <View style={[styles.nudgeShadow, { borderRadius: 16 }]}>
                    <Pressable
                      onPress={() => nudge(player.id, -1)}
                      style={[styles.nudgeBody, { borderRadius: 16, backgroundColor: "#FF2D78" }]}
                    >
                      <View style={styles.nudgeGloss} pointerEvents="none" />
                      <Ionicons name="remove" size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Neumorphic score input trench */}
                  <NeuTrench
                    color="#200644"
                    borderRadius={16}
                    padding={0}
                    style={[styles.scoreTrench, { borderColor: player.color + "44" }]}
                  >
                    <TextInput
                      style={[styles.scoreInput, { color: player.color }]}
                      value={scores[player.id] ?? ""}
                      onChangeText={(v) => updateScore(player.id, v)}
                      keyboardType="numbers-and-punctuation"
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectTextOnFocus
                      textAlign="center"
                    />
                  </NeuTrench>

                  {/* Clay plus button */}
                  <View style={[styles.nudgeShadow, { borderRadius: 16 }]}>
                    <Pressable
                      onPress={() => nudge(player.id, 1)}
                      style={[styles.nudgeBody, { borderRadius: 16, backgroundColor: "#00F5A0" }]}
                    >
                      <View style={styles.nudgeGloss} pointerEvents="none" />
                      <Ionicons name="add" size={20} color="#1A0533" />
                    </Pressable>
                  </View>
                </View>

                {/* Quick penalty chips — clay colored pills */}
                {game.quickPenalties && game.quickPenalties.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickRow}
                  >
                    {game.quickPenalties.map((qp) => (
                      <Pressable
                        key={qp.label}
                        onPress={() => nudge(player.id, qp.points)}
                        style={[styles.quickChipShadow, { borderRadius: 12 }]}
                      >
                        <View style={[styles.quickChipBody, { borderRadius: 12, backgroundColor: player.color + "22", borderColor: player.color + "55" }]}>
                          <Text style={[styles.quickChipText, { color: player.color }]}>
                            {qp.label}
                          </Text>
                        </View>
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
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  sheet: {
    // Clay bottom sheet — inflated look
    backgroundColor: "#2A0A60",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: "88%",
    // The big clay drop shadow going upward
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 18,
    overflow: "hidden",
    position: "relative",
  },
  sheetGloss: {
    position: "absolute",
    top: 6,
    left: 12,
    width: "50%",
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 50,
    zIndex: 0,
  },
  handle: {
    width: 40,
    height: 5,
    alignSelf: "center",
    marginBottom: 16,
    zIndex: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    zIndex: 2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  closePressable: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { maxHeight: 440, zIndex: 2 },
  playerBlock: { marginBottom: 22 },
  playerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  playerName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF", flex: 1 },
  phaseBadge: {},
  phaseText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  // Score input row
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nudgeShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  nudgeBody: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  nudgeGloss: {
    position: "absolute",
    top: 3,
    left: 4,
    width: "50%",
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  scoreTrench: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    borderWidth: 1.5,
  },
  scoreInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    textAlign: "center",
    height: 52,
    width: "100%",
    paddingHorizontal: 12,
  },
  // Quick chips
  quickRow: {
    flexDirection: "row",
    paddingTop: 10,
    gap: 8,
  },
  quickChipShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  quickChipBody: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  quickChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  submitBtn: { marginTop: 16, zIndex: 2 },
});
