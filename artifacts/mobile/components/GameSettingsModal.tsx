import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PolymerCard, NeuTrench, NeuButton, BrandButton, NeuIconWell } from "./PolymerCard";
import { GameSession, Player } from "@/context/GameContext";
import { GameDefinition, HouseRuleOverride, ScoreRule } from "@/constants/games";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface GameSettingsModalProps {
  visible: boolean;
  session: GameSession;
  game: GameDefinition;
  onClose: () => void;
  onUpdate: (updatedSession: GameSession) => void;
}

export function GameSettingsModal({
  visible,
  session,
  game,
  onClose,
  onUpdate,
}: GameSettingsModalProps) {
  const [houseRules, setHouseRules] = useState<HouseRuleOverride[]>(session.houseRules);
  const [targetScore, setTargetScore] = useState(String(session.targetScore ?? game.targetScore ?? 0));
  const [dealerIndex, setDealerIndex] = useState(session.dealerIndex);
  
  // Local state for score rules (cloned from session or game defaults)
  const [scoreRules, setScoreRules] = useState<ScoreRule[]>(
    session.customScoreRules || game.scoreRules || []
  );

  const handleUpdateRule = (ruleId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setHouseRules(prev => prev.map(r => r.ruleId === ruleId ? { ...r, currentValue: num } : r));
  };

  const handleUpdateScoreRule = (ruleId: string, val: string) => {
    const num = parseInt(val) || 0;
    setScoreRules(prev => prev.map(r => r.id === ruleId ? { ...r, points: num } : r));
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUpdate({
      ...session,
      houseRules,
      targetScore: parseInt(targetScore) || undefined,
      dealerIndex,
      customScoreRules: scoreRules,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <PolymerCard color="#1A0533" borderRadius={32} padding={0} style={styles.sheetContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>GAME SETTINGS</Text>
                <Text style={styles.subtitle}>{game.name} • Rules & Mechanics</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <NeuButton 
                  size={44} 
                  color="#150428" 
                  borderRadius={14} 
                  onPress={() => {
                    const path = game.parentId 
                      ? `/${game.parentId}/${game.id}` 
                      : `/${game.id}`;
                    onClose();
                    router.push(path as any);
                  }}
                >
                  <Ionicons name="book-outline" size={20} color="#00F5A0" />
                </NeuButton>
                <NeuButton size={44} color="#150428" borderRadius={14} onPress={onClose}>
                  <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
                </NeuButton>
              </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Target Score Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Win Condition</Text>
                <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={20} padding={16}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Target Score</Text>
                      <Text style={styles.labelSub}>Points required to win or end</Text>
                    </View>
                    <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={styles.inputTrench}>
                      <TextInput
                        style={styles.input}
                        value={targetScore}
                        onChangeText={setTargetScore}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                    </NeuTrench>
                  </View>
                </NeuTrench>
              </View>

              {/* Dealer Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dealer Rotation</Text>
                <View style={styles.dealerBox}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerStrip}>
                    {session.players.map((p, i) => (
                      <Pressable 
                        key={p.id} 
                        onPress={() => {
                          setDealerIndex(i);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={styles.playerTab}
                      >
                        <NeuTrench 
                          color={dealerIndex === i ? p.color + "33" : "rgba(0,0,0,0.2)"} 
                          borderRadius={14} 
                          padding={10}
                          style={[
                            styles.playerTrench,
                            dealerIndex === i ? { borderColor: p.color, borderWidth: 1 } : {}
                          ]}
                        >
                          <MaterialCommunityIcons 
                            name={dealerIndex === i ? "cards" : "cards-outline"} 
                            size={16} 
                            color={dealerIndex === i ? p.color : "rgba(255,255,255,0.2)"} 
                          />
                          <Text style={[styles.playerName, dealerIndex === i && { color: "#FFF" }]}>{p.name}</Text>
                        </NeuTrench>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* House Rules Section */}
              {houseRules.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>House Rules</Text>
                  <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={24} padding={16}>
                    {houseRules.map((rule, idx) => (
                      <View key={rule.ruleId} style={[styles.row, idx > 0 && styles.ruleSeparator]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ruleLabel}>{rule.label}</Text>
                        </View>
                        <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={styles.smallInputTrench}>
                          <TextInput
                            style={styles.smallInput}
                            value={String(rule.currentValue)}
                            onChangeText={(v) => handleUpdateRule(rule.ruleId, v)}
                            keyboardType="numeric"
                          />
                        </NeuTrench>
                      </View>
                    ))}
                  </NeuTrench>
                </View>
              )}

              {/* Score Rules Section (Customizable Point Overrides) */}
              {scoreRules.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Calculator Point Overrides</Text>
                  <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={24} padding={16}>
                    {scoreRules.map((rule, idx) => (
                      <View key={rule.id} style={[styles.row, idx > 0 && styles.ruleSeparator]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ruleLabel}>{rule.label}</Text>
                        </View>
                        <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={12} padding={0} style={styles.smallInputTrench}>
                          <TextInput
                            style={[styles.smallInput, { color: "#00F5A0" }]}
                            value={String(rule.points)}
                            onChangeText={(v) => handleUpdateScoreRule(rule.id, v)}
                            keyboardType="numeric"
                          />
                        </NeuTrench>
                      </View>
                    ))}
                  </NeuTrench>
                </View>
              )}
              
              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
              <BrandButton onPress={handleSave} style={{ height: 60, width: "100%" }}>
                <Text style={styles.saveBtnText}>SAVE SESSION CONFIG</Text>
              </BrandButton>
            </View>
          </PolymerCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  sheet: { height: "85%", width: "100%" },
  sheetContent: { flex: 1, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 24,
    paddingBottom: 20
  },
  title: { fontFamily: "Bungee_400Regular", fontSize: 24, color: "#FFFFFF" },
  subtitle: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 2, textTransform: "uppercase" },
  scroll: { flex: 1, paddingHorizontal: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF" },
  labelSub: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  inputTrench: { width: 100, height: 44 },
  input: { 
    flex: 1, 
    height: 44,
    maxHeight: 44,
    padding: 0,
    margin: 0,
    color: "#00F5A0", 
    fontFamily: "Bungee_400Regular", 
    fontSize: 16, 
    textAlign: "center",
    ...Platform.select({
      android: { textAlignVertical: "center" },
      web: { outlineStyle: "none", lineHeight: "44px" } as any,
      ios: { lineHeight: 44 }
    })
  },
  dealerBox: { marginTop: 8 },
  playerStrip: { flexDirection: "row" },
  playerTab: { marginRight: 10 },
  playerTrench: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 100 },
  playerName: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.6)" },
  ruleSeparator: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  ruleLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  smallInputTrench: { width: 60, height: 36 },
  smallInput: { 
    flex: 1, 
    height: 36,
    maxHeight: 36,
    padding: 0,
    margin: 0,
    color: "#FFB800", 
    fontFamily: "Bungee_400Regular", 
    fontSize: 12, 
    textAlign: "center",
    ...Platform.select({
      android: { textAlignVertical: "center" },
      web: { outlineStyle: "none", lineHeight: "36px" } as any,
      ios: { lineHeight: 36 }
    })
  },
  footer: { padding: 24, paddingTop: 0 },
  saveBtnText: { fontFamily: "Bungee_400Regular", fontSize: 16, color: "#FFF", letterSpacing: 1, paddingTop: 4 },
});
