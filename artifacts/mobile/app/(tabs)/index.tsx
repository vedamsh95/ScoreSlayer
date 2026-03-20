import React, { useMemo } from "react";
import {
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
import { MAIN_GAMES, GAME_CATEGORIES, GameCategory, GameDefinition } from "@/constants/games";
import { PolymerCard, NeuIconWell, NeuTrench } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const CATEGORY_COLORS: Record<string, string> = {
  card: "#FF2D78",
  board: "#FFB800",
  trick: "#6B21E8",
  dice: "#00F5A0",
  tile: "#00BFFF",
  uno: "#FF2D78",
};

// Extracted animated game card component (to avoid hook-in-loop)
function GameCard({ game, onPress }: { game: GameDefinition; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { marginRight: 10 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.93, { damping: 18, stiffness: 500 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 380 });
        }}
      >
        {/* Clay outer card */}
        <View style={[styles.gameCardShadow, { borderRadius: 22 }]}>
          <View
            style={[
              styles.gameCardBody,
              { backgroundColor: game.color, borderRadius: 22 },
            ]}
          >
            {/* Top-left gloss */}
            <View style={styles.gameCardGloss} pointerEvents="none" />
            {/* Bottom-right inner shadow */}
            <View style={styles.gameCardInnerShadow} pointerEvents="none" />

            {/* Neumorphic icon well carved into the clay */}
            <NeuIconWell
              color={darken(game.color, 0.45)}
              size={46}
              borderRadius={14}
              style={styles.iconWell}
            >
              <Feather name={game.icon as any} size={20} color={game.color} />
            </NeuIconWell>

            <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>
            {game.hasVariants ? (
              <NeuTrench
                color={darken(game.color, 0.45)}
                borderRadius={8}
                padding={4}
                style={{ alignSelf: "flex-start" }}
              >
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 8, color: game.color, letterSpacing: 0.8 }}>
                  8 VARIANTS
                </Text>
              </NeuTrench>
            ) : (
              <Text style={styles.gamePlayerCount}>{game.minPlayers}–{game.maxPlayers}p</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Darken a hex color by a factor (0-1)
function darken(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

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
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>GAME NIGHT</Text>
          <Text style={styles.appName}>ScoreSlayer</Text>
        </View>
        <Pressable style={styles.historyBtn} onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={22} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      {/* Active game banner — clay card */}
      {activeSession && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: "/game/[id]", params: { id: activeSession.id } });
          }}
          style={{ marginBottom: 30 }}
        >
          <PolymerCard color={activeSession.gameColor} size="lg">
            <View style={styles.activeBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE GAME</Text>
            </View>

            <Text style={styles.activeGameName}>{activeSession.gameName}</Text>
            <Text style={styles.activeRound}>
              Round {activeSession.currentRound} · {activeSession.players.length} players
            </Text>

            {/* Neumorphic score chips carved into the clay */}
            <View style={styles.activeScoreRow}>
              {activeSession.players.slice(0, 3).map((p) => (
                <NeuTrench
                  key={p.id}
                  color={darken(activeSession.gameColor, 0.4)}
                  borderRadius={12}
                  padding={8}
                  style={styles.scoreChip}
                >
                  <View style={[styles.chipDotInline, { backgroundColor: p.color }]} />
                  <Text style={styles.chipName}>{p.name}</Text>
                  <Text style={[styles.chipScore, { color: p.color }]}>{p.totalScore}</Text>
                </NeuTrench>
              ))}
            </View>

            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap to resume</Text>
              <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
            </View>
          </PolymerCard>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Choose a Game</Text>

      {GAME_CATEGORIES.map((cat) => {
        const catGames = MAIN_GAMES.filter((g) => g.category === cat.id);
        if (catGames.length === 0) return null;
        return (
          <View key={cat.id} style={styles.categorySection}>
            <View style={styles.catHeader}>
              {/* Small neumorphic badge for category icon */}
              <NeuIconWell color="#150428" size={28} borderRadius={9} style={styles.catIconBadge}>
                <Feather name={cat.icon as any} size={13} color={CATEGORY_COLORS[cat.id]} />
              </NeuIconWell>
              <Text style={[styles.catLabel, { color: CATEGORY_COLORS[cat.id] }]}>
                {cat.label.toUpperCase()}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 6, paddingLeft: 2 }}
            >
              {catGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (game.hasVariants) {
                      router.push(`/${game.id}` as any);
                    } else {
                      router.push({ pathname: "/setup/[gameId]", params: { gameId: game.id } });
                    }
                  }}
                />
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
              onPress={() => router.push({ pathname: "/results/[id]", params: { id: s.id } })}
            >
              <NeuTrench
                color="#150428"
                borderRadius={16}
                padding={14}
                style={styles.recentRow}
              >
                <View style={[styles.recentColorBar, { backgroundColor: s.gameColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentGame}>{s.gameName}</Text>
                  <Text style={styles.recentWinner}>
                    {s.winnerName} won · {s.players.length} players
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.25)" />
              </NeuTrench>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 3,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  historyBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#150428",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    // Neumorphic history button
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
  },
  // Active game card internals
  activeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00F5A0",
  },
  liveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#00F5A0",
    letterSpacing: 2,
  },
  activeGameName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    marginBottom: 3,
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
    marginBottom: 12,
  },
  scoreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipDotInline: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipName: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  chipScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tapHintText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  // Section
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  categorySection: { marginBottom: 26 },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  catIconBadge: {},
  catLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  // Clay game card
  gameCardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  gameCardBody: {
    width: 112,
    padding: 14,
    overflow: "hidden",
    position: "relative",
  },
  gameCardGloss: {
    position: "absolute",
    top: 5,
    left: 6,
    width: "55%",
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderBottomRightRadius: 36,
    zIndex: 1,
  },
  gameCardInnerShadow: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "50%",
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopLeftRadius: 36,
    zIndex: 1,
  },
  iconWell: { marginBottom: 10, zIndex: 2 },
  gameName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 3,
    lineHeight: 17,
    zIndex: 2,
  },
  gamePlayerCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    zIndex: 2,
  },
  // Recent games
  recentSection: { marginTop: 4 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#00F5A0",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  recentColorBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  recentGame: {
    fontFamily: "Inter_700Bold",
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
