import React, { useMemo, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { PolymerButton } from "../PolymerButton";
import { NeuIconWell } from "../PolymerCard";

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
    
    // If lives not met
    if (!firstLife) return 80;
    
    // If show is active
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <View style={styles.row}>
          <Pressable 
            onPress={handleShow}
            style={[styles.showBtn, score === 0 && firstLife && secondLife && thirdLife && styles.showActive]}
          >
            <MaterialCommunityIcons name="cards-playing-outline" size={20} color="#00F5A0" />
            <Text style={styles.showText}>DECLARE SHOW / RUMMY</Text>
            <Text style={styles.showSub}>0 POINTS</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lives Checklist</Text>
        <View style={styles.row}>
          <Pressable 
            onPress={toggleFirstLife}
            style={[styles.chip, firstLife && { backgroundColor: player.color + "22", borderColor: player.color }]}
          >
            <Ionicons 
              name={firstLife ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={firstLife ? player.color : "rgba(255,255,255,0.2)"} 
            />
            <Text style={[styles.chipText, firstLife && { color: "#FFF" }]}>First Life (Pure)</Text>
          </Pressable>

          <Pressable 
            onPress={toggleSecondLife} 
            style={[styles.chip, secondLife && { borderColor: player.color, backgroundColor: player.color + "11" }, !firstLife && { opacity: 0.3 }]}
          >
            <Ionicons name={secondLife ? "checkmark-circle" : "ellipse-outline"} size={16} color={secondLife ? player.color : "rgba(255,255,255,0.2)"} />
            <Text style={[styles.chipText, secondLife && { color: "#FFF" }]}>Second Life</Text>
          </Pressable>

          <Pressable 
            onPress={toggleThirdLife} 
            style={[styles.chip, thirdLife && { borderColor: player.color, backgroundColor: player.color + "11" }, (!firstLife || !secondLife) && { opacity: 0.3 }]}
          >
            <Ionicons name={thirdLife ? "checkmark-circle" : "ellipse-outline"} size={16} color={thirdLife ? player.color : "rgba(255,255,255,0.2)"} />
            <Text style={[styles.chipText, thirdLife && { color: "#FFF" }]}>Third Life / Sets</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Drop Penalties</Text>
        <View style={styles.row}>
          <Pressable 
            onPress={() => handleDrop("first")}
            style={[styles.dropChip, drop === "first" && styles.dropActive]}
          >
            <Text style={styles.dropLabel}>FIRST DROP</Text>
            <Text style={styles.dropPoints}>20</Text>
          </Pressable>

          <Pressable 
            onPress={() => handleDrop("middle")}
            style={[styles.dropChip, drop === "middle" && styles.dropActive]}
          >
            <Text style={styles.dropLabel}>MIDDLE DROP</Text>
            <Text style={styles.dropPoints}>40</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Tap Cards to Add</Text>
          {addedCards.length > 0 && (
            <Pressable onPress={removeLastCard}>
              <Ionicons name="backspace-outline" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>
          )}
        </View>
        
        {/* Face Cards row */}
        <View style={styles.cardGrid}>
          {["A", "K", "Q", "J"].map((card) => (
            <Pressable key={card} onPress={() => addCard(card, 10)} style={styles.cardKey}>
              <Text style={styles.cardText}>{card}</Text>
              <Text style={styles.cardSub}>10</Text>
            </Pressable>
          ))}
        </View>

        {/* Number Cards Grid */}
        <View style={styles.numberGrid}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2].map((num) => (
            <Pressable key={num} onPress={() => addCard(num.toString(), num)} style={styles.numKey}>
              <Text style={styles.numText}>{num}</Text>
            </Pressable>
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Sum of remaining cards..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="numeric"
            value={points}
            onChangeText={handlePointInput}
            maxLength={2}
          />
          {parseInt(points) >= 80 && (
            <View style={styles.capBadge}>
              <Text style={styles.capText}>CAPPED AT 80</Text>
            </View>
          )}
        </View>
        <Text style={styles.hint}>High Cards (A,K,Q,J) = 10 pts | Jokers = 0 pts</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Round Penalty</Text>
        <Text style={[styles.totalValue, { color: score === 0 ? "#00F5A0" : "#FF4757" }]}>
          {score}
        </Text>
        {score === 80 && !firstLife && (
          <View style={styles.roastBadge}>
            <MaterialCommunityIcons name="emoticon-dead-outline" size={14} color="#FFF" />
            <Text style={styles.roastText}>THE ZOMBIE</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", gap: 10 },
  showBtn: { flex: 1, backgroundColor: "rgba(0, 245, 160, 0.05)", borderRadius: 20, padding: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(0, 245, 160, 0.1)", borderStyle: "dashed" },
  showActive: { backgroundColor: "rgba(0, 245, 160, 0.15)", borderColor: "#00F5A0", borderStyle: "solid" },
  showText: { fontFamily: "Inter_900Black", fontSize: 13, color: "#00F5A0", marginTop: 4 },
  showSub: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(0, 245, 160, 0.5)" },
  chip: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", gap: 8 },
  chipText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  dropChip: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.03)", paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)" },
  dropActive: { borderColor: "#FF4757", backgroundColor: "rgba(255, 71, 87, 0.1)" },
  dropLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 9, color: "rgba(255,255,255,0.3)" },
  dropPoints: { fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF" },
  cardGrid: { flexDirection: "row", gap: 8, marginBottom: 10 },
  cardKey: { flex: 1, height: 54, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "rgba(0,0,0,0.3)" },
  cardText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF" },
  cardSub: { fontFamily: "Inter_700Bold", fontSize: 8, color: "rgba(255,255,255,0.3)" },
  numberGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  numKey: { width: "18.5%", height: 38, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: "rgba(0,0,0,0.2)" },
  numText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "#FFF" },
  logStrip: { flexDirection: "row", marginBottom: 10 },
  logChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  logChipText: { fontFamily: "Inter_900Black", fontSize: 11 },
  inputContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.03)", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.05)", color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  capBadge: { backgroundColor: "#FF4757", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capText: { fontFamily: "Inter_900Black", fontSize: 9, color: "#FFF" },
  hint: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 },
  totalBox: { alignItems: "center", marginTop: 10, padding: 20, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  totalValue: { fontFamily: "Inter_900Black", fontSize: 42 },
  roastBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  roastText: { fontFamily: "Inter_900Black", fontSize: 11, color: "#FFF" },
});
