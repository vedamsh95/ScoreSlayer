import React, { useState } from "react";
import {
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
import { getGameById } from "@/constants/games";
import { useGame } from "@/context/GameContext";
import { 
  PolymerCard, 
  NeuTrench, 
  NeuButton, 
  BrandButton, 
  NeuIconWell 
} from "@/components/PolymerCard";

export default function GameSetupScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const insets = useSafeAreaInsets();
  const { createSession } = useGame();
  
  const game = getGameById(gameId ?? "");
  
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2"]);
  const [newPlayerName, setNewPlayerName] = useState("");

  if (!game) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Game not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && playerNames.length < game.maxPlayers) {
      setPlayerNames([...playerNames, newPlayerName.trim()]);
      setNewPlayerName("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length > game.minPlayers) {
      const updated = [...playerNames];
      updated.splice(index, 1);
      setPlayerNames(updated);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = createSession(game, playerNames, game.houseRules ?? []);
    router.replace({ pathname: "/game/[id]", params: { id: session.id } });
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <NeuIconWell color="#1A0533" size={42} borderRadius={14}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
          </NeuIconWell>
          <Text style={styles.headerTitle}>Setup Game</Text>
          <View style={{ width: 42 }} />
        </View>

        <PolymerCard color={game.color} borderRadius={24} padding={20} style={styles.gameCard}>
          <View style={styles.gameIconWrap}>
            <Feather name={game.icon as any} size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.gameName}>{game.name}</Text>
          <Text style={styles.gameObjective}>{game.objective}</Text>
        </PolymerCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({playerNames.length})</Text>
          <View style={styles.playerList}>
            {playerNames.map((name, i) => (
              <NeuTrench key={i} color="#150428" borderRadius={16} padding={12} style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <View style={[styles.playerDot, { backgroundColor: game.color }]} />
                  <Text style={styles.playerName}>{name}</Text>
                </View>
                {playerNames.length > game.minPlayers && (
                  <Pressable onPress={() => handleRemovePlayer(i)}>
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.3)" />
                  </Pressable>
                )}
              </NeuTrench>
            ))}
          </View>

          {playerNames.length < game.maxPlayers && (
            <View style={styles.addPlayerRow}>
              <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.inputTrench}>
                <TextInput
                  style={styles.input}
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  placeholder="New Player Name..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  onSubmitEditing={handleAddPlayer}
                />
              </NeuTrench>
              <Pressable onPress={handleAddPlayer}>
                <NeuIconWell color="rgba(0, 245, 160, 0.1)" size={48} borderRadius={14}>
                  <Feather name="plus" size={24} color="#00F5A0" />
                </NeuIconWell>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <BrandButton
          onPress={handleStart}
          style={styles.startBtn}
        >
          <Text style={styles.startBtnText}>START MISSION</Text>
        </BrandButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  headerTitle: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 },
  backBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  gameCard: { marginBottom: 32, alignItems: "center" },
  gameIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  gameName: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFFFFF", marginBottom: 4 },
  gameObjective: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  section: { gap: 16 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 14, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 },
  playerList: { gap: 8 },
  playerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playerInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerDot: { width: 10, height: 10, borderRadius: 5 },
  playerName: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
  addPlayerRow: { flexDirection: "row", gap: 12, alignItems: "center", marginTop: 8 },
  inputTrench: { flex: 1, height: 48 },
  input: { flex: 1, height: 48, paddingHorizontal: 16, color: "#FFFFFF", fontFamily: "Inter_600SemiBold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, backgroundColor: "rgba(26,5,51,0.9)" },
  startBtn: { height: 62 },
  startBtnText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFFFFF", letterSpacing: 1 },
  errContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1A0533", gap: 12 },
  errText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  backLink: { color: "#00F5A0", fontFamily: "Inter_600SemiBold" },
});
