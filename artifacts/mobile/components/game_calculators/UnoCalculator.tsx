import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition, UNO_VARIANTS } from "@/constants/games";
import { NeuTrench } from "../PolymerCard";

interface UnoCalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function UnoCalculator({ player, game, initialLogs, onUpdate }: UnoCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);

  const unoVariant = useMemo(() => UNO_VARIANTS.find(v => v.id === game.id), [game.id]);
  
  const numberKeys = useMemo(() => {
    if (!unoVariant) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const { min, max } = unoVariant.numberRange;
    const keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    if (keys.includes(0)) return [...keys.filter(k => k !== 0), 0];
    return keys;
  }, [unoVariant]);

  const actionCards = useMemo(() => {
    if (!unoVariant) return [];
    return unoVariant.scoringGroups.flatMap(g => 
      g.cards.map(c => ({
        label: c.name,
        value: c.points,
        icon: c.isWild ? "star-circle" : c.isDark ? "moon-waning-crescent" : "flash"
      }))
    );
  }, [unoVariant]);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs);
  }, [total, logs, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const handleUno = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogs([]); // Sets total to 0
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 16 }}>
        <Pressable 
          onPress={handleUno}
          style={[styles.unoBtn, total === 0 && logs.length === 0 && styles.unoActive]}
        >
          <MaterialCommunityIcons name="cards-playing-outline" size={20} color="#00F5A0" />
          <Text style={styles.unoText}>DECLARE UNO / 0 PTS</Text>
        </Pressable>
      </View>

      <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.displayArea}>
        <View style={styles.displayTextRow}>
          <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
          <Text style={styles.displayPts}>pts</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>Tap cards to add scores...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>+{val}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <Pressable onPress={removeLast} style={styles.backspace}>
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </NeuTrench>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {numberKeys.map((num) => (
            <Pressable
              key={num}
              onPress={() => addValue(num)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              <Text style={styles.keyText}>{num}</Text>
              <Text style={styles.keySubtext}>+{num} pts</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Action Cards</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionStrip}>
          {actionCards.map((card, i) => (
            <Pressable
              key={i}
              onPress={() => addValue(card.value)}
              style={styles.actionKey}
            >
              <MaterialCommunityIcons name={card.icon as any} size={24} color={player.color} />
              <Text style={styles.actionLabel} numberOfLines={1}>{card.label}</Text>
              <Text style={styles.actionValue}>+{card.value}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  unoBtn: { backgroundColor: "rgba(0, 245, 160, 0.05)", borderRadius: 18, padding: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(0, 245, 160, 0.1)", borderStyle: "dashed" },
  unoActive: { backgroundColor: "rgba(0, 245, 160, 0.15)", borderColor: "#00F5A0", borderStyle: "solid" },
  unoText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#00F5A0" },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "31%", height: 60, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.15)" },
  keyText: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  actionStrip: { flexGrow: 0, marginBottom: 20 },
  actionKey: { width: 90, height: 90, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 10, padding: 8 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, textAlign: "center" },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF", marginTop: 2 },
});
