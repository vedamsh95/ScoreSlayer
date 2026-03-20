import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface RummyCalculatorProps {
  player: Player;
  initialLogs?: any[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function RummyCalculator({ player, initialLogs, onUpdate }: RummyCalculatorProps) {
  const [firstLife, setFirstLife] = useState(false);
  const [secondLife, setSecondLife] = useState(false);
  const [thirdLife, setThirdLife] = useState(false);
  const [drop, setDrop] = useState<"none" | "first" | "middle">("none");
  const [points, setPoints] = useState<string>("");
  const [addedCards, setAddedCards] = useState<{ label: string; value: number }[]>([]);

  const score = useMemo(() => {
    if (drop === "first") return 20;
    if (drop === "middle") return 40;
    if (!firstLife) return 80;
    if (firstLife && secondLife && thirdLife && addedCards.length === 0 && !points) return 0;

    const cardPoints = addedCards.reduce((sum, c) => sum + c.value, 0);
    const manualPoints = parseInt(points) || 0;
    return Math.min(80, cardPoints + manualPoints);
  }, [firstLife, secondLife, thirdLife, drop, points, addedCards]);

  useEffect(() => {
    onUpdate(score, [...addedCards.map(c => c.label), points].filter(Boolean), { firstLife, secondLife, thirdLife, drop, addedCards });
  }, [score, firstLife, secondLife, thirdLife, drop, points, addedCards, onUpdate]);

  const toggleFirstLife = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFirstLife(!firstLife);
    if (firstLife) setSecondLife(false);
    setDrop("none");
  };

  const toggleSecondLife = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!firstLife) return;
    setSecondLife(!secondLife);
    setDrop("none");
  };

  const handleShow = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDrop("none");
    setFirstLife(true);
    setSecondLife(true);
    setThirdLife(true);
    setAddedCards([]);
    setPoints("");
  };

  const toggleThirdLife = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!firstLife || !secondLife) return;
    setThirdLife(!thirdLife);
    setDrop("none");
  };

  const handleDrop = (type: "first" | "middle") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (drop === type) {
      setDrop("none");
    } else {
      setDrop(type);
      setFirstLife(false);
      setSecondLife(false);
      setPoints("");
    }
  };

  const handlePointInput = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, "");
    setPoints(numeric);
    if (numeric) {
      setDrop("none");
      setFirstLife(true);
    }
  };

  const addCard = (label: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddedCards(prev => [...prev, { label, value }]);
    setDrop("none");
    setFirstLife(true);
  };

  const removeLastCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAddedCards(prev => prev.slice(0, -1));
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <NeuButton 
          onPress={handleShow}
          color={score === 0 && firstLife && secondLife && thirdLife ? "#00F5A0" : "#150428"}
          borderRadius={20}
          style={styles.showNeuBtn}
        >
          <View style={styles.showBtnInner}>
            <MaterialCommunityIcons 
              name="cards-playing-outline" 
              size={20} 
              color={score === 0 && firstLife && secondLife && thirdLife ? "#1A0533" : "#00F5A0"} 
            />
            <View>
              <Text style={[styles.showText, { color: score === 0 && firstLife && secondLife && thirdLife ? "#1A0533" : "#00F5A0" }]}>
                DECLARE SHOW / RUMMY
              </Text>
              <Text style={[styles.showSub, { color: score === 0 && firstLife && secondLife && thirdLife ? "rgba(26,5,51,0.5)" : "rgba(0, 245, 160, 0.5)" }]}>
                0 POINTS
              </Text>
            </View>
          </View>
        </NeuButton>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lives Checklist</Text>
        <View style={styles.row}>
          <Pressable onPress={toggleFirstLife} style={{ flex: 1 }}>
            <NeuTrench color={firstLife ? player.color : "#150428"} borderRadius={16} padding={12} style={styles.chip}>
              <Ionicons 
                name={firstLife ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={firstLife ? "#1A0533" : "rgba(255,255,255,0.2)"} 
              />
              <Text style={[styles.chipText, firstLife && { color: "#1A0533" }]}>First Life</Text>
            </NeuTrench>
          </Pressable>

          <Pressable onPress={toggleSecondLife} style={[{ flex: 1 }, !firstLife && { opacity: 0.3 }]}>
            <NeuTrench color={secondLife ? player.color : "#150428"} borderRadius={16} padding={12} style={styles.chip}>
              <Ionicons name={secondLife ? "checkmark-circle" : "ellipse-outline"} size={16} color={secondLife ? "#1A0533" : "rgba(255,255,255,0.2)"} />
              <Text style={[styles.chipText, secondLife && { color: "#1A0533" }]}>Second Life</Text>
            </NeuTrench>
          </Pressable>

          <Pressable onPress={toggleThirdLife} style={[{ flex: 1 }, (!firstLife || !secondLife) && { opacity: 0.3 }]}>
            <NeuTrench color={thirdLife ? player.color : "#150428"} borderRadius={16} padding={12} style={styles.chip}>
              <Ionicons name={thirdLife ? "checkmark-circle" : "ellipse-outline"} size={16} color={thirdLife ? "#1A0533" : "rgba(255,255,255,0.2)"} />
              <Text style={[styles.chipText, thirdLife && { color: "#1A0533" }]}>Sets</Text>
            </NeuTrench>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Drop Penalties</Text>
        <View style={styles.row}>
          <NeuButton 
            onPress={() => handleDrop("first")}
            color={drop === "first" ? "#FF4757" : "#150428"}
            borderRadius={16}
            style={styles.dropButton}
          >
            <Text style={[styles.dropLabel, drop === "first" && { color: "rgba(255,255,255,0.8)" }]}>FIRST DROP</Text>
            <Text style={[styles.dropPoints, drop === "first" && { color: "#FFF" }]}>20</Text>
          </NeuButton>

          <NeuButton 
            onPress={() => handleDrop("middle")}
            color={drop === "middle" ? "#FF4757" : "#150428"}
            borderRadius={16}
            style={styles.dropButton}
          >
            <Text style={[styles.dropLabel, drop === "middle" && { color: "rgba(255,255,255,0.8)" }]}>MIDDLE DROP</Text>
            <Text style={[styles.dropPoints, drop === "middle" && { color: "#FFF" }]}>40</Text>
          </NeuButton>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Tap Cards</Text>
          {addedCards.length > 0 && (
            <Pressable onPress={removeLastCard}>
              <NeuIconWell color="#150428" size={32} borderRadius={8}>
                <Ionicons name="backspace-outline" size={16} color="rgba(255,255,255,0.4)" />
              </NeuIconWell>
            </Pressable>
          )}
        </View>
        
        <View style={styles.cardGrid}>
          {["A", "K", "Q", "J"].map((card) => (
            <NeuButton key={card} onPress={() => addCard(card, 10)} color="#00D2FF" borderRadius={12} style={styles.cardKey}>
              <Text style={styles.cardText}>{card}</Text>
              <Text style={styles.cardSub}>10</Text>
            </NeuButton>
          ))}
        </View>

        <View style={styles.numberGrid}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2].map((num) => (
            <NeuButton key={num} onPress={() => addCard(num.toString(), num)} color="#00D2FF" borderRadius={10} style={styles.numKey}>
              <Text style={styles.numText}>{num}</Text>
            </NeuButton>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logStrip}>
          {addedCards.map((c, i) => (
            <View key={i} style={[styles.logChip, { backgroundColor: player.color + "22" }]}>
              <Text style={[styles.logChipText, { color: player.color }]}>{c.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Deadwood Sum</Text>
        <NeuTrench color="#150428" borderRadius={18} padding={0} style={styles.inputTrench}>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.1)"
            keyboardType="numeric"
            value={points}
            onChangeText={handlePointInput}
            maxLength={2}
          />
          {parseInt(points) >= 80 && (
            <View style={styles.capBadge}>
              <Text style={styles.capText}>CAPPED</Text>
            </View>
          )}
        </NeuTrench>
      </View>

      <NeuTrench color="#150428" borderRadius={24} padding={20} style={styles.totalBox}>
        <Text style={styles.totalLabel}>Round Penalty</Text>
        <Text style={[styles.totalValue, { color: score === 0 ? "#00F5A0" : "#FF4757" }]}>
          {score}
        </Text>
        {score === 80 && !firstLife && (
          <NeuTrench color="#FF475722" borderRadius={10} padding={6} style={styles.roastBadge}>
            <MaterialCommunityIcons name="emoticon-dead-outline" size={14} color="#FF4757" />
            <Text style={styles.roastText}>THE ZOMBIE</Text>
          </NeuTrench>
        )}
      </NeuTrench>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 18 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  showNeuBtn: { width: "100%", height: 64 },
  showBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  showText: { fontFamily: "Inter_900Black", fontSize: 13, letterSpacing: 0.5 },
  showSub: { fontFamily: "Inter_700Bold", fontSize: 9, textTransform: "uppercase", marginTop: 2 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  chipText: { fontFamily: "Inter_800ExtraBold", fontSize: 11, color: "rgba(255,255,255,0.3)" },
  dropButton: { flex: 1, height: 60 },
  dropLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(255,255,255,0.3)" },
  dropPoints: { fontFamily: "Inter_900Black", fontSize: 20, color: "#1A0533", marginTop: 2 },
  cardGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  cardKey: { flex: 1, height: 50 },
  cardText: { fontFamily: "Inter_900Black", fontSize: 15, color: "#1A0533" },
  cardSub: { fontFamily: "Inter_800ExtraBold", fontSize: 8, color: "rgba(26,5,51,0.4)" },
  numberGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  numKey: { width: "18.5%", height: 36 },
  numText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#1A0533" },
  logStrip: { flexDirection: "row" },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_900Black", fontSize: 11 },
  inputTrench: { flexDirection: "row", alignItems: "center", paddingRight: 12 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, color: "#FFF", fontFamily: "Inter_900Black", fontSize: 18 },
  capBadge: { backgroundColor: "#FF4757", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#FFF" },
  totalBox: { alignItems: "center", marginTop: 10 },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 44 },
  roastBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  roastText: { fontFamily: "Inter_900Black", fontSize: 10, color: "#FF4757", letterSpacing: 0.5 },
});
