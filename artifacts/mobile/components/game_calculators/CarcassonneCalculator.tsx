import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";

interface CarcassonneCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
}

export function CarcassonneCalculator({ player, game, onUpdate, initialStats }: CarcassonneCalculatorProps) {
  const [stats, setStats] = useState({
    roadTiles: initialStats?.roadTiles || 0,
    cityTiles: initialStats?.cityTiles || 0,
    pennants: initialStats?.pennants || 0,
    monasteryTiles: initialStats?.monasteryTiles || 0,
    farmersCities: initialStats?.farmersCities || 0,
    unfinishedCities: initialStats?.unfinishedCities || false,
    unfinishedRoads: initialStats?.unfinishedRoads || false,
  });

  const totalScore = useMemo(() => {
    let score = 0;
    // Roads: 1pt per tile (usually)
    score += stats.roadTiles * 1;
    
    // Cities: 2pts per tile/pennant if finished, 1pt if unfinished
    const cityMultiplier = stats.unfinishedCities ? 1 : 2;
    score += (stats.cityTiles + stats.pennants) * cityMultiplier;
    
    // Monasteries: 1pt per tile
    score += stats.monasteryTiles * 1;
    
    // Farmers: 3pts per city
    score += stats.farmersCities * 3;
    
    return score;
  }, [stats]);

  useEffect(() => {
    onUpdate(totalScore, [], { stats });
  }, [totalScore]);

  const updateStat = (key: string, delta: number | boolean) => {
    setStats(prev => {
      const next = { ...prev };
      if (typeof delta === "boolean") {
        (next as any)[key] = delta;
      } else {
        (next as any)[key] = Math.max(0, (prev as any)[key] + delta);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSection = (title: string, icon: any, color: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderStepper = (label: string, key: string, value: number, color: string) => (
    <View style={styles.stepperContainer}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable onPress={() => updateStat(key, -1)} style={styles.stepBtn}>
          <Ionicons name="remove" size={16} color="rgba(255,255,255,0.4)" />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable onPress={() => updateStat(key, 1)} style={styles.stepBtn}>
          <Ionicons name="add" size={16} color={color} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderSection("Roads", "map-marker-distance", "#95A5A6", 
        <View style={styles.featureRow}>
          <View style={{ flex: 1 }}>{renderStepper("Tiles", "roadTiles", stats.roadTiles, "#95A5A6")}</View>
          <Pressable 
            onPress={() => updateStat("unfinishedRoads", !stats.unfinishedRoads)}
            style={[styles.miniToggle, stats.unfinishedRoads && styles.miniToggleActive]}
          >
            <Text style={[styles.miniToggleText, stats.unfinishedRoads && { color: "#FFF" }]}>Unfinished</Text>
          </Pressable>
        </View>
      )}

      {renderSection("Cities", "castle", "#F1C40F", 
        <View style={styles.cityGrid}>
          <View style={styles.cityMain}>
            {renderStepper("Tiles", "cityTiles", stats.cityTiles, "#F1C40F")}
            {renderStepper("Pennants", "pennants", stats.pennants, "#E67E22")}
          </View>
          <Pressable 
            onPress={() => updateStat("unfinishedCities", !stats.unfinishedCities)}
            style={[styles.unfinishedToggle, stats.unfinishedCities && styles.unfinishedActive]}
          >
            <Ionicons name={stats.unfinishedCities ? "alert-circle" : "checkmark-circle"} size={16} color={stats.unfinishedCities ? "#E74C3C" : "rgba(255,255,255,0.2)"} />
            <Text style={[styles.unfinishedLabel, stats.unfinishedCities && { color: "#FFF" }]}>
              {stats.unfinishedCities ? "Unfinished (1pt/ea)" : "Completed (2pts/ea)"}
            </Text>
          </Pressable>
        </View>
      )}

      {renderSection("Monasteries", "church", "#9B59B6", 
        renderStepper("Surrounding Tiles", "monasteryTiles", stats.monasteryTiles, "#9B59B6")
      )}

      {renderSection("Farmers (End Game)", "wheat", "#2ECC71", 
        renderStepper("Completed Cities", "farmersCities", stats.farmersCities, "#2ECC71")
      )}

      <View style={styles.totalCard}>
        <View>
          <Text style={styles.totalLabel}>Current Score</Text>
          <Text style={styles.totalValue}>{totalScore}</Text>
        </View>
        <View style={styles.meepleIcon}>
          <MaterialCommunityIcons name="account-group" size={40} color="rgba(255,255,255,0.1)" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  sectionContent: { gap: 12 },
  stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepperLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.6)" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: "Inter_800ExtraBold", fontSize: 18, color: "#FFF", minWidth: 24, textAlign: "center" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniToggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  miniToggleActive: { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "#FFF" },
  miniToggleText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  cityGrid: { gap: 12 },
  cityMain: { gap: 8 },
  unfinishedToggle: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  unfinishedActive: { backgroundColor: "rgba(231, 76, 60, 0.1)", borderColor: "#E74C3C" },
  unfinishedLabel: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#00F5A010", borderRadius: 20, padding: 20, marginTop: 12, borderWidth: 1, borderColor: "#00F5A030" },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#00F5A0", textTransform: "uppercase", marginBottom: 2 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 36, color: "#00F5A0" },
  meepleIcon: { opacity: 0.5 }
});
