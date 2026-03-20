import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";

const { width } = Dimensions.get("window");

interface SevenWondersCalculatorProps {
  player: Player;
  initialStats?: Record<string, number>;
  initialScience?: { gears: number; tablets: number; compasses: number };
  initialMilitary?: { age1: number, age2: number, age3: number, defeats: number };
  initialCoins?: number;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SevenWondersCalculator({ 
  player, 
  initialStats, 
  initialScience, 
  initialMilitary,
  initialCoins,
  onUpdate 
}: SevenWondersCalculatorProps) {
  const [stats, setStats] = useState<Record<string, number>>(initialStats || {
    wonder: 0, civil: 0, commerce: 0, guilds: 0
  });
  const [science, setScience] = useState(initialScience || { gears: 0, tablets: 0, compasses: 0 });
  
  // Detailed Military Logic
  const [milDetail, setMilDetail] = useState(initialMilitary || {
    age1: 0, age2: 0, age3: 0, defeats: 0
  });

  // Detailed Coins Logic
  const [totalCoins, setTotalCoins] = useState(initialCoins || 0);

  const milScore = useMemo(() => {
    return (milDetail.age1 * 1) + (milDetail.age2 * 3) + (milDetail.age3 * 5) - milDetail.defeats;
  }, [milDetail]);

  const coinScore = useMemo(() => {
    return Math.floor(totalCoins / 3);
  }, [totalCoins]);

  const sciScore = useMemo(() => {
    const { gears: g, tablets: t, compasses: c } = science;
    const n2 = (g**2 + t**2 + c**2);
    const sets = Math.min(g, t, c) * 7;
    return n2 + sets;
  }, [science]);

  const total = useMemo(() => {
    const base = Object.values(stats).reduce((a, b) => a + b, 0);
    return base + sciScore + milScore + coinScore;
  }, [stats, sciScore, milScore, coinScore]);

  useEffect(() => {
    // Determine Roasts
    const roasts = [];
    if (sciScore > 30) roasts.push("The Nerd: Spent the game in a library.");
    if (milScore < 0) roasts.push("The Pacifist: Civilization is a 'Kick Me' sign.");
    if (coinScore === 0 && totalCoins > 0) roasts.push("The Broke Boy: Zero financial literacy.");
    if (stats.guilds > 12) roasts.push("The Parasite: Neighbor leech energy detected.");

    onUpdate(total, [total], { stats, science, milDetail, totalCoins, roasts });
  }, [total, stats, science, milDetail, totalCoins, onUpdate]);

  const updateStat = (cat: string, val: number) => {
    setStats(prev => ({ ...prev, [cat]: Math.max(0, val) }));
  };

  const updateSci = (type: keyof typeof science, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScience(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const updateMil = (type: keyof typeof milDetail, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMilDetail(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const categories = [
    { id: "wonder", icon: "pyramid", label: "Wonder", color: "#95A5A6" },
    { id: "civil", icon: "bank", label: "Civil", color: "#3498DB" },
    { id: "commerce", icon: "store", label: "Commerce", color: "#F39C12" },
    { id: "guilds", icon: "crown", label: "Guilds", color: "#8E44AD" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.totalBox}>
          <Text style={[styles.totalVal, { color: player.color }]}>{total}</Text>
          <Text style={styles.totalLabel}>Grand Total</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Military - Special Large Card */}
        <View style={[styles.card, styles.wideCard, { borderColor: "#E74C3C33" }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#E74C3C22" }]}>
              <MaterialCommunityIcons name="sword-cross" size={16} color="#E74C3C" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Military</Text>
              <Text style={styles.scoreSummary}>{milScore} pts</Text>
            </View>
          </View>
          <View style={styles.milControls}>
             <View style={styles.milRow}>
                <View style={styles.milItem}><Text style={styles.milLabel}>Age I (+1)</Text><View style={styles.counter}><Pressable onPress={() => updateMil("age1",-1)} style={styles.btn}><Ionicons name="remove" size={12} color="#FFF"/></Pressable><Text style={styles.count}>{milDetail.age1}</Text><Pressable onPress={() => updateMil("age1",1)} style={styles.btn}><Ionicons name="add" size={12} color="#FFF"/></Pressable></View></View>
                <View style={styles.milItem}><Text style={styles.milLabel}>Age II (+3)</Text><View style={styles.counter}><Pressable onPress={() => updateMil("age2",-1)} style={styles.btn}><Ionicons name="remove" size={12} color="#FFF"/></Pressable><Text style={styles.count}>{milDetail.age2}</Text><Pressable onPress={() => updateMil("age2",1)} style={styles.btn}><Ionicons name="add" size={12} color="#FFF"/></Pressable></View></View>
             </View>
             <View style={styles.milRow}>
                <View style={styles.milItem}><Text style={styles.milLabel}>Age III (+5)</Text><View style={styles.counter}><Pressable onPress={() => updateMil("age3",-1)} style={styles.btn}><Ionicons name="remove" size={12} color="#FFF"/></Pressable><Text style={styles.count}>{milDetail.age3}</Text><Pressable onPress={() => updateMil("age3",1)} style={styles.btn}><Ionicons name="add" size={12} color="#FFF"/></Pressable></View></View>
                <View style={styles.milItem}><Text style={[styles.milLabel, {color: "#FF4757"}]}>Loss (-1)</Text><View style={styles.counter}><Pressable onPress={() => updateMil("defeats",-1)} style={styles.btn}><Ionicons name="remove" size={12} color="#FFF"/></Pressable><Text style={styles.count}>{milDetail.defeats}</Text><Pressable onPress={() => updateMil("defeats",1)} style={styles.btn}><Ionicons name="add" size={12} color="#FFF"/></Pressable></View></View>
             </View>
          </View>
        </View>

        {/* Regular Categories */}
        {categories.map(cat => (
          <View key={cat.id} style={[styles.card, { borderColor: cat.color + "33" }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: cat.color + "22" }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={16} color={cat.color} />
              </View>
              <Text style={styles.cardLabel}>{cat.label}</Text>
            </View>
            <View style={styles.controls}>
              <Pressable onPress={() => updateStat(cat.id, stats[cat.id] - 1)} style={styles.adjBtn}><Ionicons name="remove" size={14} color="rgba(255,255,255,0.4)" /></Pressable>
              <TextInput style={[styles.input, { color: cat.color }]} keyboardType="numeric" value={stats[cat.id].toString()} onChangeText={(v) => updateStat(cat.id, parseInt(v) || 0)} selectTextOnFocus />
              <Pressable onPress={() => updateStat(cat.id, stats[cat.id] + 1)} style={styles.adjBtn}><Ionicons name="add" size={14} color={cat.color} /></Pressable>
            </View>
          </View>
        ))}

        {/* Coins - Special Row */}
        <View style={[styles.card, styles.wideCard, { borderColor: "#F1C40F33" }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#F1C40F22" }]}>
              <MaterialCommunityIcons name="cash" size={16} color="#F1C40F" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Coins / 3</Text>
              <Text style={[styles.scoreSummary, {color: "#F1C40F"}]}>{coinScore} pts</Text>
            </View>
          </View>
          <View style={styles.coinEntry}>
             <Text style={styles.coinLabel}>Total Coins:</Text>
             <TextInput style={styles.coinInput} keyboardType="numeric" placeholder="0" value={totalCoins.toString()} onChangeText={(v) => setTotalCoins(parseInt(v) || 0)} selectTextOnFocus />
             <Text style={styles.coinHint}>{totalCoins} ÷ 3 = {coinScore}</Text>
          </View>
        </View>

        {/* Science - Detailed Row */}
        <View style={[styles.card, styles.wideCard, { borderColor: "#27AE6033" }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#27AE6022" }]}>
              <MaterialCommunityIcons name="flask" size={16} color="#27AE60" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Science Details</Text>
              <Text style={[styles.scoreSummary, {color: "#27AE60"}]}>{sciScore} pts</Text>
            </View>
          </View>
          <View style={styles.sciTools}>
            {[
              { id: "gears", icon: "cog", label: "Gear" },
              { id: "tablets", icon: "tablet", label: "Table" },
              { id: "compasses", icon: "compass-outline", label: "Comp" },
            ].map(s => (
              <View key={s.id} style={styles.sciItem}>
                <Text style={styles.sciLabel}>{s.label}</Text>
                <View style={styles.sciControls}>
                  <Pressable onPress={() => updateSci(s.id as any, -1)} style={styles.adjBtnSm}><Ionicons name="remove" size={12} color="rgba(255,255,255,0.3)" /></Pressable>
                  <Text style={styles.sciVal}>{science[s.id as keyof typeof science]}</Text>
                  <Pressable onPress={() => updateSci(s.id as any, 1)} style={styles.adjBtnSm}><Ionicons name="add" size={12} color="#27AE60" /></Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { alignItems: "center", paddingVertical: 16 },
  totalBox: { alignItems: "center" },
  totalVal: { fontFamily: "Inter_900Black", fontSize: 54 },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  card: { width: "48%", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  wideCard: { width: "100%" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "#FFF" },
  scoreSummary: { fontFamily: "Inter_700Bold", fontSize: 11, color: "rgba(255,255,255,0.4)" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 4 },
  adjBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  adjBtnSm: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  input: { fontFamily: "Inter_900Black", fontSize: 22, textAlign: "center", minWidth: 40, padding: 0 },
  milControls: { gap: 10 },
  milRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  milItem: { flex: 1 },
  milLabel: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 },
  counter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 },
  btn: { width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  count: { fontFamily: "Inter_900Black", fontSize: 14, color: "#FFF" },
  coinEntry: { flexDirection: "row", alignItems: "center", gap: 12 },
  coinLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  coinInput: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", width: 80 },
  coinHint: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.2)" },
  sciTools: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  sciItem: { flex: 1, alignItems: "center", gap: 8 },
  sciLabel: { fontFamily: "Inter_700Bold", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  sciControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, width: "100%" },
  sciVal: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF" },
});
