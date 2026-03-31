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
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { UNO_VARIANTS, UnoCard, UnoScoringGroup, GAMES } from "@/constants/games";
import { useGame } from "@/context/GameContext";
import { NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";

function darken(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = 1 - factor;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

function lighten(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))},${Math.min(255, Math.floor(g + (255 - g) * factor))},${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}

// ─── Single number card chip ─────────────────────────────────────────────────
function NumberChip({
  num,
  color,
  isDOS,
}: {
  num: number;
  color: string;
  isDOS?: boolean;
}) {
  return (
    <View style={[styles.numCardShadow, { shadowColor: color, borderRadius: 12 }]}>
      <View style={[styles.numCardBody, { backgroundColor: color, borderRadius: 12 }]}>
        {/* Top-left small number */}
        <Text style={styles.numCardCorner}>{num}</Text>
        {/* Center big number */}
        <Text style={styles.numCardCenter}>{num}</Text>
        {/* Point value badge */}
        <NeuTrench
          color="#150428"
          borderRadius={6}
          padding={0}
          style={styles.numCardBadge}
        >
          <Text style={styles.numCardBadgeText}>{num}pt{num !== 1 ? "s" : ""}</Text>
        </NeuTrench>
      </View>
    </View>
  );
}

// ─── Card row inside a scoring group ─────────────────────────────────────────
function CardRow({ card, color }: { card: UnoCard; color: string }) {
  const cardBgColor = card.isDark
    ? "#0A0015"
    : card.isWild
    ? darken(color, 0.3)
    : darken(color, 0.2);

  const pointColor = card.isDark
    ? "#FF8C42"
    : card.isWild
    ? "#FFB800"
    : color;

  return (
    <NeuTrench
      color={cardBgColor}
      borderRadius={14}
      padding={12}
      style={styles.cardRow}
    >
      {/* Card type indicator */}
      <View style={styles.cardRowLeft}>
        <View style={[styles.cardTypeDot, {
          backgroundColor: card.isDark ? "#FF8C42" : card.isWild ? "#FFB800" : card.isSpecial ? "#00F5A0" : color
        }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardRowName}>{card.name}</Text>
          {card.qty && (
            <Text style={styles.cardRowQty}>{card.qty}</Text>
          )}
          {card.description && (
            <Text style={styles.cardRowDesc}>{card.description}</Text>
          )}
        </View>
      </View>
      <View style={styles.cardRowRight}>
        {/* Point value — clay pill */}
        <View style={[styles.pointsShadow, { borderRadius: 10, shadowColor: pointColor }]}>
          <View style={[styles.pointsBody, { backgroundColor: pointColor, borderRadius: 10 }]}>
            <Text style={styles.pointsText}>
              {card.points === 0 ? "FV" : `+${card.points}`}
            </Text>
          </View>
        </View>
      </View>
    </NeuTrench>
  );
}

// ─── Scoring group (clay card containing neumorphic rows) ────────────────────
function ScoringGroupCard({
  group,
  color,
  index,
}: {
  group: UnoScoringGroup;
  color: string;
  index: number;
}) {
  const groupColors = ["#FF2D78", "#FFB800", "#9B59B6", "#00BFFF", "#00F5A0", "#FF8C42"];
  const groupColor = groupColors[index % groupColors.length];

  const isDarkGroup = group.label.toLowerCase().includes("dark");
  const headerBg = isDarkGroup ? "#0A0015" : darken(color, 0.15);

  return (
    <View style={[styles.groupShadow, { borderRadius: 22, shadowColor: color }]}>
      <View style={[styles.groupBody, { backgroundColor: headerBg, borderRadius: 22 }]}>
        {/* Group header */}
        <View style={styles.groupHeader}>
          <NeuIconWell
            color={darken(headerBg, 0.4)}
            size={32}
            borderRadius={10}
          >
            <Feather
              name={
                group.label.toLowerCase().includes("wild") ? "star" :
                group.label.toLowerCase().includes("dark") ? "moon" :
                "zap"
              }
              size={14}
              color={groupColor}
            />
          </NeuIconWell>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <Text style={styles.groupSubLabel}>
              {group.points !== null
                ? `All cards worth ${group.points === 0 ? "face value" : `+${group.points} pts`}`
                : "Points vary — see each card"}
            </Text>
          </View>
          <NeuTrench
            color="#150428"
            borderRadius={8}
            padding={4}
            style={styles.cardCountChip}
          >
            <Text style={[styles.cardCountText, { color: groupColor === "#FF2D78" ? "#FF8C42" : groupColor }]}>
              {group.cards.length} {group.cards.length === 1 ? "card" : "cards"}
            </Text>
          </NeuTrench>
        </View>

        {/* Card rows */}
        <View style={styles.cardList}>
          {group.cards.map((card) => (
            <CardRow key={card.name} card={card} color={color} />
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * @screen VariantDetailScreen (Uno)
 */
// ─── Main screen ─────────────────────────────────────────────────────────────
export default function VariantDetailScreen() {
  const { variantId, readOnly } = useLocalSearchParams<{ variantId: string; readOnly?: string }>();
  const isReadOnly = readOnly === "true";
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { createSession } = useGame();

  const variant = UNO_VARIANTS.find((v) => v.id === `uno_${variantId}` || v.id.endsWith(variantId as string));

  if (!variant) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Variant not found</Text>
      </View>
    );
  }

  const numArr = variant.hasAllWild
    ? []
    : Array.from(
        { length: variant.numberRange.max - variant.numberRange.min + 1 },
        (_, i) => variant.numberRange.min + i
      );

  const UNO_COLORS = ["#FF2D78", "#00BFFF", "#00C853", "#FFB800"];

  return (
    <View style={{ flex: 1, backgroundColor: "#1A0533" }}>
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
            {/* Nav row */}
            <View style={styles.heroNav}>
              <NeuIconWell color="rgba(0,0,0,0.3)" size={40} borderRadius={13}>
                <Pressable onPress={() => router.back()} style={styles.backPress}>
                  <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.9)" />
                </Pressable>
              </NeuIconWell>
              {variant.badge && (
                <NeuTrench
                  color="#150428"
                  borderRadius={9}
                  padding={0}
                  style={styles.heroBadge}
                >
                  <Text style={[styles.heroBadgeText, { color: variant.color }]}>{variant.badge}</Text>
                </NeuTrench>
              )}
            </View>

            {/* Title */}
            <NeuIconWell color="#150428" size={52} borderRadius={16} style={styles.heroIcon}>
              <Feather name={variant.icon as any} size={24} color={variant.color} />
            </NeuIconWell>
            <Text style={styles.heroName}>{variant.name}</Text>
            <Text style={styles.heroTagline}>{variant.tagline}</Text>

            {/* Stat chips */}
            <View style={styles.heroStats}>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.deckSize}</Text>
                <Text style={styles.heroStatLabel}>cards</Text>
              </NeuTrench>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.targetScore}</Text>
                <Text style={styles.heroStatLabel}>points</Text>
              </NeuTrench>
              <NeuTrench color="#150428" borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>2–10</Text>
                <Text style={styles.heroStatLabel}>players</Text>
              </NeuTrench>
            </View>
          </View>
        </View>

        {/* Description */}
        <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.descCard}>
          <Text style={styles.descText}>{variant.description}</Text>
        </NeuTrench>

        {/* ── NUMBER CARDS ─────────────────────────────────────────────────── */}
        {!variant.hasAllWild && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Number Cards</Text>
              <NeuTrench color="#150428" borderRadius={9} padding={5} style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{variant.numberRange.min}–{variant.numberRange.max}</Text>
              </NeuTrench>
            </View>
            <NeuTrench color="#150428" borderRadius={16} padding={14} style={styles.numberValueBanner}>
              <Ionicons name="information-circle-outline" size={14} color={variant.color} />
              <Text style={styles.numberValueText}>{variant.numberValueRule}</Text>
            </NeuTrench>

            {/* Multi-color for standard Uno, single for others */}
            {variant.id === "uno_standard" ? (
              UNO_COLORS.map((color) => (
                <View key={color} style={styles.colorNumRow}>
                  {numArr.map((n) => (
                    <NumberChip key={`${color}_${n}`} num={n} color={color} />
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.colorNumRow}>
                {numArr.map((n) => (
                  <NumberChip key={n} num={n} color={variant.color} isDOS={variant.id === "uno_dos"} />
                ))}
              </View>
            )}
          </View>
        )}

        {variant.hasAllWild && (
          <NeuTrench color="#150428" borderRadius={16} padding={16} style={styles.noNumberBanner}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <View style={{ flex: 1 }}>
              <Text style={styles.noNumberTitle}>No Number Cards</Text>
              <Text style={styles.noNumberSub}>Every card in this deck is a Wild of some kind</Text>
            </View>
          </NeuTrench>
        )}

        {/* ── SCORING GROUPS ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Card Values</Text>
            <NeuTrench color="#150428" borderRadius={9} padding={5} style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Tap card for details</Text>
            </NeuTrench>
          </View>
          {variant.scoringGroups.map((group, i) => (
            <ScoringGroupCard key={group.label} group={group} color={variant.color} index={i} />
          ))}
        </View>

        {/* Bonuses section disabled - 'bonuses' not in UnoVariantDef type */}
        {/* ── NOTES ────────────────────────────────────────────────────────── */}
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
              const gameDef = GAMES.find(g => g.id === variant.id);
              if (gameDef) {
                const session = createSession(
                  gameDef, 
                  ["Player 1", "Player 2"], 
                  gameDef.houseRules ?? []
                );
                router.push(`/game/${session.id}`);
              } else {
                router.replace("/");
              }
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
  container: { flex: 1, backgroundColor: "#1A0533" },
  content: { paddingHorizontal: 18 },
  errContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1A0533" },
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
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  sectionBadge: {},
  sectionBadgeText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.45)" },

  // Number value banner
  numberValueBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 14,
  },
  numberValueText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1, lineHeight: 17 },

  // Color rows of number cards
  colorNumRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  // Number card chip
  numCardShadow: {
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55,
    shadowRadius: 8, elevation: 7,
  },
  numCardBody: {
    width: 44,
    height: 58,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  numCardGloss: {
    position: "absolute", top: 3, left: 3, width: "55%", height: "40%",
    backgroundColor: "rgba(255,255,255,0.28)", borderBottomRightRadius: 20, zIndex: 1,
  },
  numCardInner: {
    position: "absolute", bottom: 0, right: 0, width: "40%", height: "35%",
    backgroundColor: "rgba(0,0,0,0.2)", borderTopLeftRadius: 20, zIndex: 1,
  },
  numCardCorner: {
    position: "absolute", top: 3, left: 4,
    fontFamily: "Inter_700Bold", fontSize: 8, color: "rgba(255,255,255,0.9)", zIndex: 2,
  },
  numCardCenter: {
    fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
    zIndex: 2,
  },
  numCardBadge: {
    position: "absolute", bottom: 3, alignSelf: "center",
    paddingHorizontal: 4, paddingVertical: 1, zIndex: 2,
  },
  numCardBadgeText: { fontFamily: "Inter_700Bold", fontSize: 7, color: "rgba(255,255,255,0.9)" },

  // No number cards banner
  noNumberBanner: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 16 },
  noNumberTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFB800" },
  noNumberSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // Scoring group (clay container)
  groupShadow: {
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5,
    shadowRadius: 16, elevation: 11, marginBottom: 14,
  },
  groupBody: { padding: 16, overflow: "hidden", position: "relative" },
  groupGloss: {
    position: "absolute", top: 5, left: 8, width: "50%", height: "35%",
    backgroundColor: "rgba(255,255,255,0.12)", borderBottomRightRadius: 40, zIndex: 1,
  },
  groupInnerShadow: {
    position: "absolute", bottom: 0, right: 0, width: "40%", height: "30%",
    backgroundColor: "rgba(0,0,0,0.2)", borderTopLeftRadius: 40, zIndex: 1,
  },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14, zIndex: 2 },
  groupLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  groupSubLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 },
  cardCountChip: {},
  cardCountText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  cardList: { gap: 8, zIndex: 2 },

  // Card row (neumorphic)
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardRowLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  cardTypeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  cardRowName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  cardRowQty: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  cardRowDesc: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 16 },
  cardRowRight: { flexDirection: "row", alignItems: "center", gap: 6 },

  // Points pill (clay)
  pointsShadow: {
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5,
    shadowRadius: 6, elevation: 5,
  },
  pointsBody: {
    paddingHorizontal: 10, paddingVertical: 5,
    overflow: "hidden", position: "relative",
  },
  pointsGloss: {
    position: "absolute", top: 1, left: 3, width: "50%", height: "55%",
    backgroundColor: "rgba(255,255,255,0.3)", borderBottomRightRadius: 10,
  },
  pointsText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#1A0533", zIndex: 2 },

  // Notes
  notesCard: {},
  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  noteDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 18 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 18, paddingTop: 12,
    backgroundColor: "rgba(26,5,51,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
  },
});

