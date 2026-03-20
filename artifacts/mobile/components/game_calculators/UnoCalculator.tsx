import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition, UNO_VARIANTS } from "@/constants/games";
import { NeuTrench, NeuButton } from "../PolymerCard";

interface UnoCalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function UnoCalculator({ player, game, initialLogs, onUpdate }: UnoCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [cardLabels, setCardLabels] = useState<string[]>([]); // Track names like "Skip", "Wild +4", etc.
  const [caughtWithUno, setCaughtWithUno] = useState(false);

  const unoVariant = useMemo(() => UNO_VARIANTS.find(v => v.id === game.id), [game.id]);
  
  const numberKeys = useMemo(() => {
    if (!unoVariant) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const { min, max } = unoVariant.numberRange;
    const keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    if (keys.includes(0)) return [...keys.filter(k => k !== 0), 0];
    return keys;
  }, [unoVariant]);

  const actionCardColors: Record<string, string> = {
    "Skip": "#FF9F43",
    "Reverse": "#54a0ff",
    "Draw Two": "#FF4757",
    "Draw One": "#FF4757",
    "Draw Five": "#FF4757",
    "Wild": "#A29BFE",
    "Wild Draw Four": "#6C5CE7",
    "Wild Draw 2": "#6C5CE7",
    "Wild Draw Color": "#6C5CE7",
    "Wild DOS": "#00D2FF",
    "Wild Number": "#00CEC9",
    "Flip": "#00CEC9",
    "Dark Flip": "#0984e3",
    "Hit 2": "#d63031",
    "Discard All": "#2d3436",
    "Wild Attack": "#e17055",
    "Flex Skip/Rev": "#fdcb6e",
    "Flex Wild": "#fd79a8",
    "Standard Wild": "#A29BFE",
    "Power Wild": "#6c5ce7",
    "Skip Everyone": "#2d3436",
  };

  const actionCards = useMemo(() => {
    if (!unoVariant) return [];
    return unoVariant.scoringGroups.flatMap(g => 
      g.cards.map(c => ({
        label: c.name,
        value: c.points,
        icon: c.isWild ? "star-circle" : c.isDark ? "moon-waning-crescent" : "flash",
        type: c.isWild ? "wild" : "action",
        color: actionCardColors[c.name] || "#1e272e"
      }))
    );
  }, [unoVariant]);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    // Analysis
    const actionCount = cardLabels.filter(l => 
      actionCards.some(ac => ac.label === l && ac.type === "action")
    ).length;
    const wildCount = cardLabels.filter(l => 
      actionCards.some(ac => ac.label === l && ac.type === "wild")
    ).length;
    const numberCount = logs.length - actionCount - wildCount;

    onUpdate(total, logs, { 
      cardLabels, 
      counts: { action: actionCount, wild: wildCount, number: numberCount },
      caughtWithUno 
    });
  }, [total, logs, cardLabels, caughtWithUno, onUpdate]);

  const addValue = (val: number, label?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
    setCardLabels(prev => [...prev, label || val.toString()]);
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
    setCardLabels(prev => prev.slice(0, -1));
  };

  const handleUno = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogs([]); 
    setCardLabels([]);
    setCaughtWithUno(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <NeuButton 
          onPress={handleUno}
          color={total === 0 && logs.length === 0 ? "#00F5A0" : "#150428"}
          borderRadius={18}
          style={styles.unoNeuBtn}
        >
          <View style={styles.topBtnInner}>
            <MaterialCommunityIcons 
              name="cards-playing-outline" 
              size={20} 
              color={total === 0 && logs.length === 0 ? "#1A0533" : "#00F5A0"} 
            />
            <Text style={[
              styles.unoText, 
              { color: total === 0 && logs.length === 0 ? "#1A0533" : "#00F5A0" }
            ]}>DECLARE UNO / 0 PTS</Text>
          </View>
        </NeuButton>

        <NeuButton 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCaughtWithUno(!caughtWithUno);
          }}
          color={caughtWithUno ? "#FF4757" : "#150428"}
          borderRadius={18}
          style={styles.catchNeuBtn}
        >
          <View style={styles.topBtnInner}>
            <MaterialCommunityIcons 
              name="alert-decagram" 
              size={20} 
              color={caughtWithUno ? "#FFF" : "#FF4757"} 
            />
            <Text style={[
              styles.catchText, 
              { color: caughtWithUno ? "#FFF" : "#FF4757" }
            ]}>{caughtWithUno ? "CAUGHT!" : "CAUGHT WITH UNO?"}</Text>
          </View>
        </NeuButton>
      </View>

      <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.displayArea}>
        <View style={styles.displayTextRow}>
          <Text style={[styles.displayTotal, { color: player.color }]}>{total}</Text>
          <Text style={styles.displayPts}>pts</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{logs.length - cardLabels.filter(l => actionCards.some(ac => ac.label === l)).length}</Text>
            <Text style={styles.statLabel}>Nums</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{cardLabels.filter(l => actionCards.find(ac => ac.label === l)?.type === "action").length}</Text>
            <Text style={styles.statLabel}>Actions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{cardLabels.filter(l => actionCards.find(ac => ac.label === l)?.type === "wild").length}</Text>
            <Text style={styles.statLabel}>Wilds</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {logs.length === 0 ? (
            <Text style={styles.placeholderText}>Tap cards to add scores...</Text>
          ) : (
            logs.map((val, i) => (
              <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
                <Text style={[styles.logChipText, { color: player.color }]}>
                  {cardLabels[i] ? `${cardLabels[i]} (+${val})` : `+${val}`}
                </Text>
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
            <NeuButton
              key={num}
              onPress={() => addValue(num)}
              color="#00D2FF"
              borderRadius={16}
              style={styles.key}
            >
              <Text style={[styles.keyText, { color: "#1A0533" }]}>{num}</Text>
              <Text style={[styles.keySubtext, { color: "rgba(26,5,51,0.5)" }]}>+{num} pts</Text>
            </NeuButton>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Action Cards</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionStrip} contentContainerStyle={styles.actionStripContent}>
          {actionCards.map((card, i) => (
            <NeuButton
              key={i}
              onPress={() => addValue(card.value, card.label)}
              color={card.color}
              borderRadius={20}
              style={styles.actionKey}
            >
              <MaterialCommunityIcons name={card.icon as any} size={28} color="#FFF" />
              <Text style={[styles.actionLabel, { color: "rgba(255,255,255,0.7)" }]} numberOfLines={1}>{card.label}</Text>
              <Text style={styles.actionValue}>+{card.value}</Text>
            </NeuButton>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topActions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  unoNeuBtn: { flex: 1.5, height: 50 },
  catchNeuBtn: { flex: 1, height: 50 },
  topBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  unoText: { fontFamily: "Inter_900Black", fontSize: 11, letterSpacing: 0.5 },
  catchText: { fontFamily: "Inter_900Black", fontSize: 10 },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 12 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 8, marginBottom: 16 },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  statLabel: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "31%", height: 62 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.3)" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  actionStrip: { flexGrow: 0, marginBottom: 20 },
  actionStripContent: { gap: 10 },
  actionKey: { width: 88, height: 95 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 6, textAlign: "center" },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", marginTop: 2 },
});
