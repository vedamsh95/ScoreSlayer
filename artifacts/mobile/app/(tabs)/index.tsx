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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";
import { MAIN_GAMES, GAME_CATEGORIES, GameCategory, GameDefinition, UNO_VARIANTS, PHASE10_VARIANTS, RUMMY_VARIANTS } from "@/constants/games";
import { PolymerCard, NeuIconWell, NeuTrench, BrandButton } from "@/components/PolymerCard";
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
};

// Extracted animated game game card (to avoid hook-in-loop)
function GameCard({ game, onPress }: { game: GameDefinition; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, styles.gameCardWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.93, { damping: 18, stiffness: 500 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 380 });
        }}
        style={{ width: '100%' }}
      >
        <PolymerCard 
          color={game.color} 
          borderRadius={18} 
          padding={12} 
          style={styles.gameCard}
        >
          <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>
          
          <View style={styles.gameCardFooter}>
            {game.hasVariants ? (
              <Text style={styles.variantCountText}>
                {game.id === "uno" ? UNO_VARIANTS.length : 
                 game.id === "phase10" ? PHASE10_VARIANTS.length : 
                 game.id === "rummy" ? RUMMY_VARIANTS.length : 0} VARS
              </Text>
            ) : (
              <Text style={styles.gamePlayerCount}>{game.minPlayers}–{game.maxPlayers}p</Text>
            )}
          </View>
        </PolymerCard>
      </Pressable>
    </Animated.View>
  );
}


// Collapsible Category Section
function CollapsibleSection({ 
  category, 
  games, 
  isExpanded, 
  onToggle 
}: { 
  category: typeof GAME_CATEGORIES[0]; 
  games: GameDefinition[]; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <View style={styles.categoryContainer}>
      <Pressable 
        style={styles.categoryHeader} 
        onPress={onToggle}
      >
        <View style={styles.categoryHeaderLeft}>
          <NeuIconWell color={CATEGORY_COLORS[category.id] || "#6B21E8"} size={36} borderRadius={12}>
            <Ionicons name={category.icon as any} size={20} color="#FFFFFF" />
          </NeuIconWell>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <Text style={styles.categorySubtitle}>{games.length} Games</Text>
          </View>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="rgba(255,255,255,0.3)" 
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.gameGrid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (game.id === "game_tools") {
                  router.push("/tools" as any);
                } else if (game.hasVariants) {
                  router.push(`/${game.id}` as any);
                } else {
                  router.push({ pathname: "/setup/[gameId]", params: { gameId: game.id } });
                }
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
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

  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    card: true, // Default open
  });

  const toggleCategory = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const gamesByCategory = useMemo(() => {
    const groups: Record<string, GameDefinition[]> = {};
    MAIN_GAMES.forEach(game => {
      if (!groups[game.category]) groups[game.category] = [];
      groups[game.category].push(game);
    });
    return groups;
  }, []);

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
        <BrandButton 
          style={{ width: 44, height: 44 }}
          borderRadius={14} 
          color="#150428"
          highlight="rgba(255,255,255,0.1)"
          shadow="rgba(0,0,0,0.5)"
          glowColor="rgba(0,0,0,0.3)"
          onPress={() => router.push("/history")}
        >
          <Ionicons name="time-outline" size={22} color="rgba(255,255,255,0.8)" />
        </BrandButton>
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
        <PolymerCard 
          color={activeSession.gameColor + "CC"} 
          borderRadius={32} 
          padding={20} 
          style={[styles.activeCard, { borderColor: activeSession.gameColor }]}
        >
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
                  color="rgba(0,0,0,0.3)"
                  borderRadius={12}
                  padding={8}
                  style={styles.scoreChip}
                >
                  <View style={[styles.chipDotInline, { backgroundColor: p.color }]} />
                  <Text style={styles.chipName}>{p.name}</Text>
                  <Text style={[styles.chipScore, { color: "#FFFFFF" }]}>{p.totalScore}</Text>
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

      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Explore Library</Text>

      {GAME_CATEGORIES.map((cat) => {
        const games = gamesByCategory[cat.id] || [];
        if (games.length === 0) return null;
        return (
          <CollapsibleSection
            key={cat.id}
            category={cat}
            games={games}
            isExpanded={!!expandedCategories[cat.id]}
            onToggle={() => toggleCategory(cat.id)}
          />
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
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
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 4,
  },
  appName: {
    fontFamily: "Bungee_400Regular",
    fontSize: 38,
    color: "#FFFFFF",
    letterSpacing: -1,
  },
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
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  activeGameName: {
    fontFamily: "Bungee_400Regular",
    fontSize: 22,
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
  sectionTitle: {
    fontFamily: "Bungee_400Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 8,
  },
  categoryContainer: {
    marginBottom: 16,
    width: "100%",
  },
  activeCard: {
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontFamily: "Bungee_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },
  categorySubtitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginTop: -2,
  },
  gameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
    paddingHorizontal: 4,
  },
  gameCardWrapper: {
    width: "30.5%", // Slightly adjusted for better gap alignment
    marginBottom: 12,
  },
  gameCard: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gameName: {
    fontFamily: "Bungee_400Regular",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },
  gameCardFooter: {
    position: "absolute",
    bottom: 8,
  },
  variantCountText: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "rgba(0,0,0,0.8)",
  },
  gamePlayerCount: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "rgba(0,0,0,0.8)",
  },
  // Recent games
  recentSection: { marginTop: 24 },
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
    fontFamily: "Bungee_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },
  recentWinner: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  historyEmpty: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  historyEmptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    marginTop: 8,
  },
});
