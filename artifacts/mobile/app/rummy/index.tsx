import React from "react";
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { RUMMY_VARIANTS, RummyVariantDef, getGameById } from "@/constants/games";
import { NeuTrench, NeuIconWell, PolymerCard } from "@/components/PolymerCard";
import { useGame } from "@/context/GameContext";

function VariantCard({ variant }: { variant: RummyVariantDef }) {
  const { createSession } = useGame();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cardWrapper, animStyle]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const gameDef = getGameById(variant.id);
          if (gameDef) {
            const session = createSession(gameDef, ["Player 1", "Player 2"], gameDef.houseRules ?? []);
            router.push({ pathname: "/game/[id]", params: { id: session.id } });
          }
        }}
        onPressIn={() => {
          scale.value = withSpring(0.93, { damping: 18, stiffness: 500 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 380 });
        }}
        style={{ width: '100%' }}
      >
        <PolymerCard 
          color={variant.color} 
          borderRadius={18} 
          padding={12} 
          style={styles.cardBody}
        >
          <Text style={styles.variantName} numberOfLines={2}>{variant.name}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.variantTagline} numberOfLines={2}>{variant.tagline}</Text>
          </View>
        </PolymerCard>
      </Pressable>
    </Animated.View>
  );
}

function darken(hex: string, factor: number): string {
  const hexVal = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(hexVal.slice(0, 2), 16);
  const g = parseInt(hexVal.slice(2, 4), 16);
  const b = parseInt(hexVal.slice(4, 6), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

export default function RummyVariantsScreen() {
  const insets = useSafeAreaInsets();
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
        <NeuIconWell color="#150428" size={42} borderRadius={14}>
          <Pressable onPress={() => router.back()} style={styles.backPressable}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </NeuIconWell>

        <View style={styles.titleBlock}>
          <Text style={styles.headerEyebrow}>MELDING GALAXY</Text>
          <Text style={styles.headerTitle}>Rummy Hub</Text>
        </View>

        <View style={styles.badgeShadow}>
          <View style={styles.badgeBody}>
            <View style={styles.badgeGloss} pointerEvents="none" />
            <MaterialCommunityIcons name="shuffle" size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <NeuTrench color="#150428" borderRadius={16} padding={14} style={styles.introCard}>
        <View style={styles.introRow}>
          <Ionicons name="information-circle-outline" size={16} color="#FFB800" />
          <Text style={styles.introText}>
            From the high-stakes Indian 13-Card format to the two-player precision of Gin Rummy. Choose your variant to start keeping score.
          </Text>
        </View>
      </NeuTrench>

      <View style={styles.countStrip}>
        <Text style={styles.countLabel}>{RUMMY_VARIANTS.length} VARIANTS</Text>
        <View style={styles.countDivider} />
      </View>

      <View style={styles.variantsGrid}>
        {RUMMY_VARIANTS.map((variant) => (
          <VariantCard key={variant.id} variant={variant} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backPressable: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  titleBlock: { flex: 1 },
  headerEyebrow: { fontFamily: "Bungee_400Regular", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2 },
  headerTitle: { fontFamily: "Bungee_400Regular", fontSize: 22, color: "#FFFFFF", letterSpacing: -0.3, marginTop: 2 },
  badgeShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  badgeBody: { backgroundColor: "#FFB800", borderRadius: 14, width: 42, height: 42, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  badgeGloss: { position: "absolute", top: 2, left: 5, width: "55%", height: "55%", backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 18 },
  introCard: { marginBottom: 20 },
  introRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  introText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1, lineHeight: 17 },
  countStrip: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  countLabel: { fontFamily: "Bungee_400Regular", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1 },
  countDivider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  // Variant cards grid
  variantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardWrapper: {
    width: "30.5%",
    marginBottom: 12,
  },
  cardBody: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  variantName: { 
    fontFamily: "Bungee_400Regular", 
    fontSize: 14, 
    color: "#1A0533", 
    textAlign: "center", 
    paddingTop: 2 
  },
  cardFooter: {
    position: "absolute",
    bottom: 8,
  },
  variantTagline: { 
    fontFamily: "Inter_900Black", 
    fontSize: 9, 
    color: "rgba(26,5,51,0.7)", 
    lineHeight: 11, 
    marginTop: 4, 
    textAlign: "center", 
    textTransform: "uppercase" 
  },
});
