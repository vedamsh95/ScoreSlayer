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
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { UNO_VARIANTS, UnoVariantDef, getGameById } from "@/constants/games";
import { NeuTrench, NeuIconWell, PolymerCard } from "@/components/PolymerCard";
import { useGame } from "@/context/GameContext";

// ─── Clay Variant Card ───────────────────────────────────────────────────────
function VariantCard({ variant }: { variant: UnoVariantDef }) {
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
          router.push({ 
            pathname: "/uno/[variantId]", 
            params: { variantId: variant.id.replace("uno_", "") } 
          });
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
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function UnoVariantsScreen() {
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
      {/* Header */}
      <View style={styles.headerRow}>
        <NeuIconWell color="#150428" size={42} borderRadius={14}>
          <Pressable onPress={() => router.back()} style={styles.backPressable}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </NeuIconWell>

        <View style={styles.titleBlock}>
          <Text style={styles.headerEyebrow}>CARD SHEDDING</Text>
          <Text style={styles.headerTitle}>Uno Universe</Text>
        </View>

        {/* Big clay UNO badge */}
        <View style={styles.unoBadgeShadow}>
          <View style={[styles.unoBadgeBody, { backgroundColor: "#FF6B6B" }]}>
            <View style={styles.unoBadgeGloss} pointerEvents="none" />
            <Text style={styles.unoBadgeText}>UNO</Text>
          </View>
        </View>
      </View>

      {/* Subtitle */}
      <NeuTrench color="#150428" borderRadius={16} padding={14} style={styles.introCard}>
        <View style={styles.introRow}>
          <Ionicons name="information-circle-outline" size={16} color="#FFB800" />
          <Text style={styles.introText}>
            8 official variants — each with unique cards, scoring, and deck sizes. Tap any variant to see every card's value, then start your game.
          </Text>
        </View>
      </NeuTrench>

      {/* Variant count strip */}
      <View style={styles.countStrip}>
        <Text style={styles.countLabel}>{UNO_VARIANTS.length} VARIANTS</Text>
        <View style={styles.countDivider} />
      </View>

      {/* Variant cards grid */}
      <View style={styles.variantsGrid}>
        {UNO_VARIANTS.map((variant) => (
          <VariantCard key={variant.id} variant={variant} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 18 },

  // Header
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backPressable: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  titleBlock: { flex: 1 },
  headerEyebrow: { fontFamily: "Bungee_400Regular", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2 },
  headerTitle: { fontFamily: "Bungee_400Regular", fontSize: 22, color: "#FFFFFF", letterSpacing: -0.3, marginTop: 2 },

  // UNO badge
  unoBadgeShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  unoBadgeBody: {
    borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 8,
    overflow: "hidden", position: "relative",
  },
  unoBadgeGloss: {
    position: "absolute", top: 2, left: 5, width: "55%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 18,
  },
  unoBadgeText: { fontFamily: "Bungee_400Regular", fontSize: 13, color: "#1A0533", letterSpacing: 1, zIndex: 2, paddingTop: 2 },

  // Intro
  introCard: { marginBottom: 20 },
  introRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  introText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1, lineHeight: 17 },

  // Count strip
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
