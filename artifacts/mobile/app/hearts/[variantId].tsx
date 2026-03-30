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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { HEARTS_VARIANTS } from "@/constants/games";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";

/**
 * @screen HeartsVariantDetailScreen
 */
export default function HeartsVariantDetail() {
  const { variantId, readOnly } = useLocalSearchParams<{ variantId: string; readOnly?: string }>();
  const isReadOnly = readOnly === "true";
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const variant = HEARTS_VARIANTS.find((v) => v.id === `hearts_${variantId}` || v.id.endsWith(variantId as string));

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
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + (isReadOnly ? 40 : 110) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clay hero header */}
        <View style={[styles.heroShadow, { borderRadius: 28, shadowColor: variant.color }]}>
          <View style={[styles.heroBody, { backgroundColor: variant.color, borderRadius: 28 }]}>
            {/* Nav row */}
            <View style={styles.heroNav}>
              <NeuIconWell color="rgba(0,0,0,0.3)" size={40} borderRadius={13}>
                <Pressable onPress={() => router.back()} style={styles.backPress}>
                  <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.9)" />
                </Pressable>
              </NeuIconWell>
              {variant.badge && (
                <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={9} padding={0} style={styles.heroBadge}>
                  <Text style={[styles.heroBadgeText, { color: variant.color }]}>{variant.badge}</Text>
                </NeuTrench>
              )}
            </View>

            {/* Title */}
            <NeuIconWell color="rgba(0,0,0,0.2)" size={52} borderRadius={16} style={styles.heroIcon}>
              <Ionicons name="heart" size={24} color={variant.color} />
            </NeuIconWell>
            <Text style={styles.heroName}>{variant.name}</Text>
            <Text style={styles.heroTagline}>{variant.tagline}</Text>

            {/* Stat chips */}
            <View style={styles.heroStats}>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.targetScore}</Text>
                <Text style={styles.heroStatLabel}>points</Text>
              </NeuTrench>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>4</Text>
                <Text style={styles.heroStatLabel}>players</Text>
              </NeuTrench>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.isPartnership ? "Team" : "Solo"}</Text>
                <Text style={styles.heroStatLabel}>mode</Text>
              </NeuTrench>
            </View>
          </View>
        </View>

        {/* Description */}
        <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.descCard}>
          <Text style={styles.descText}>{variant.description}</Text>
        </NeuTrench>

        {/* ── SCORING RULES ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penalty Cards</Text>
          {variant.scoringRules.map((rule, i) => (
            <NeuTrench key={i} color="#150428" borderRadius={14} padding={12} style={styles.scoreRow}>
              <View style={styles.scoreRowLeft}>
                <View style={[styles.scoreDot, { backgroundColor: variant.color }]} />
                <Text style={styles.scoreLabel}>{rule.label}</Text>
              </View>
              {rule.points !== 0 && (
                <View style={[styles.pointsShadow, { borderRadius: 10, shadowColor: variant.color }]}>
                  <View style={[styles.pointsBody, { backgroundColor: variant.color, borderRadius: 10 }]}>
                    <Text style={styles.pointsText}>{rule.points > 0 ? `+${rule.points}` : rule.points}</Text>
                  </View>
                </View>
              )}
            </NeuTrench>
          ))}
        </View>

        {/* ── KEY RULES (NOTES) ─────────────────────────────────────────────── */}
        {variant.notes && variant.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Rules</Text>
            <NeuTrench color="#150428" borderRadius={18} padding={14} style={styles.notesCard}>
              {variant.notes.map((note, i) => (
                <View key={i} style={styles.noteRow}>
                  <View style={[styles.noteDot, { backgroundColor: variant.color }]} />
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </NeuTrench>
          </View>
        )}
      </ScrollView>

      {/* Sticky Play button */}
      {!isReadOnly && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <PolymerButton
            label={`Play ${variant.name}`}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18 },
  errContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0A1229" },
  errText: { color: "#FFF", fontFamily: "Inter_400Regular", fontSize: 16 },

  // Hero
  heroShadow: {
    shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.6,
    shadowRadius: 22, elevation: 16, marginBottom: 16,
  },
  heroBody: { padding: 20, overflow: "hidden" },
  heroNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  backPress: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.8 },
  heroIcon: { marginBottom: 12 },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#FFFFFF", marginBottom: 4 },
  heroTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18, lineHeight: 18 },
  heroStats: { flexDirection: "row", gap: 10 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  heroStatLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  heroStatPadding: { flex: 1, alignItems: "center", paddingBottom: 4 },

  // Description
  descCard: { marginBottom: 24 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF", marginBottom: 14 },

  // Scoring Rule
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 },
  scoreRowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  scoreLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },

  // Points pill (clay)
  pointsShadow: {
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5,
    shadowRadius: 6, elevation: 5,
  },
  pointsBody: {
    paddingHorizontal: 10, paddingVertical: 5,
    overflow: "hidden", position: "relative",
  },
  pointsText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFFFFF" },

  // Notes
  notesCard: {},
  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  noteDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 18 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 18, paddingTop: 12,
    backgroundColor: "rgba(10,18,41,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row",
  },
});
