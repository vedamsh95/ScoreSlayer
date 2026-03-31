import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getGameById, HouseRuleOverride } from "@/constants/games";
import { useGame } from "@/context/GameContext";
import { PolymerCard, NeuTrench, NeuIconWell, BrandButton } from "@/components/PolymerCard";

const PLAYER_COLORS = [
  "#FF2D78", "#00F5A0", "#FFB800", "#00BFFF",
  "#FF8C42", "#9B59B6", "#1ABC9C", "#E74C3C",
];

const PLAYER_SUGGESTIONS = [
  "Alex", "Blake", "Casey", "Drew", "Evan",
  "Frankie", "Gray", "Harper", "Indie", "Jamie",
];

/**
 * @screen SetupScreen
 */
export default function SetupScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const insets = useSafeAreaInsets();
  const { createSession } = useGame();

  const game = getGameById(gameId ?? "");
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [houseRules, setHouseRules] = useState<HouseRuleOverride[]>(game?.houseRules ?? []);
  const [scoreRules, setScoreRules] = useState<any[]>(game?.scoreRules ?? []);
  const [dealerMethod, setDealerMethod] = useState<"first" | "random">("random");
  const [showRules, setShowRules] = useState(false);
  const [showScoreRules, setShowScoreRules] = useState(false);
  const [newRuleLabel, setNewRuleLabel] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

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

  const updateScoreRule = useCallback((ruleId: string, val: string) => {
    const numVal = parseFloat(val) || 0;
    setScoreRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, points: numVal } : r))
    );
  }, []);

  const addCustomScoreRule = useCallback(() => {
    if (!newRuleLabel.trim()) return;
    const points = parseFloat(newRuleValue) || 0;
    const newId = `custom_${Date.now()}`;
    setScoreRules((prev) => [...prev, { id: newId, label: newRuleLabel.trim(), points }]);
    setNewRuleLabel("");
    setNewRuleValue("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newRuleLabel, newRuleValue]);

  const removeScoreRule = useCallback((id: string) => {
    setScoreRules((prev) => prev.filter(r => r.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const startGame = useCallback(() => {
    const validNames = playerNames.map((n, i) =>
      n.trim() || PLAYER_SUGGESTIONS[i] || `Player ${i + 1}`
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = createSession(game, validNames, houseRules, scoreRules);
    router.replace({ pathname: "/game/[id]", params: { id: session.id } });
  }, [playerNames, houseRules, scoreRules, game, createSession]);

  const canStart = playerNames.length >= game.minPlayers && playerNames.length <= game.maxPlayers;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top navigation row */}
        <View style={styles.topRow}>
          {/* Neumorphic back button */}
          <NeuIconWell color="rgba(0,0,0,0.2)" size={42} borderRadius={14}>
            <Pressable onPress={() => router.back()} style={styles.backPressable}>
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
            </Pressable>
          </NeuIconWell>

          {/* Clay game badge */}
          <View style={[styles.gameChipShadow, { borderRadius: 14 }]}>
            <View style={[styles.gameChipBody, { backgroundColor: game.color, borderRadius: 14 }]}>
              <View style={styles.gameChipGloss} pointerEvents="none" />
              <Ionicons name={game.icon as any} size={14} color="#1A0533" />
              <Text style={styles.gameChipText}>{game.name}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>Setup Game</Text>
        <Text style={styles.subheading}>{game.description}</Text>

        {/* Objective — neumorphic trench */}
        <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={16} padding={14} style={styles.objectiveCard}>
          <View style={styles.objectiveRow}>
            <Ionicons name="flag-outline" size={15} color="#FFB800" />
            <Text style={styles.objectiveText}>{game.objective}</Text>
          </View>
        </NeuTrench>

        {/* Action Row for Rules */}
        {(houseRules.length > 0 || scoreRules.length > 0) && (
          <View style={styles.rulesActionRow}>
            <BrandButton
              onPress={() => setShowRules(!showRules)}
              color={showRules ? "#FFB800" : "rgba(255,255,255,0.1)"}
              borderRadius={16}
              style={{ flex: 1, height: 48 }}
            >
              <View style={styles.rulesBtnContent}>
                <Ionicons name="options-outline" size={18} color={showRules ? "#1A0533" : "#FFFFFF"} />
                <Text style={[styles.rulesBtnText, { color: showRules ? "#1A0533" : "#FFFFFF" }]}>HOUSE RULES</Text>
              </View>
            </BrandButton>
          </View>
        )}

        {/* Expandable House Rules Section */}
        {showRules && (
          <View style={styles.expandedRulesSection}>
            {houseRules.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.rulesSubLabel}>Gameplay Modifiers</Text>
                <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={20} padding={12}>
                  {houseRules.map((rule) => (
                    <View key={rule.ruleId} style={styles.ruleRow}>
                      <Text style={styles.ruleLabel}>{rule.label}</Text>
                      <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={styles.ruleInputTrench}>
                        <TextInput
                          style={styles.ruleInput}
                          value={String(rule.currentValue)}
                          onChangeText={(v) => updateHouseRule(rule.ruleId, v)}
                          keyboardType="numbers-and-punctuation"
                          selectTextOnFocus
                        />
                      </NeuTrench>
                    </View>
                  ))}
                </NeuTrench>
              </View>
            )}

            {scoreRules.length > 0 && (
              <View>
                <Text style={styles.rulesSubLabel}>Calculator Buttons</Text>
                <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={20} padding={12}>
                  <View style={styles.scoreRulesGrid}>
                    {scoreRules.map((rule) => (
                      <View key={rule.id} style={styles.scoreRuleItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scoreRuleLabel} numberOfLines={1}>{rule.label}</Text>
                        </View>
                        <View style={styles.ruleInputActions}>
                          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={styles.scoreInputTrench}>
                            <TextInput
                              style={styles.scoreInput}
                              value={String(rule.points)}
                              onChangeText={(v) => updateScoreRule(rule.id, v)}
                              keyboardType="numeric"
                              selectTextOnFocus
                            />
                          </NeuTrench>
                          {game.id === 'custom_game' && (
                            <Pressable onPress={() => removeScoreRule(rule.id)} style={styles.miniX}>
                              <Ionicons name="close-circle" size={16} color="rgba(255,80,80,0.4)" />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>

                  {game.id === 'custom_game' && (
                    <View style={styles.addRuleRow}>
                      <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={[styles.inputTrench, { flex: 2, height: 38 }]}>
                        <TextInput
                          placeholder="Button Name"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          style={styles.ruleMiniInput}
                          value={newRuleLabel}
                          onChangeText={setNewRuleLabel}
                        />
                      </NeuTrench>
                      <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={[styles.inputTrench, { flex: 1, height: 38 }]}>
                        <TextInput
                          placeholder="Pts"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          style={[styles.ruleMiniInput, { textAlign: 'center' }]}
                          value={newRuleValue}
                          onChangeText={setNewRuleValue}
                          keyboardType="numeric"
                        />
                      </NeuTrench>
                      <Pressable onPress={addCustomScoreRule} style={styles.addBtnContainer}>
                        <NeuIconWell color="rgba(0,245,160,0.15)" size={38} borderRadius={10}>
                          <Ionicons name="add" size={20} color="#00F5A0" />
                        </NeuIconWell>
                      </Pressable>
                    </View>
                  )}
                </NeuTrench>
              </View>
            )}
          </View>
        )}

        {/* Players section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Players</Text>
            <Text style={styles.sectionHint}>{game.minPlayers}–{game.maxPlayers}p</Text>
          </View>

          {playerNames.map((name, idx) => (
            <View key={idx} style={styles.playerRow}>
              {/* Color indicator — clay dot */}
              <View style={[styles.colorDotShadow, { borderRadius: 12 }]}>
                <View style={[styles.colorDotBody, { backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length], borderRadius: 12 }]}>
                  <View style={styles.colorDotGloss} pointerEvents="none" />
                </View>
              </View>

              {/* Neumorphic text input trench */}
              <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={15} padding={0} style={styles.inputTrench}>
                <TextInput
                  style={styles.playerInput}
                  value={name}
                  onChangeText={(v) => updatePlayer(idx, v)}
                  placeholder={PLAYER_SUGGESTIONS[idx] ?? `Player ${idx + 1}`}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  returnKeyType="next"
                />
              </NeuTrench>

              {playerNames.length > game.minPlayers && (
                <Pressable onPress={() => removePlayer(idx)} style={styles.removeBtn}>
                  <NeuIconWell color="rgba(0,0,0,0.2)" size={34} borderRadius={10}>
                    <Ionicons name="close" size={14} color="rgba(255,80,80,0.8)" />
                  </NeuIconWell>
                </Pressable>
              )}
            </View>
          ))}

          {playerNames.length < game.maxPlayers && (
            <Pressable style={styles.addPlayerRow} onPress={addPlayer}>
              <NeuIconWell color="rgba(0,0,0,0.2)" size={34} borderRadius={10}>
                <Ionicons name="add" size={16} color="#00F5A0" />
              </NeuIconWell>
              <Text style={styles.addPlayerText}>Add Player</Text>
            </Pressable>
          )}
        </View>

        {/* Dealer method section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>First Dealer</Text>
          <View style={styles.dealerRow}>
            {(["random", "first"] as const).map((method) => {
              const active = dealerMethod === method;
              return active ? (
                // Active = clay (popped out)
                <Pressable
                  key={method}
                  style={[styles.dealerOptionShadow, { flex: 1, borderRadius: 18 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDealerMethod(method);
                  }}
                >
                  <View style={[styles.dealerOptionClay, { borderRadius: 18, backgroundColor: "#00F5A0" }]}>
                    <View style={styles.dealerGloss} pointerEvents="none" />
                    <Ionicons name={method === "random" ? "shuffle" : "person"} size={15} color="#1A0533" />
                    <Text style={styles.dealerTextActive}>{method === "random" ? "Random" : "First Player"}</Text>
                  </View>
                </Pressable>
              ) : (
                // Inactive = neumorphic trench
                <Pressable key={method} style={{ flex: 1 }} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDealerMethod(method);
                }}>
                  <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={18} padding={12} style={styles.dealerOptionNeu}>
                    <Ionicons name={method === "random" ? "shuffle" : "person"} size={15} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.dealerTextInactive}>{method === "random" ? "Random" : "First Player"}</Text>
                  </NeuTrench>
                </Pressable>
              );
            })}
          </View>
        </View>


        <BrandButton
          onPress={startGame}
          style={[styles.startBtn, { height: 64, width: "100%" }]}
        >
          <View style={styles.startBtnContent}>
            <Feather name="play" size={18} color="#FFFFFF" />
            <Text style={styles.brandBtnText}>START GAME</Text>
          </View>
        </BrandButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 20 },
  errContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1A0533" },
  errText: { color: "#FFFFFF", fontFamily: "Inter_400Regular", fontSize: 16 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  backPressable: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  // Clay game chip
  gameChipShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 10, elevation: 8,
  },
  gameChipBody: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 8, overflow: "hidden", position: "relative",
  },
  gameChipGloss: {
    position: "absolute", top: 2, left: 5, width: "50%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.22)", borderBottomRightRadius: 20,
  },
  gameChipText: { fontFamily: "Bungee_400Regular", fontSize: 11, color: "#1A0533", zIndex: 2, paddingTop: 2 },
  heading: { fontFamily: "Bungee_400Regular", fontSize: 24, color: "#FFFFFF", marginBottom: 6 },
  subheading: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 15, 
    color: "rgba(255,255,255,0.8)", 
    marginBottom: 20, 
    lineHeight: 22 
  },
  // Objective
  objectiveCard: { marginBottom: 20 },
  objectiveRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  objectiveText: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 14, 
    color: "rgba(255,255,255,0.7)", 
    flex: 1, 
    lineHeight: 20 
  },
  // Rules Action
  rulesActionRow: { marginBottom: 24 },
  rulesBtnContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  rulesBtnText: { fontFamily: "Bungee_400Regular", fontSize: 12, paddingTop: 3 },
  expandedRulesSection: { marginBottom: 24 },
  rulesSubLabel: { fontFamily: "Bungee_400Regular", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, marginLeft: 4 },
  // Section
  section: { marginBottom: 26 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 },
  sectionLabel: { fontFamily: "Bungee_400Regular", fontSize: 14, color: "#FFFFFF" },
  sectionHint: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  // Player rows
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  colorDotShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 6, elevation: 5,
  },
  colorDotBody: { width: 24, height: 24, overflow: "hidden", position: "relative" },
  colorDotGloss: {
    position: "absolute", top: 2, left: 2, width: "55%", height: "50%",
    backgroundColor: "rgba(255,255,255,0.3)", borderBottomRightRadius: 8,
  },
  inputTrench: { flex: 1, height: 48 },
  playerInput: {
    fontFamily: "Inter_500Medium", fontSize: 15, color: "#FFFFFF",
    paddingHorizontal: 14, height: 48,
  },
  removeBtn: {},
  addPlayerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  addPlayerText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#00F5A0", paddingTop: 2 },
  // Dealer options
  dealerRow: { flexDirection: "row", gap: 10 },
  dealerOptionShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 9,
  },
  dealerOptionClay: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 13, overflow: "hidden", position: "relative",
  },
  dealerGloss: {
    position: "absolute", top: 2, left: 6, width: "45%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.28)", borderBottomRightRadius: 20,
  },
  dealerTextActive: { fontFamily: "Bungee_400Regular", fontSize: 11, color: "#1A0533", zIndex: 2, paddingTop: 3 },
  dealerOptionNeu: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  dealerTextInactive: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  // House rules
  rulesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  ruleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 8, gap: 12,
  },
  ruleLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.6)", flex: 1 },
  ruleInputTrench: { minWidth: 70, height: 36, justifyContent: "center" },
  ruleInput: {
    fontFamily: "Bungee_400Regular", fontSize: 12, color: "#FFB800",
    textAlign: "center", paddingHorizontal: 10, height: 36, paddingTop: 4
  },
  startBtn: { marginTop: 10 },
  startBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandBtnText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingTop: 4,
  },
  // Card rules
  scoreRulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreRuleItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scoreRuleLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
    marginRight: 4,
  },
  scoreInputTrench: {
    width: 46,
    height: 32,
    justifyContent: "center",
  },
  scoreInput: {
    fontFamily: "Bungee_400Regular",
    fontSize: 11,
    color: "#00F5A0",
    textAlign: "center",
    paddingHorizontal: 2,
    height: 32,
    paddingTop: 3
  },
  ruleMiniInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#FFFFFF",
    paddingHorizontal: 10,
    height: 38,
  },
  addRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  addBtnContainer: {
    marginLeft: 4,
  },
  ruleInputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniX: {
    padding: 2,
  }
});
