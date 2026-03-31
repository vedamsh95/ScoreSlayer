import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface CarcassonneCalculatorProps {
  player: Player;
  game: GameDefinition;
  onUpdate: (score: number, logs: any[], extra?: any) => void;
  initialStats?: any;
  initialMetadata?: any;
}

export function CarcassonneCalculator({ player, game, onUpdate, initialStats, initialMetadata }: CarcassonneCalculatorProps) {
  const [stats, setStats] = useState({
    roadTiles: initialStats?.roadTiles || initialMetadata?.stats?.roadTiles || 0,
    cityTiles: initialStats?.cityTiles || initialMetadata?.stats?.cityTiles || 0,
    pennants: initialStats?.pennants || initialMetadata?.stats?.pennants || 0,
    monasteryTiles: initialStats?.monasteryTiles || initialMetadata?.stats?.monasteryTiles || 0,
    farmersCities: initialStats?.farmersCities || initialMetadata?.stats?.farmersCities || 0,
    unfinishedCities: initialStats?.unfinishedCities || initialMetadata?.stats?.unfinishedCities || false,
    unfinishedRoads: initialStats?.unfinishedRoads || initialMetadata?.stats?.unfinishedRoads || false,
  });

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

  const totalScore = useMemo(() => {
    let score = 0;
    score += stats.roadTiles * 1;
    const cityMultiplier = stats.unfinishedCities ? 1 : 2;
    score += (stats.cityTiles + stats.pennants) * cityMultiplier;
    score += stats.monasteryTiles * 1;
    score += stats.farmersCities * 3;
    
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return score + manualTotal;
  }, [stats, manualLogs]);

  useEffect(() => {
    onUpdate(totalScore, manualLogs, { stats, manualLogs, dynamicQuickAdds });
  }, [totalScore, stats, manualLogs, dynamicQuickAdds, onUpdate]);

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

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setManualLogs(prev => [...prev, val]);
      setManualValue("");
    }
  };

  const handleSaveAsShortcut = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val) && !dynamicQuickAdds.includes(val)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDynamicQuickAdds(prev => [...prev, val]);
      setManualValue("");
    }
  };

  const renderSection = (title: string, icon: any, color: string, children: React.ReactNode) => (
    <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </NeuTrench>
  );

  const renderStepper = (label: string, key: string, value: number, color: string) => (
    <View style={styles.stepperContainer}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <NeuButton onPress={() => updateStat(key, -1)} color="#00D2FF" borderRadius={8} style={styles.stepBtn}>
          <Ionicons name="remove" size={16} color="#1A0533" />
        </NeuButton>
        <Text style={styles.stepValue}>{value}</Text>
        <NeuButton onPress={() => updateStat(key, 1)} color={color} borderRadius={8} style={styles.stepBtn}>
          <Ionicons name="add" size={16} color="#1A0533" />
        </NeuButton>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {renderSection("Roads", "map-marker-distance", "#95A5A6", 
        <View style={styles.featureRow}>
          <View style={{ flex: 1 }}>{renderStepper("Tiles", "roadTiles", stats.roadTiles, "#95A5A6")}</View>
          <NeuButton 
            onPress={() => updateStat("unfinishedRoads", !stats.unfinishedRoads)}
            color={stats.unfinishedRoads ? "#FF4757" : "#150428"}
            borderRadius={8}
            style={styles.miniToggle}
          >
            <Text style={[styles.miniToggleText, stats.unfinishedRoads && { color: "#FFF" }]}>Unfinished</Text>
          </NeuButton>
        </View>
      )}

      {renderSection("Cities", "castle", "#F1C40F", 
        <View style={styles.cityGrid}>
          <View style={styles.cityMain}>
            {renderStepper("Tiles", "cityTiles", stats.cityTiles, "#F1C40F")}
            {renderStepper("Pennants", "pennants", stats.pennants, "#E67E22")}
          </View>
          <NeuButton 
            onPress={() => updateStat("unfinishedCities", !stats.unfinishedCities)}
            color={stats.unfinishedCities ? "#FF4757" : "#00D2FF"}
            borderRadius={12}
            style={styles.unfinishedToggle}
          >
            <View style={styles.unfinishedInner}>
              <Ionicons name={stats.unfinishedCities ? "alert-circle" : "checkmark-circle"} size={16} color={stats.unfinishedCities ? "#FFF" : "#1A0533"} />
              <Text style={[styles.unfinishedLabel, { color: stats.unfinishedCities ? "#FFF" : "#1A0533" }]}>
                {stats.unfinishedCities ? "Unfinished (1pt/ea)" : "Completed (2pts/ea)"}
              </Text>
            </View>
          </NeuButton>
        </View>
      )}

      {renderSection("Monasteries", "church", "#9B59B6", 
        renderStepper("Surrounding Tiles", "monasteryTiles", stats.monasteryTiles, "#9B59B6")
      )}

      {renderSection("Farmers (End Game)", "wheat", "#2ECC71", 
        renderStepper("Completed Cities", "farmersCities", stats.farmersCities, "#2ECC71")
      )}

      {/* Manual Input Row */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionTitleText}>Manual Score Adjustment</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Custom Pts..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="numeric"
              onSubmitEditing={handleManualAdd}
            />
          </NeuTrench>
          <View style={styles.manualActionGroup}>
            <Pressable onPress={handleManualAdd} style={styles.manualAddBtn}>
              <NeuIconWell color="rgba(0, 245, 160, 0.1)" size={48} borderRadius={14}>
                <Feather name="plus" size={24} color="#00F5A0" />
              </NeuIconWell>
            </Pressable>
            <Pressable onPress={handleSaveAsShortcut} style={[styles.manualAddBtn, { marginLeft: 8 }]}>
              <NeuIconWell color="rgba(139, 92, 246, 0.1)" size={48} borderRadius={14}>
                <MaterialCommunityIcons name="star-plus" size={24} color="#8B5CF6" />
              </NeuIconWell>
            </Pressable>
          </View>
        </View>
      </View>

      {dynamicQuickAdds.length > 0 && (
        <View style={styles.shortcutsSection}>
          <Text style={styles.sectionTitleText}>Custom Shortcuts</Text>
          <View style={styles.quickGrid}>
            {dynamicQuickAdds.map((val, idx) => (
              <NeuButton
                key={`shortcut-${idx}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setManualLogs(prev => [...prev, val]);
                }}
                color="#8B5CF6"
                borderRadius={14}
                style={styles.quickKey}
              >
                <Text style={styles.quickKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

      <NeuTrench color="#150428" borderRadius={24} padding={20} style={styles.totalCard}>
        <View>
          <Text style={styles.totalLabel}>Current Score</Text>
          <Text style={[styles.totalValue, { color: player.color }]}>{totalScore}</Text>
        </View>
        <NeuIconWell color="rgba(255,255,255,0.03)" size={64} borderRadius={20}>
          <MaterialCommunityIcons name="account-group" size={40} color="rgba(255,255,255,0.1)" />
        </NeuIconWell>
      </NeuTrench>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 },
  sectionContent: { gap: 12 },
  stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepperLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32 },
  stepValue: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", minWidth: 24, textAlign: "center" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniToggle: { height: 32, paddingHorizontal: 10 },
  miniToggleText: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  cityGrid: { gap: 12 },
  cityMain: { gap: 8 },
  unfinishedToggle: { width: "100%", height: 44 },
  unfinishedInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  unfinishedLabel: { fontFamily: "Inter_900Black", fontSize: 11, letterSpacing: 0.5 },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  totalLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 42 },
  manualSection: { marginBottom: 16, marginTop: 8 },
  sectionTitleText: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12, letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
