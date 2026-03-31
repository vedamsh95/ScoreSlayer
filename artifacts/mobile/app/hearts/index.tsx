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
import { HEARTS_VARIANTS, getGameById } from "@/constants/games";
import { PolymerCard, NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";
import { useGame } from "@/context/GameContext";

export default function HeartsVariantPicker() {
  const { createSession } = useGame();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1229" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <NeuIconWell color="#0A1229" size={52} borderRadius={16} style={styles.headerIcon}>
            <Ionicons name="heart" size={28} color="#FF4757" />
          </NeuIconWell>
          <View>
            <Text style={styles.title}>Hearts Universe</Text>
            <Text style={styles.subtitle}>Choose your rule set</Text>
          </View>
        </View>

        <View style={styles.variantsGrid}>
          {HEARTS_VARIANTS.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({ 
                  pathname: "/hearts/[variantId]", 
                  params: { variantId: v.id.replace("hearts_", "") } 
                });
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
          color="#1C2841"
          size="md"
          icon={<Ionicons name="arrow-back" size={16} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1229" },
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
