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
import { SPADES_VARIANTS } from "@/constants/games";
import { PolymerCard, NeuTrench, NeuIconWell } from "@/components/PolymerCard";
import { PolymerButton } from "@/components/PolymerButton";

export default function SpadesVariantPicker() {
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

        <View style={styles.variantList}>
          {SPADES_VARIANTS.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/spades/[variantId]", params: { variantId: v.id } });
              }}
            >
              <PolymerCard color={v.color} style={styles.variantCard}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardName}>{v.name}</Text>
                      {v.badge && (
                        <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={8} padding={4} style={styles.badge}>
                          <Text style={[styles.badgeText, { color: v.color }]}>{v.badge}</Text>
                        </NeuTrench>
                      )}
                    </View>
                    <View style={[styles.iconWell, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                      <Feather name={v.icon as any} size={18} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.tagline}>{v.tagline}</Text>
                  <View style={styles.footer}>
                    <Text style={styles.description} numberOfLines={2}>{v.description}</Text>
                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                    </View>
                  </View>
                </View>
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
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 32 },
  headerIcon: { marginBottom: 0 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  variantList: { gap: 16 },
  variantCard: { width: "100%" },
  cardContent: { padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardMeta: { flex: 1, marginRight: 12 },
  cardName: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 },
  badge: { alignSelf: "flex-start" },
  badgeText: { fontSize: 9, fontWeight: "bold", letterSpacing: 1.2 },
  iconWell: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tagline: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginBottom: 12 },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  description: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 18 },
  arrowContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backFab: { position: "absolute", alignSelf: "center", width: "80%" },
});
