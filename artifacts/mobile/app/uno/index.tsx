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
import { UNO_VARIANTS, UnoVariantDef } from "@/constants/games";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";

// ─── Clay Variant Card ───────────────────────────────────────────────────────
function VariantCard({ variant }: { variant: UnoVariantDef }) {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.55);
  const shadowOffset = useSharedValue(12);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowOffset.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 18, stiffness: 500 });
    shadowOpacity.value = withSpring(0.2, { damping: 18, stiffness: 500 });
    shadowOffset.value = withSpring(4, { damping: 18, stiffness: 500 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 380 });
    shadowOpacity.value = withSpring(0.55, { damping: 14, stiffness: 380 });
    shadowOffset.value = withSpring(12, { damping: 14, stiffness: 380 });
  };

  // Build number preview chips — show first 5 numbers
  const numMin = variant.numberRange.min;
  const numMax = variant.numberRange.max;
  const previewNums = variant.hasAllWild
    ? []
    : Array.from({ length: Math.min(numMax - numMin + 1, 6) }, (_, i) => numMin + i);

  // All unique point values across cards
  const allPoints = Array.from(
    new Set(variant.scoringGroups.flatMap((g) => g.cards.map((c) => c.points)))
  ).sort((a, b) => a - b);

  return (
    <Animated.View
      style={[
        styles.cardShadow,
        animStyle,
        { shadowColor: variant.color, borderRadius: 26 },
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: "/uno/[variantId]", params: { variantId: variant.id } });
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardBody, { backgroundColor: variant.color, borderRadius: 26 }]}
      >
        {/* Top-left gloss */}
        <View style={styles.cardGloss} pointerEvents="none" />
        {/* Bottom-right inner shadow */}
        <View style={styles.cardInnerShadow} pointerEvents="none" />

        {/* Top row: icon well + badge */}
        <View style={styles.cardTop}>
          <NeuIconWell color={darken(variant.color, 0.45)} size={44} borderRadius={14}>
            <Feather name={variant.icon as any} size={20} color={variant.color} />
          </NeuIconWell>
          {variant.badge && (
            <NeuTrench
              color={darken(variant.color, 0.4)}
              borderRadius={8}
              padding={0}
              style={styles.badge}
            >
              <Text style={[styles.badgeText, { color: variant.color }]}>{variant.badge}</Text>
            </NeuTrench>
          )}
        </View>

        {/* Name + tagline */}
        <Text style={styles.variantName}>{variant.name}</Text>
        <Text style={styles.variantTagline} numberOfLines={2}>{variant.tagline}</Text>

        {/* Neumorphic stat row */}
        <View style={styles.statRow}>
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={7} style={styles.statChip}>
            <Ionicons name="albums-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{variant.deckSize} cards</Text>
          </NeuTrench>
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={7} style={styles.statChip}>
            <Ionicons name="flag-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{variant.targetScore} pts</Text>
          </NeuTrench>
        </View>

        {/* Number preview chips */}
        {variant.hasAllWild ? (
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={8} style={styles.allWildChip}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.allWildText}>All Wild — No Number Cards</Text>
          </NeuTrench>
        ) : (
          <View style={styles.numPreviewRow}>
            {previewNums.map((n) => (
              <NeuTrench
                key={n}
                color={darken(variant.color, 0.45)}
                borderRadius={8}
                padding={0}
                style={styles.numChip}
              >
                <Text style={[styles.numChipText, { color: "#fff" }]}>{n}</Text>
              </NeuTrench>
            ))}
            {numMax - numMin + 1 > 6 && (
              <NeuTrench color={darken(variant.color, 0.45)} borderRadius={8} padding={0} style={styles.numChip}>
                <Text style={[styles.numChipText, { color: "rgba(255,255,255,0.5)" }]}>…{numMax}</Text>
              </NeuTrench>
            )}
          </View>
        )}

        {/* Point value pills */}
        <View style={styles.pointRow}>
          {allPoints.map((pts) => (
            <View key={pts} style={[styles.pointPill, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
              <Text style={styles.pointPillText}>{pts === 0 ? "FV" : `+${pts}`}</Text>
            </View>
          ))}
        </View>

        {/* Tap hint */}
        <View style={styles.tapRow}>
          <Text style={styles.tapText}>View cards & play</Text>
          <Feather name="arrow-right" size={13} color="rgba(255,255,255,0.6)" />
        </View>
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
          <View style={styles.unoBadgeBody}>
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

      {/* Variant cards */}
      {UNO_VARIANTS.map((variant) => (
        <VariantCard key={variant.id} variant={variant} />
      ))}
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
  headerEyebrow: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 3 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#FFFFFF", letterSpacing: -0.3 },

  // UNO badge
  unoBadgeShadow: {
    shadowColor: "#FF2D78", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7, shadowRadius: 14, elevation: 10,
  },
  unoBadgeBody: {
    backgroundColor: "#FF2D78", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 9,
    overflow: "hidden", position: "relative",
  },
  unoBadgeGloss: {
    position: "absolute", top: 2, left: 5, width: "55%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 18,
  },
  unoBadgeText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF", letterSpacing: 2, zIndex: 2 },

  // Intro
  introCard: { marginBottom: 24 },
  introRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  introText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 19 },

  // Count strip
  countStrip: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  countLabel: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 },
  countDivider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },

  // Variant clay card
  cardShadow: {
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    marginBottom: 18,
  },
  cardBody: {
    padding: 18,
    overflow: "hidden",
    position: "relative",
  },
  cardGloss: {
    position: "absolute", top: 6, left: 10, width: "50%", height: "35%",
    backgroundColor: "rgba(255,255,255,0.2)", borderBottomRightRadius: 40, zIndex: 1,
  },
  cardInnerShadow: {
    position: "absolute", bottom: 0, right: 0, width: "45%", height: "35%",
    backgroundColor: "rgba(0,0,0,0.2)", borderTopLeftRadius: 40, zIndex: 1,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, zIndex: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.5 },
  variantName: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF", marginBottom: 4, zIndex: 2 },
  variantTagline: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 14, lineHeight: 17, zIndex: 2 },

  // Stats
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14, zIndex: 2 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.8)" },

  // Number preview
  numPreviewRow: { flexDirection: "row", gap: 6, marginBottom: 12, zIndex: 2, flexWrap: "wrap" },
  numChip: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  numChipText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  allWildChip: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12, zIndex: 2 },
  allWildText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFB800" },

  // Point pills
  pointRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 12, zIndex: 2 },
  pointPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  pointPillText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.9)" },

  // Tap hint
  tapRow: { flexDirection: "row", alignItems: "center", gap: 4, zIndex: 2 },
  tapText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
});
