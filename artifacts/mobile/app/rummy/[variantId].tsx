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
import { RUMMY_VARIANTS } from "@/constants/games";
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

export default function RummyVariantDetailScreen() {
  const { variantId } = useLocalSearchParams<{ variantId: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const variant = RUMMY_VARIANTS.find((v) => v.id === `rummy_${variantId}` || v.id.endsWith(variantId as string));

  if (!variant) {
    return (
      <View style={styles.errContainer}>
        <Text style={styles.errText}>Variant not found</Text>
      </View>
    );
  }

  const isGin = variant.id === "rummy_gin";

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
        <View style={[styles.heroShadow, { borderRadius: 28, shadowColor: variant.color }]}>
          <View style={[styles.heroBody, { backgroundColor: variant.color, borderRadius: 28 }]}>
            <View style={styles.heroNav}>
              <NeuIconWell color={darken(variant.color, 0.45)} size={40} borderRadius={13}>
                <Pressable onPress={() => router.back()} style={styles.backPress}>
                  <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.9)" />
                </Pressable>
              </NeuIconWell>
              {variant.badge && (
                <NeuTrench color={darken(variant.color, 0.45)} borderRadius={9} padding={0} style={styles.heroBadge}>
                  <Text style={[styles.heroBadgeText, { color: variant.color }]}>{variant.badge}</Text>
                </NeuTrench>
              )}
            </View>

            <NeuIconWell color={darken(variant.color, 0.4)} size={52} borderRadius={16} style={styles.heroIcon}>
              <MaterialCommunityIcons name={variant.icon as any} size={24} color={variant.color} />
            </NeuIconWell>
            <Text style={styles.heroName}>{variant.name}</Text>
            <Text style={styles.heroTagline}>{variant.tagline}</Text>

            <View style={styles.heroStats}>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{isGin ? "2" : "2–6"}</Text>
                <Text style={styles.heroStatLabel}>players</Text>
              </NeuTrench>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{isGin ? "High" : "Low"}</Text>
                <Text style={styles.heroStatLabel}>complexity</Text>
              </NeuTrench>
              <NeuTrench color={darken(variant.color, 0.4)} borderRadius={12} padding={10} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{variant.targetScore}</Text>
                <Text style={styles.heroStatLabel}>points</Text>
              </NeuTrench>
            </View>
          </View>
        </View>

        <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.descCard}>
          <Text style={styles.descText}>{variant.description}</Text>
        </NeuTrench>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring Logic</Text>
          <NeuTrench color="#150428" borderRadius={18} padding={16} style={styles.rulesCard}>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleLabel}>{isGin ? "Aces" : "High Cards (A,K,Q,J)"}</Text>
              <Text style={styles.ruleValue}>{isGin ? "1 pt" : "10 pts"}</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleLabel}>Number Cards (2–10)</Text>
              <Text style={styles.ruleValue}>Face Value</Text>
            </View>
            {isGin ? (
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Face Cards (K,Q,J)</Text>
                <Text style={styles.ruleValue}>10 pts</Text>
              </View>
            ) : (
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Jokers / Wilds</Text>
                <Text style={styles.ruleValue}>0 pts</Text>
              </View>
            )}
            {!isGin && (
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Max Round Penalty</Text>
                <Text style={styles.ruleValue}>80 pts</Text>
              </View>
            )}
          </NeuTrench>
        </View>

        {isGin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bonuses</Text>
            <View style={styles.bonusGrid}>
              <View style={styles.bonusCard}>
                <Text style={styles.bonusLabel}>GIN</Text>
                <Text style={styles.bonusValue}>+25</Text>
              </View>
              <View style={styles.bonusCard}>
                <Text style={styles.bonusLabel}>BIG GIN</Text>
                <Text style={styles.bonusValue}>+31</Text>
              </View>
              <View style={styles.bonusCard}>
                <Text style={styles.bonusLabel}>UNDERCUT</Text>
                <Text style={styles.bonusValue}>+25</Text>
              </View>
            </View>
          </View>
        )}

        {!isGin && (variant.dropPenalties) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drop Penalties</Text>
            <View style={styles.bonusGrid}>
              <View style={styles.bonusCard}>
                <Text style={styles.bonusLabel}>FIRST DROP</Text>
                <Text style={styles.bonusValue}>20</Text>
              </View>
              <View style={styles.bonusCard}>
                <Text style={styles.bonusLabel}>MIDDLE DROP</Text>
                <Text style={styles.bonusValue}>40</Text>
              </View>
            </View>
          </View>
        )}

        {variant.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Notes</Text>
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
  heroShadow: { shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.6, shadowRadius: 22, elevation: 16, marginBottom: 16 },
  heroBody: { padding: 20 },
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
  descCard: { marginBottom: 24, backgroundColor: "rgba(10,18,41,0.5)" },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF", marginBottom: 14 },
  rulesCard: { backgroundColor: "rgba(10,18,41,0.5)" },
  ruleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  ruleLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.5)" },
  ruleValue: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFF" },
  bonusGrid: { flexDirection: "row", gap: 8 },
  bonusCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", alignItems: "center" },
  bonusLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  bonusValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#00F5A0" },
  notesCard: { backgroundColor: "rgba(10,18,41,0.5)" },
  noteRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 20 },
  bottomBar: { paddingHorizontal: 18, paddingTop: 12, backgroundColor: "rgba(10,18,41,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", flexDirection: "row" },
});
