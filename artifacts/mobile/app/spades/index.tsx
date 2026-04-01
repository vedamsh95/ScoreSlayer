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
import { SPADES_VARIANTS, getGameById } from "@/constants/games";
import { PolymerCard, NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";
import { useGame } from "@/context/GameContext";

export default function SpadesVariantPicker() {
  const { createSession } = useGame();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: "#150428" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <NeuIconWell color="#150428" size={52} borderRadius={16} style={styles.headerIcon}>
            <MaterialCommunityIcons name="cards-playing-outline" size={28} color="#6B21E8" />
          </NeuIconWell>
          <View>
            <Text style={styles.title}>Spades Universe</Text>
            <Text style={styles.subtitle}>Choose your bidding style</Text>
          </View>
        </View>

        <View style={styles.variantsGrid}>
          {SPADES_VARIANTS.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const session = createSession(v as any, ["Player 1", "Player 2"], v.houseRules || []);
                router.replace({ pathname: "/game/[id]", params: { id: session.id } });
              }}
              style={styles.cardWrapper}
            >
            <PolymerCard color={v.color} borderRadius={20} padding={12} style={styles.variantCard}>
                <Text style={styles.variantName} numberOfLines={1}>{v.name}</Text>
                <Text style={styles.variantTagline} numberOfLines={2}>{v.tagline}</Text>
              </PolymerCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.backFab, { bottom: insets.bottom + 20 }]}>
        <PolymerButton
          label="Back to Games"
          onPress={() => router.replace("/(tabs)")}
          color="#3D0070"
          size="md"
          icon={<Ionicons name="arrow-back" size={16} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#150428" },
  content: { paddingHorizontal: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headerIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Bungee_400Regular", fontSize: 22, color: "#FFFFFF", letterSpacing: -0.3 },
  subtitle: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginTop: -2 },
  variantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 8,
  },
  variantCard: {
    padding: 12,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  variantName: { fontFamily: "Bungee_400Regular", fontSize: 14, color: "#1A0533", textAlign: "center", paddingTop: 2 },
  variantTagline: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(26,5,51,0.5)", lineHeight: 12, marginTop: 4, textAlign: "center", textTransform: "uppercase" },
  tapRow: { display: "none" },
  backFab: { position: "absolute", alignSelf: "center", width: "80%" },
});
