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
import { RUMMY_VARIANTS, RummyVariantDef } from "@/constants/games";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";

function VariantCard({ variant }: { variant: RummyVariantDef }) {
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
          router.push({ pathname: "/rummy/[variantId]", params: { variantId: variant.id } });
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardBody, { backgroundColor: variant.color, borderRadius: 26 }]}
      >
        <View style={styles.cardTop}>
          <NeuIconWell color={darken(variant.color, 0.45)} size={44} borderRadius={14}>
            <MaterialCommunityIcons name={variant.icon as any} size={22} color={variant.color} />
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

        <Text style={styles.variantName}>{variant.name}</Text>
        <Text style={styles.variantTagline} numberOfLines={2}>{variant.tagline}</Text>

        <View style={styles.statRow}>
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={7} style={styles.statChip}>
            <Ionicons name="flag-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{variant.targetScore} pts</Text>
          </NeuTrench>
          <NeuTrench color={darken(variant.color, 0.4)} borderRadius={10} padding={7} style={styles.statChip}>
            <Ionicons name="alert-circle-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>Max {variant.maxPenalty} penalty</Text>
          </NeuTrench>
        </View>

        <View style={styles.tapRow}>
          <Text style={styles.tapText}>Check rules & play</Text>
          <Feather name="arrow-right" size={13} color="rgba(255,255,255,0.6)" />
        </View>
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

      {RUMMY_VARIANTS.map((variant) => (
        <VariantCard key={variant.id} variant={variant} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backPressable: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  titleBlock: { flex: 1 },
  headerEyebrow: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 3 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#FFFFFF", letterSpacing: -0.3 },
  badgeShadow: { shadowColor: "#F39C12", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.7, shadowRadius: 14, elevation: 10 },
  badgeBody: { backgroundColor: "#F39C12", borderRadius: 14, width: 42, height: 42, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  badgeGloss: { position: "absolute", top: 2, left: 5, width: "55%", height: "55%", backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 18 },
  introCard: { marginBottom: 24 },
  introRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  introText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 19 },
  countStrip: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  countLabel: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 },
  countDivider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  cardShadow: { shadowOffset: { width: 0, height: 12 }, elevation: 12, marginBottom: 18 },
  cardBody: { padding: 18, overflow: "hidden", position: "relative" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, zIndex: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.5 },
  variantName: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF", marginBottom: 4, zIndex: 2 },
  variantTagline: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 14, lineHeight: 17, zIndex: 2 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14, zIndex: 2 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.8)" },
  tapRow: { flexDirection: "row", alignItems: "center", gap: 4, zIndex: 2 },
  tapText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.5)" },
});
