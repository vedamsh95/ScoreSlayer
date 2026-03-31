import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition, UNO_VARIANTS } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface UnoCalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  initialMetadata?: any;
  customScoreRules?: any[];
  alreadyDeclaredPlayerName?: string | null;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function UnoCalculator({ 
  player, 
  game, 
  initialLogs, 
  initialMetadata, 
  customScoreRules, 
  alreadyDeclaredPlayerName,
  onUpdate 
}: UnoCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [cardLabels, setCardLabels] = useState<string[]>(initialMetadata?.cardLabels || []);
  const [caughtWithUno, setCaughtWithUno] = useState(initialMetadata?.caughtWithUno || false);
  const [isWinner, setIsWinner] = useState(initialMetadata?.isWinner || false); // Track if player declared Uno (winner)
  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);

  const unoVariant = useMemo(() => UNO_VARIANTS.find(v => v.id === game.id), [game.id]);
  
  const numberKeys = useMemo(() => {
    if (!unoVariant || !unoVariant.numberRange) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const { min, max } = unoVariant.numberRange;
    const keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    if (keys.includes(0)) return [...keys.filter(k => k !== 0), 0];
    return keys;
  }, [unoVariant]);

  const actionCardColors: Record<string, string> = {
    "Skip": "#FF9F43", "Reverse": "#54a0ff", "Draw Two": "#FF4757",
    "Draw One": "#FF4757", "Draw Five": "#EE5253", "Wild": "#A29BFE",
    "Wild Draw Four": "#6C5CE7", "Wild Draw 2": "#5F27CD", "Wild Draw Color": "#341F97",
    "Wild DOS": "#00D2FF", "Wild Number": "#01A3A4", "Flip": "#00CEC9",
    "Dark Flip": "#0984E3", "Hit 2": "#D63031", "Discard All": "#2D3436",
    "Wild Attack": "#E17055", "Flex Skip/Rev": "#FDCB6E", "Flex Wild": "#FD79A8",
    "Standard Wild": "#A29BFE", "Power Wild": "#6C5CE7", "Skip Everyone": "#222F3E",
  };

  const actionCards = useMemo(() => {
    if (customScoreRules && customScoreRules.length > 0) {
      return customScoreRules.map(c => ({
        label: c.label,
        value: c.points,
        icon: c.icon || "flash",
        type: (c.id && c.id.includes("wild")) ? "wild" : "action",
        color: actionCardColors[c.label] || "#2D3436"
      }));
    }
    if (!unoVariant) return [];
    return unoVariant.scoringGroups.flatMap(g => 
      g.cards.map(c => ({
        label: c.name,
        value: c.points,
        icon: c.isWild ? "star-circle" : c.isDark ? "moon-waning-crescent" : "flash",
        type: c.isWild ? "wild" : "action",
        color: actionCardColors[c.name] || "#2D3436"
      }))
    );
  }, [unoVariant, customScoreRules]);

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, { 
      cardLabels, 
      caughtWithUno, 
      isWinner, 
      cleared: isWinner,
      dynamicQuickAdds 
    });
  }, [total, logs, cardLabels, caughtWithUno, isWinner, dynamicQuickAdds, onUpdate]);

  const addValue = (val: number, label?: string) => {
    if (isWinner) return; // Prevent adding scores if they already won (declared Uno)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
    setCardLabels(prev => [...prev, label || val.toString()]);
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (logs.length === 0 && isWinner) {
      setIsWinner(false);
      return;
    }
    setLogs(prev => prev.slice(0, -1));
    setCardLabels(prev => prev.slice(0, -1));
  };

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      addValue(val, "Manual");
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

  const handleUno = () => {
    if (!isWinner && alreadyDeclaredPlayerName) {
      Alert.alert(
        "Winner Already Declared",
        `${alreadyDeclaredPlayerName} has already declared Uno! Only one player can win the round.`,
        [{ text: "OK" }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newWinnerState = !isWinner;
    setIsWinner(newWinnerState);
    
    if (newWinnerState) {
      setLogs([]); 
      setCardLabels([]);
      setCaughtWithUno(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <NeuButton 
          onPress={handleUno}
          color={isWinner ? "#00F5A0" : "#150428"}
          borderRadius={18}
          style={styles.unoNeuBtn}
        >
          <View style={styles.topBtnInner}>
            <MaterialCommunityIcons 
              name="cards-playing-outline" 
              size={18} 
              color={isWinner ? "#1A0533" : "#00F5A0"} 
            />
            <Text style={[
              styles.unoText, 
              { color: isWinner ? "#1A0533" : "#00F5A0" }
            ]}>{isWinner ? "WINNER DECLARED!" : "DECLARE UNO / 0 PTS"}</Text>
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
              size={18} 
              color={caughtWithUno ? "#FFF" : "#FF4757"} 
            />
            <Text style={[
              styles.catchText, 
              { color: caughtWithUno ? "#FFF" : "#FF4757" }
            ]}>{caughtWithUno ? "CAUGHT!" : "CAUGHT?"}</Text>
          </View>
        </NeuButton>
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
                <Text style={[styles.logChipText, { color: player.color }]}>
                  {cardLabels[i] ? `${cardLabels[i]} (+${val})` : `+${val}`}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <Pressable onPress={removeLast} style={styles.backspace}>
          <NeuIconWell color="#150428" size={36} borderRadius={10}>
             <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.4)" />
          </NeuIconWell>
        </Pressable>
      </NeuTrench>

      {/* Manual Input Row */}
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Action Cards - Moved UP */}
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
              <Text style={styles.actionLabel} numberOfLines={1}>{card.label}</Text>
              <Text style={styles.actionValue}>+{card.value}</Text>
            </NeuButton>
          ))}
        </ScrollView>

        {dynamicQuickAdds.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Custom Shortcuts</Text>
            <View style={styles.quickGrid}>
              {dynamicQuickAdds.map((val, idx) => (
                <NeuButton
                  key={`shortcut-${idx}`}
                  onPress={() => addValue(val, "Shortcut")}
                  color="#8B5CF6"
                  borderRadius={14}
                  style={styles.quickKey}
                >
                  <Text style={styles.quickKeyText}>+{val}</Text>
                </NeuButton>
              ))}
            </View>
          </>
        )}

        {/* Numpad - 2 rows of 5 */}
        <View style={styles.grid}>
          {numberKeys.map((num) => (
            <NeuButton
              key={num}
              onPress={() => addValue(num)}
              color="#00D2FF"
              borderRadius={16}
              style={styles.key}
            >
              <Text style={styles.keyText}>+{num}</Text>
              <Text style={styles.keySubtext}>pts</Text>
            </NeuButton>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  manualInputTrench: { flex: 1, height: 48 },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickKey: { width: "23%", height: 44 },
  quickKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
  topActions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  unoNeuBtn: { flex: 1.5, height: 44 },
  catchNeuBtn: { flex: 1, height: 44 },
  topBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  unoText: { fontFamily: "Inter_900Black", fontSize: 10, letterSpacing: 0.5 },
  catchText: { fontFamily: "Inter_900Black", fontSize: 10 },
  displayArea: { marginBottom: 16, position: "relative" },
  displayTextRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 12 },
  displayTotal: { fontFamily: "Inter_900Black", fontSize: 42 },
  displayPts: { fontFamily: "Inter_700Bold", fontSize: 14, color: "rgba(255,255,255,0.3)" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_800ExtraBold", fontSize: 12 },
  placeholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.2)" },
  backspace: { position: "absolute", right: 16, top: 16 },
  scroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 20 },
  key: { width: "18%", height: 54 },
  keyText: { fontFamily: "Inter_900Black", fontSize: 20, color: "#1A0533" },
  keySubtext: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.5)", textTransform: "uppercase" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  actionStrip: { flexGrow: 0, marginBottom: 20 },
  actionStripContent: { gap: 10, paddingRight: 20 },
  actionKey: { width: 84, height: 90 },
  actionLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.8)", marginTop: 6, textAlign: "center", paddingHorizontal: 4 },
  actionValue: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", marginTop: 2 },
});
