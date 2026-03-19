import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getGameById } from "@/constants/games";
import { useGame } from "@/context/GameContext";
import { PolymerButton } from "@/components/PolymerButton";
import { HouseRuleOverride } from "@/constants/games";

const PLAYER_COLORS = [
  "#FF2D78", "#00F5A0", "#FFB800", "#00BFFF",
  "#FF8C42", "#9B59B6", "#1ABC9C", "#E74C3C",
];

const PLAYER_SUGGESTIONS = [
  "Alex", "Blake", "Casey", "Drew", "Evan",
  "Frankie", "Gray", "Harper", "Indie", "Jamie",
];

export default function SetupScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const insets = useSafeAreaInsets();
  const { createSession } = useGame();

  const game = getGameById(gameId ?? "");
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [houseRules, setHouseRules] = useState<HouseRuleOverride[]>(
    game?.houseRules ?? []
  );
  const [dealerMethod, setDealerMethod] = useState<"first" | "random">("random");
  const [showRules, setShowRules] = useState(false);

  if (!game) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Game not found</Text>
      </View>
    );
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const addPlayer = useCallback(() => {
    if (playerNames.length >= game.maxPlayers) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayerNames((prev) => [...prev, ""]);
  }, [playerNames.length, game.maxPlayers]);

  const removePlayer = useCallback((idx: number) => {
    if (playerNames.length <= game.minPlayers) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
  }, [playerNames.length, game.minPlayers]);

  const updatePlayer = useCallback((idx: number, val: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const updateHouseRule = useCallback((ruleId: string, val: string) => {
    const numVal = parseFloat(val) || 0;
    setHouseRules((prev) =>
      prev.map((r) => (r.ruleId === ruleId ? { ...r, currentValue: numVal } : r))
    );
  }, []);

  const startGame = useCallback(() => {
    const validNames = playerNames.map((n, i) =>
      n.trim() || PLAYER_SUGGESTIONS[i] || `Player ${i + 1}`
    );
    const dealerIdx = dealerMethod === "random"
      ? Math.floor(Math.random() * validNames.length)
      : 0;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = createSession(game, validNames, houseRules);
    router.replace({ pathname: "/game/[id]", params: { id: session.id } });
  }, [playerNames, houseRules, dealerMethod, game, createSession]);

  const canStart = playerNames.length >= game.minPlayers &&
    playerNames.length <= game.maxPlayers;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View
            style={[styles.gameChip, { backgroundColor: game.color }]}
          >
            <Feather name={game.icon as any} size={14} color="#1A0533" />
            <Text style={styles.gameChipText}>{game.name}</Text>
          </View>
        </View>

        <Text style={styles.heading}>Setup Game</Text>
        <Text style={styles.subheading}>{game.description}</Text>

        <View style={styles.objectiveCard}>
          <Ionicons name="flag-outline" size={16} color="#FFB800" />
          <Text style={styles.objectiveText}>{game.objective}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Players</Text>
          <Text style={styles.sectionHint}>
            {game.minPlayers}–{game.maxPlayers} players
          </Text>

          {playerNames.map((name, idx) => (
            <View key={idx} style={styles.playerInputRow}>
              <View
                style={[
                  styles.playerColorDot,
                  { backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] },
                ]}
              />
              <View style={styles.playerInputWrap}>
                <TextInput
                  style={styles.playerInput}
                  value={name}
                  onChangeText={(v) => updatePlayer(idx, v)}
                  placeholder={PLAYER_SUGGESTIONS[idx] ?? `Player ${idx + 1}`}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  returnKeyType="next"
                />
              </View>
              {playerNames.length > game.minPlayers && (
                <Pressable
                  onPress={() => removePlayer(idx)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={16} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </View>
          ))}

          {playerNames.length < game.maxPlayers && (
            <Pressable style={styles.addPlayerBtn} onPress={addPlayer}>
              <Ionicons name="add" size={18} color="#00F5A0" />
              <Text style={styles.addPlayerText}>Add Player</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>First Dealer</Text>
          <View style={styles.dealerRow}>
            {(["random", "first"] as const).map((method) => (
              <Pressable
                key={method}
                style={[
                  styles.dealerOption,
                  dealerMethod === method && styles.dealerOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDealerMethod(method);
                }}
              >
                <Ionicons
                  name={method === "random" ? "shuffle" : "person"}
                  size={16}
                  color={dealerMethod === method ? "#00F5A0" : "rgba(255,255,255,0.5)"}
                />
                <Text
                  style={[
                    styles.dealerOptionText,
                    dealerMethod === method && styles.dealerOptionTextActive,
                  ]}
                >
                  {method === "random" ? "Random Dealer" : "First Player"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {houseRules.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.houseRulesHeader}
              onPress={() => setShowRules(!showRules)}
            >
              <View>
                <Text style={styles.sectionLabel}>House Rules</Text>
                <Text style={styles.sectionHint}>Tap to customize scoring</Text>
              </View>
              <Ionicons
                name={showRules ? "chevron-up" : "chevron-down"}
                size={18}
                color="rgba(255,255,255,0.5)"
              />
            </Pressable>

            {showRules && houseRules.map((rule) => (
              <View key={rule.ruleId} style={styles.houseRuleRow}>
                <Text style={styles.houseRuleLabel}>{rule.label}</Text>
                <View style={styles.houseRuleInputWrap}>
                  <TextInput
                    style={styles.houseRuleInput}
                    value={String(rule.currentValue)}
                    onChangeText={(v) => updateHouseRule(rule.ruleId, v)}
                    keyboardType="numbers-and-punctuation"
                    selectTextOnFocus
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <PolymerButton
          label="Start Game"
          onPress={startGame}
          color="#00F5A0"
          textColor="#1A0533"
          size="lg"
          disabled={!canStart}
          style={styles.startBtn}
          icon={<Feather name="play" size={16} color="#1A0533" />}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0533",
  },
  content: {
    paddingHorizontal: 20,
  },
  errContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A0533",
  },
  errText: {
    color: "#FFFFFF",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  gameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gameChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#1A0533",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 16,
    lineHeight: 20,
  },
  objectiveCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255,184,0,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.2)",
    alignItems: "flex-start",
  },
  objectiveText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 12,
  },
  playerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  playerColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  playerInputWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  playerInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
  },
  removeBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addPlayerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  addPlayerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#00F5A0",
  },
  dealerRow: {
    flexDirection: "row",
    gap: 10,
  },
  dealerOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dealerOptionActive: {
    backgroundColor: "rgba(0,245,160,0.08)",
    borderColor: "rgba(0,245,160,0.3)",
  },
  dealerOptionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  dealerOptionTextActive: {
    color: "#00F5A0",
  },
  houseRulesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  houseRuleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  houseRuleLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
  },
  houseRuleInputWrap: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
    alignItems: "center",
  },
  houseRuleInput: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFB800",
    textAlign: "center",
  },
  startBtn: {
    marginTop: 8,
  },
});
