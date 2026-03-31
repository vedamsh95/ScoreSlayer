import React, { useState } from "react";
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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PHASE10_VARIANTS, GAMES } from "@/constants/games";
import { useGame } from "@/context/GameContext";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";

function darken(hex: string, factor: number): string {
  const hexVal = hex.startsWith("#") ? hex.slice(1) : hex;
  const rr = parseInt(hexVal.slice(0, 2), 16);
  const gg = parseInt(hexVal.slice(2, 4), 16);
  const bb = parseInt(hexVal.slice(4, 6), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(rr * d)},${Math.floor(gg * d)},${Math.floor(bb * d)})`;
}

// ─── Phase Card Component ─────────────────────────────────────────────────────
function PhaseCard({ number, description, color }: { number: number; description: string; color: string }) {
  return (
    <NeuTrench color={darken(color, 0.42)} borderRadius={16} padding={14} style={styles.phaseCard}>
      <View style={styles.phaseRow}>
        <View style={[styles.phaseNumberBadge, { backgroundColor: color }]}>
          <Text style={styles.phaseNumberText}>{number}</Text>
        </View>
        <Text style={styles.phaseDescription}>
          {description}
        </Text>
      </View>
    </NeuTrench>
  );
}

// ─── Scoring Rule Component ──────────────────────────────────────────────────
function ScoringRuleRow({ label, points, color }: { label: string; points: number; color: string }) {
  return (
    <NeuTrench color="#150428" borderRadius={14} padding={12} style={styles.scoreRow}>
      <View style={styles.scoreRowLeft}>
        <View style={[styles.scoreDot, { backgroundColor: color }]} />
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
      {/* Point value — clay pill */}
      <View style={[styles.pointsShadow, { borderRadius: 10, shadowColor: color }]}>
        <View style={[styles.pointsBody, { backgroundColor: color, borderRadius: 10 }]}>
          <Text style={styles.pointsText}>+{points}</Text>
        </View>
      </View>
    </NeuTrench>
  );
}

/**
 * @screen Phase10VariantDetailScreen
 */
export default function Phase10VariantDetailScreen() {
  const { variantId, readOnly } = useLocalSearchParams<{ variantId: string; readOnly?: string }>();
  const isReadOnly = readOnly === "true";
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { state: { sessions } } = useGame();
  
  const variant = PHASE10_VARIANTS.find((v) => v.id === `phase10_${variantId}` || v.id.endsWith(variantId as string));

  if (!variant) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Variant not found</Text>
      </View>
    );
  }

  const activeSession = sessions.find(s => s.gameId === variant.id && !s.isComplete);

  const defaultScoring = [
    { label: "Cards 1–9", points: 5 },
    { label: "Cards 10–12", points: 10 },
    { label: "Skip Card", points: 15 },
    { label: "Wild Card", points: 25 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1229" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + (isReadOnly ? 40 : 110) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clay hero header */}
        <View style={[styles.heroShadow, { borderRadius: 28, shadowColor: variant.color }]}>
          <View style={[styles.heroBody, { backgroundColor: variant.color, borderRadius: 28 }]}>

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
                <Text style={styles.heroStatLabel}>complexity</Text>
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
          <Text style={styles.sectionTitle}>Game Phases</Text>
          <View style={styles.phaseList}>
            {variant.phases.map((p, idx) => (
              <PhaseCard key={idx} number={p.number} description={p.description} color={variant.color} />
            ))}
          </View>
        </View>

        {/* ── SCORING ───────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Point Values</Text>
          <View style={styles.scoreList}>
            {(variant.scoring || defaultScoring).map((rule, i) => (
              <ScoringRuleRow key={i} label={rule.label} points={rule.points} color={variant.color} />
            ))}
          </View>
        </View>

        {/* ── NOTES ────────────────────────────────────────────────────────── */}
        {variant.notes && variant.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="book-open-variant" size={16} color="#FFF" /> Rules & Notes</Text>
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

      {/* Sticky Action button */}
      {!isReadOnly && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <PolymerButton
            label={activeSession ? "Resume Session" : "Setup Game"}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (activeSession) {
                router.push(`/game/${activeSession.id}`);
              } else {
                router.push({ pathname: "/setup/[gameId]", params: { gameId: variant.id } });
              }
            }}
            color={variant.color}
            textColor="#FFFFFF"
            size="lg"
            style={{ flex: 1 }}
            icon={<Feather name={activeSession ? "play" : "settings"} size={16} color="#FFFFFF" />}
          />
        </View>
      )}
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
  heroNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, zIndex: 2 },
  backPress: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.8 },
  heroIcon: { marginBottom: 12, zIndex: 2 },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#FFFFFF", marginBottom: 4, zIndex: 2 },
  heroTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18, lineHeight: 18, zIndex: 2 },
  heroStats: { flexDirection: "row", gap: 10, zIndex: 2 },
  heroStat: { flex: 1, alignItems: "center", paddingBottom: 6 },
  heroStatValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF" },
  heroStatLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  heroStatPadding: { flex: 1, alignItems: "center", paddingBottom: 4 },

  // Description
  descCard: { marginBottom: 24, backgroundColor: "rgba(10,18,41,0.5)" },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF", marginBottom: 14 },

  // Phase List
  phaseList: { gap: 10 },
  phaseCard: { marginBottom: 4 },
  phaseRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  phaseNumberBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  phaseNumberText: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFFFFF" },
  phaseDescription: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.9)", flex: 1 },

  // Scoring Rule
  scoreList: { gap: 10 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  scoreRowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  scoreLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },

  // Points pill (clay)
  pointsShadow: {
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5,
    shadowRadius: 6, elevation: 5,
  },
  pointsBody: {
    paddingHorizontal: 12, paddingVertical: 6,
    overflow: "hidden", position: "relative",
  },
  pointsText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#1A0533", zIndex: 2 },

  // Notes
  notesCard: { backgroundColor: "rgba(10,18,41,0.5)" },
  noteRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 20 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 18, paddingTop: 12,
    backgroundColor: "rgba(10,18,41,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
  },
});
