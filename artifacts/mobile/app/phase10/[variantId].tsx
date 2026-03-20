import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PHASE10_VARIANTS, Phase10VariantDef } from "@/constants/games";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";

function darken(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

// ─── Phase Row Component ─────────────────────────────────────────────────────
function PhaseRow({ number, description, color }: { number: number; description: string; color: string }) {
  return (
    <NeuTrench color={darken(color, 0.4)} borderRadius={14} padding={12} style={styles.phaseRow}>
      <View style={[styles.phaseNumberBadge, { backgroundColor: color }]}>
        <Text style={styles.phaseNumberText}>{number}</Text>
      </View>
      <Text style={styles.phaseDescription}>{description}</Text>
    </NeuTrench>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function Phase10VariantDetailScreen() {
  const { variantId } = useLocalSearchParams<{ variantId: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const variant = PHASE10_VARIANTS.find((v) => v.id === variantId);

  if (!variant) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Variant not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1229" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clay hero header */}
        <View style={[styles.heroShadow, { borderRadius: 28, shadowColor: variant.color }]}>
          <View style={[styles.heroBody, { backgroundColor: variant.color, borderRadius: 28 }]}>
            <View style={styles.heroGloss} pointerEvents="none" />
            <View style={styles.heroInnerShadow} pointerEvents="none" />

            {/* Nav row */}
            <View style={styles.heroNav}>
              <NeuIconWell color={darken(variant.color, 0.45)} size={40} borderRadius={13}>
                <Pressable onPress={() => router.back()} style={styles.backPress}>
                  <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.9)" />
                </Pressable>
              </NeuIconWell>
              {variant.badge && (
                <NeuTrench
                  color={darken(variant.color, 0.45)}
                  borderRadius={9}
                  padding={0}
                  style={styles.heroBadge}
                >
                  <Text style={[styles.heroBadgeText, { color: variant.color }]}>{variant.badge}</Text>
                </NeuTrench>
              )}
            </View>

            {/* Title */}
            <NeuIconWell color={darken(variant.color, 0.4)} size={52} borderRadius={16} style={styles.heroIcon}>
              <Feather name={variant.icon as any} size={24} color={variant.color} />
            </NeuIconWell>
            <Text style={styles.heroName}>{variant.name}</Text>
            <Text style={styles.heroTagline}>{variant.tagline}</Text>

            {/* Stat chips */}
            <View style={styles.heroStats}>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.phases.length}</Text>
                <Text style={styles.heroStatLabel}>phases</Text>
              </NeuTrench>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>2–6</Text>
                <Text style={styles.heroStatLabel}>players</Text>
              </NeuTrench>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>Low</Text>
                <Text style={styles.heroStatLabel}>score wins</Text>
              </NeuTrench>
            </View>
          </View>
        </View>

        {/* Description */}
        <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.descCard}>
          <Text style={styles.descText}>{variant.description}</Text>
        </NeuTrench>

        {/* ── PHASES ────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phases</Text>
          <View style={styles.phaseList}>
            {variant.phases.map((p, idx) => (
              <PhaseRow key={idx} number={p.number} description={p.description} color={variant.color} />
            ))}
          </View>
        </View>

        {/* ── SCORING ───────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Values</Text>
          <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.scoringCard}>
            {(variant.scoring || [
              { label: "Cards 1–9", points: 5 },
              { label: "Cards 10–12", points: 10 },
              { label: "Skip Card", points: 15 },
              { label: "Wild Card", points: 25 },
            ]).map((rule, i) => (
              <View key={i} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{rule.label}</Text>
                <View style={styles.scoreDivider} />
                <Text style={styles.scorePoints}>+{rule.points}</Text>
              </View>
            ))}
          </NeuTrench>
        </View>

        {/* ── NOTES ────────────────────────────────────────────────────────── */}
        {variant.notes && variant.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules & Notes</Text>
            <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.notesCard}>
              {variant.notes.map((note, i) => (
                <View key={i} style={styles.noteRow}>
                  <Ionicons name="checkmark-circle" size={14} color={variant.color} style={{ marginTop: 2 }} />
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </NeuTrench>
          </View>
        )}
      </ScrollView>

      {/* Sticky Play button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <PolymerButton
          label={`Start ${variant.name}`}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push({ pathname: "/setup/[gameId]", params: { gameId: variant.id } });
          }}
          color={variant.color}
          textColor="#FFFFFF"
          size="lg"
          style={{ flex: 1 }}
          icon={<Feather name="play" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1229" },
  content: { paddingHorizontal: 18 },
  errContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0A1229" },
  errText: { color: "#FFF", fontFamily: "Inter_400Regular", fontSize: 16 },

  // Hero
  heroShadow: {
    shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.6,
    shadowRadius: 22, elevation: 16, marginBottom: 16,
  },
  heroBody: { padding: 20, overflow: "hidden", position: "relative" },
  heroGloss: {
    position: "absolute", top: 8, left: 12, width: "50%", height: "38%",
    backgroundColor: "rgba(255,255,255,0.22)", borderBottomRightRadius: 50, zIndex: 1,
  },
  heroInnerShadow: {
    position: "absolute", bottom: 0, right: 0, width: "45%", height: "35%",
    backgroundColor: "rgba(0,0,0,0.22)", borderTopLeftRadius: 50, zIndex: 1,
  },
  heroNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, zIndex: 2 },
  backPress: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.8 },
  heroIcon: { marginBottom: 12, zIndex: 2 },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#FFFFFF", marginBottom: 4, zIndex: 2 },
  heroTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18, lineHeight: 18, zIndex: 2 },
  heroStats: { flexDirection: "row", gap: 10, zIndex: 2 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  heroStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // Description
  descCard: { marginBottom: 24 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF", marginBottom: 14 },

  // Phase List
  phaseList: { gap: 10 },
  phaseRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  phaseNumberBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  phaseNumberText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  phaseDescription: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.9)", flex: 1 },

  // Scoring
  scoringCard: {},
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  scoreLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  scoreDivider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)", mx: 10 },
  scorePoints: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },

  // Notes
  notesCard: {},
  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 19 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 18, paddingTop: 12,
    backgroundColor: "rgba(10,18,41,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
  },
});
