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
import { PHASE10_VARIANTS, Phase10VariantDef } from "@/constants/games";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";

// ─── Clay Variant Card ───────────────────────────────────────────────────────
function VariantCard({ variant }: { variant: Phase10VariantDef }) {
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
          router.push({ pathname: "/phase10/[variantId]", params: { variantId: variant.id } });
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
            <Ionicons name="layers-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{variant.phases.length} Phases</Text>
          </NeuTrench>
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={7} style={styles.statChip}>
            <Ionicons name="people-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>2-6 Players</Text>
          </NeuTrench>
        </View>

        {/* Phase preview chips (first 4) */}
        <View style={styles.phasePreviewRow}>
          {variant.phases.slice(0, 4).map((p, idx) => (
            <NeuTrench
              key={idx}
              color={darken(variant.color, 0.45)}
              borderRadius={8}
              padding={6}
              style={styles.phaseChip}
            >
              <Text style={[styles.phaseChipText, { color: "#fff" }]} numberOfLines={1}>
                {p.number}. {p.description}
              </Text>
            </NeuTrench>
          ))}
          {variant.phases.length > 4 && (
            <Text style={styles.morePhasesText}>+ {variant.phases.length - 4} more...</Text>
          )}
        </View>

        {/* Tap hint */}
        <View style={styles.tapRow}>
          <Text style={styles.tapText}>Select phases & play</Text>
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
export default function Phase10VariantsScreen() {
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
          <Text style={styles.headerEyebrow}>RUMMY ADVENTURE</Text>
          <Text style={styles.headerTitle}>Phase 10 Universe</Text>
        </View>

        {/* Phase 10 badge */}
        <View style={styles.p10BadgeShadow}>
          <View style={styles.p10BadgeBody}>
            <View style={styles.p10BadgeGloss} pointerEvents="none" />
            <Text style={styles.p10BadgeText}>P10</Text>
          </View>
        </View>
      </View>

      {/* Subtitle */}
      <NeuTrench color="#150428" borderRadius={16} padding={14} style={styles.introCard}>
        <View style={styles.introRow}>
          <Ionicons name="sparkles-outline" size={16} color="#00BFFF" />
          <Text style={styles.introText}>
            5 strategic variants — from classic sequential rounds to non-linear Master mode and parity-based Even/Odd strategies.
          </Text>
        </View>
      </NeuTrench>

      {/* Variant count strip */}
      <View style={styles.countStrip}>
        <Text style={styles.countLabel}>{PHASE10_VARIANTS.length} VARIANTS</Text>
        <View style={styles.countDivider} />
      </View>

      {/* Variant cards */}
      {PHASE10_VARIANTS.map((variant) => (
        <VariantCard key={variant.id} variant={variant} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1229" },
  content: { paddingHorizontal: 18 },

  // Header
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backPressable: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  titleBlock: { flex: 1 },
  headerEyebrow: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 3 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#FFFFFF", letterSpacing: -0.3 },

  // P10 badge
  p10BadgeShadow: {
    shadowColor: "#00BFFF", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7, shadowRadius: 14, elevation: 10,
  },
  p10BadgeBody: {
    backgroundColor: "#00BFFF", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 9,
    overflow: "hidden", position: "relative",
  },
  p10BadgeGloss: {
    position: "absolute", top: 2, left: 5, width: "55%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 18,
  },
  p10BadgeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF", letterSpacing: 1, zIndex: 2 },

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
    marginBottom: 20,
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
  variantTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 16, lineHeight: 18, zIndex: 2 },

  // Stats
  statRow: { flexDirection: "row", gap: 8, marginBottom: 16, zIndex: 2 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.8)" },

  // Phase preview
  phasePreviewRow: { gap: 6, marginBottom: 16, zIndex: 2 },
  phaseChip: { alignSelf: "flex-start" },
  phaseChipText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  morePhasesText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 },

  // Tap hint
  tapRow: { flexDirection: "row", alignItems: "center", gap: 4, zIndex: 2 },
  tapText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.6)" },
});
