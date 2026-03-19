import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";
import { GAMES, GAME_CATEGORIES, GameCategory } from "@/constants/games";
import { PolymerCard } from "@/components/PolymerCard";

const CATEGORY_COLORS: Record<GameCategory, string> = {
  card: "#FF2D78",
  board: "#FFB800",
  trick: "#6B21E8",
  dice: "#00F5A0",
  tile: "#00BFFF",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useGame();

  const activeSession = useMemo(
    () => state.sessions.find((s) => !s.isComplete),
    [state.sessions]
  );

  const recentCompleted = useMemo(
    () => state.sessions.filter((s) => s.isComplete).slice(0, 3),
    [state.sessions]
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Game Night</Text>
          <Text style={styles.appName}>ScoreSlayer</Text>
        </View>
        <Pressable
          style={styles.historyBtn}
          onPress={() => router.push("/history")}
        >
          <Ionicons name="time-outline" size={22} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      {activeSession && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: "/game/[id]", params: { id: activeSession.id } });
          }}
        >
          <PolymerCard
            color={activeSession.gameColor}
            style={styles.activeCard}
            size="lg"
          >
            <View style={styles.activeCardBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.activeGameName}>{activeSession.gameName}</Text>
            <Text style={styles.activeRound}>
              Round {activeSession.currentRound} · {activeSession.players.length} players
            </Text>
            <View style={styles.activeScoreRow}>
              {activeSession.players.slice(0, 3).map((p) => (
                <View key={p.id} style={styles.activePlayerChip}>
                  <View
                    style={[styles.activeDot, { backgroundColor: p.color }]}
                  />
                  <Text style={styles.activePlayerName}>{p.name}</Text>
                  <Text style={[styles.activePlayerScore, { color: p.color }]}>
                    {p.totalScore}
                  </Text>
                </View>
              ))}
              {activeSession.players.length > 3 && (
                <Text style={styles.morePlayers}>
                  +{activeSession.players.length - 3} more
                </Text>
              )}
            </View>
            <View style={styles.activeCardArrow}>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </PolymerCard>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Choose a Game</Text>

      {GAME_CATEGORIES.map((cat) => {
        const catGames = GAMES.filter((g) => g.category === cat.id);
        return (
          <View key={cat.id} style={styles.categorySection}>
            <View style={styles.catHeader}>
              <View
                style={[
                  styles.catIconBadge,
                  { backgroundColor: CATEGORY_COLORS[cat.id] + "22" },
                ]}
              >
                <Feather
                  name={cat.icon as any}
                  size={14}
                  color={CATEGORY_COLORS[cat.id]}
                />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gameRow}
            >
              {catGames.map((game) => (
                <Pressable
                  key={game.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({
                      pathname: "/setup/[gameId]",
                      params: { gameId: game.id },
                    });
                  }}
                >
                  <View
                    style={[
                      styles.gameCard,
                      { backgroundColor: game.color + "18", borderColor: game.color + "33" },
                    ]}
                  >
                    <View
                      style={[
                        styles.gameIconWell,
                        { backgroundColor: "rgba(0,0,0,0.35)" },
                      ]}
                    >
                      <Feather
                        name={game.icon as any}
                        size={22}
                        color={game.color}
                      />
                    </View>
                    <Text style={styles.gameName} numberOfLines={2}>
                      {game.name}
                    </Text>
                    <Text style={styles.gamePlayerCount}>
                      {game.minPlayers}–{game.maxPlayers}p
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
      })}

      {recentCompleted.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            <Pressable onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {recentCompleted.map((s) => (
            <Pressable
              key={s.id}
              style={styles.recentRow}
              onPress={() => router.push({ pathname: "/results/[id]", params: { id: s.id } })}
            >
              <View style={[styles.recentDot, { backgroundColor: s.gameColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentGame}>{s.gameName}</Text>
                <Text style={styles.recentWinner}>
                  Winner: {s.winnerName} · {s.players.length}p
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  historyBtn: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  activeCard: {
    marginBottom: 28,
  },
  activeCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00F5A0",
  },
  liveBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#00F5A0",
    letterSpacing: 1.5,
  },
  activeGameName: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  activeRound: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },
  activeScoreRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  activePlayerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activePlayerName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  activePlayerScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  morePlayers: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    alignSelf: "center",
  },
  activeCardArrow: {
    position: "absolute",
    right: 20,
    top: "50%",
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  catIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gameRow: {
    paddingBottom: 4,
    gap: 10,
  },
  gameCard: {
    width: 108,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gameIconWell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  gameName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 17,
  },
  gamePlayerCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  recentSection: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAllText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#00F5A0",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recentGame: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  recentWinner: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
});
