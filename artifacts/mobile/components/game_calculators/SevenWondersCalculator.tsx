import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Dimensions } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

const { width } = Dimensions.get("window");

interface SevenWondersCalculatorProps {
  player: Player;
  initialStats?: Record<string, number>;
  initialScience?: { gears: number; tablets: number; compasses: number };
  initialMilitary?: { age1: number, age2: number, age3: number, defeats: number };
  initialCoins?: number;
  initialMetadata?: any;
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function SevenWondersCalculator({ 
  player, 
  initialStats, 
  initialScience, 
  initialMilitary,
  initialCoins,
  initialMetadata,
  onUpdate 
}: SevenWondersCalculatorProps) {
  const [stats, setStats] = useState<Record<string, number>>(initialStats || initialMetadata?.stats || {
    wonder: 0, civil: 0, commerce: 0, guilds: 0
  });
  const [science, setScience] = useState<{ gears: number; tablets: number; compasses: number }>(initialScience || initialMetadata?.science || { gears: 0, tablets: 0, compasses: 0 });
  const [milDetail, setMilDetail] = useState<{ age1: number, age2: number, age3: number, defeats: number }>(initialMilitary || initialMetadata?.milDetail || { age1: 0, age2: 0, age3: 0, defeats: 0 });
  const [totalCoins, setTotalCoins] = useState(initialCoins || initialMetadata?.totalCoins || 0);

  const [manualValue, setManualValue] = useState("");
  const [dynamicQuickAdds, setDynamicQuickAdds] = useState<number[]>(initialMetadata?.dynamicQuickAdds || []);
  const [manualLogs, setManualLogs] = useState<number[]>(initialMetadata?.manualLogs || []);

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
    const manualTotal = manualLogs.reduce((a, b) => a + b, 0);
    return base + sciScore + milScore + coinScore + manualTotal;
  }, [stats, sciScore, milScore, coinScore, manualLogs]);

  useEffect(() => {
    const roasts = [];
    if (sciScore > 30) roasts.push("The Nerd: Spent the game in a library.");
    if (milScore < 0) roasts.push("The Pacifist: Civilization is a 'Kick Me' sign.");
    if (coinScore === 0 && totalCoins > 0) roasts.push("The Broke Boy: Zero financial literacy.");
    if (stats.guilds > 12) roasts.push("The Parasite: Neighbor leech energy detected.");

    onUpdate(total, manualLogs, { stats, science, milDetail, totalCoins, manualLogs, dynamicQuickAdds, roasts });
  }, [total, stats, science, milDetail, totalCoins, manualLogs, dynamicQuickAdds, onUpdate]);

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

  const categories = [
    { id: "wonder", icon: "pyramid", label: "Wonder", color: "#95A5A6" },
    { id: "civil", icon: "bank", label: "Civil", color: "#3498DB" },
    { id: "commerce", icon: "store", label: "Commerce", color: "#F39C12" },
    { id: "guilds", icon: "crown", label: "Guilds", color: "#8E44AD" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <NeuTrench color="#150428" borderRadius={28} padding={20} style={styles.header}>
        <View style={styles.totalBox}>
          <Text style={[styles.totalVal, { color: player.color }]}>{total}</Text>
          <Text style={styles.totalLabel}>Civilization Score</Text>
        </View>
      </NeuTrench>

      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Adjustment</Text>
        <View style={styles.manualRow}>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.manualInputTrench}>
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              placeholder="Manual Pts..."
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
          <Text style={styles.sectionTitle}>Shortcuts</Text>
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
                style={styles.shortcutKey}
              >
                <Text style={styles.shortcutKeyText}>+{val}</Text>
              </NeuButton>
            ))}
          </View>
        </View>
      )}

      <View style={styles.grid}>
        {/* Military Card */}
        <NeuTrench color="#150428" borderRadius={24} padding={16} style={styles.wideCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWell, { backgroundColor: "#E74C3C22" }]}>
              <MaterialCommunityIcons name="sword-cross" size={20} color="#E74C3C" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Military Might</Text>
              <Text style={[styles.scoreSummary, { color: "#E74C3C" }]}>{milScore} points</Text>
            </View>
          </View>
          <View style={styles.milControls}>
             <View style={styles.milRow}>
                <View style={styles.milItem}>
                  <Text style={styles.milLabel}>AGE I (+1)</Text>
                  <View style={styles.counter}>
                    <NeuButton onPress={() => updateMil("age1", -1)} color="#FF4757" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="remove" size={12} color="#1A0533"/>
                    </NeuButton>
                    <Text style={styles.count}>{milDetail.age1}</Text>
                    <NeuButton onPress={() => updateMil("age1", 1)} color="#00F5A0" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="add" size={12} color="#1A0533"/>
                    </NeuButton>
                  </View>
                </View>
                <View style={styles.milItem}>
                  <Text style={styles.milLabel}>AGE II (+3)</Text>
                  <View style={styles.counter}>
                    <NeuButton onPress={() => updateMil("age2", -1)} color="#FF4757" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="remove" size={12} color="#1A0533"/>
                    </NeuButton>
                    <Text style={styles.count}>{milDetail.age2}</Text>
                    <NeuButton onPress={() => updateMil("age2", 1)} color="#00F5A0" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="add" size={12} color="#1A0533"/>
                    </NeuButton>
                  </View>
                </View>
             </View>
             <View style={styles.milRow}>
                <View style={styles.milItem}>
                  <Text style={styles.milLabel}>AGE III (+5)</Text>
                  <View style={styles.counter}>
                    <NeuButton onPress={() => updateMil("age3", -1)} color="#FF4757" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="remove" size={12} color="#1A0533"/>
                    </NeuButton>
                    <Text style={styles.count}>{milDetail.age3}</Text>
                    <NeuButton onPress={() => updateMil("age3", 1)} color="#00F5A0" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="add" size={12} color="#1A0533"/>
                    </NeuButton>
                  </View>
                </View>
                <View style={styles.milItem}>
                  <Text style={[styles.milLabel, {color: "#FF4757"}]}>DEFEATS (-1)</Text>
                  <View style={styles.counter}>
                    <NeuButton onPress={() => updateMil("defeats", -1)} color="#FF4757" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="remove" size={12} color="#1A0533"/>
                    </NeuButton>
                    <Text style={styles.count}>{milDetail.defeats}</Text>
                    <NeuButton onPress={() => updateMil("defeats", 1)} color="#00F5A0" borderRadius={8} style={styles.miniBtn}>
                      <Ionicons name="add" size={12} color="#1A0533"/>
                    </NeuButton>
                  </View>
                </View>
             </View>
          </View>
        </NeuTrench>

        {/* Regular Categories */}
        {categories.map(cat => (
          <NeuTrench key={cat.id} color="#150428" borderRadius={24} padding={16} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWell, { backgroundColor: cat.color + "22" }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={styles.cardLabel}>{cat.label}</Text>
            </View>
            <View style={styles.controls}>
              <NeuButton onPress={() => updateStat(cat.id, stats[cat.id] - 1)} color="#FF4757" borderRadius={10} style={styles.adjBtn}>
                <Ionicons name="remove" size={14} color="#1A0533" />
              </NeuButton>
              <TextInput 
                style={[styles.input, { color: cat.color }]} 
                keyboardType="numeric" 
                value={stats[cat.id].toString()} 
                onChangeText={(v) => updateStat(cat.id, parseInt(v) || 0)} 
                selectTextOnFocus 
              />
              <NeuButton onPress={() => updateStat(cat.id, stats[cat.id] + 1)} color="#00F5A0" borderRadius={10} style={styles.adjBtn}>
                <Ionicons name="add" size={14} color="#1A0533" />
              </NeuButton>
            </View>
          </NeuTrench>
        ))}

        {/* Coins Card */}
        <NeuTrench color="#150428" borderRadius={24} padding={16} style={styles.wideCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWell, { backgroundColor: "#F1C40F22" }]}>
              <MaterialCommunityIcons name="cash" size={20} color="#F1C40F" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Treasury</Text>
              <Text style={[styles.scoreSummary, {color: "#F1C40F"}]}>{coinScore} pts (3:1 ratio)</Text>
            </View>
          </View>
          <View style={styles.coinEntry}>
             <Text style={styles.coinLabel}>TOTAL COINS</Text>
             <TextInput 
              style={styles.coinInput} 
              keyboardType="numeric" 
              placeholder="0" 
              value={totalCoins.toString()} 
              onChangeText={(v) => setTotalCoins(parseInt(v) || 0)} 
              selectTextOnFocus 
             />
             <View style={styles.coinBadge}>
               <Text style={styles.coinBadgeText}>+{coinScore} VP</Text>
             </View>
          </View>
        </NeuTrench>

        {/* Science Card */}
        <NeuTrench color="#150428" borderRadius={24} padding={16} style={styles.wideCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWell, { backgroundColor: "#00D2FF22" }]}>
              <MaterialCommunityIcons name="flask" size={20} color="#00D2FF" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Scientific Advancements</Text>
              <Text style={[styles.scoreSummary, {color: "#00D2FF"}]}>{sciScore} VP (Sets + Squaring)</Text>
            </View>
          </View>
          <View style={styles.sciTools}>
            {[
              { id: "gears", icon: "cog", label: "GEAR" },
              { id: "tablets", icon: "tablet", label: "TABLET" },
              { id: "compasses", icon: "compass-outline", label: "COMPASS" },
            ].map(s => (
              <View key={s.id} style={styles.sciItem}>
                <Text style={styles.sciLabel}>{s.label}</Text>
                <View style={styles.sciControls}>
                  <NeuButton onPress={() => updateSci(s.id as any, -1)} color="#FF4757" borderRadius={10} style={styles.miniBtn}>
                    <Ionicons name="remove" size={12} color="#1A0533" />
                  </NeuButton>
                  <Text style={styles.sciVal}>{science[s.id as keyof typeof science]}</Text>
                  <NeuButton onPress={() => updateSci(s.id as any, 1)} color="#00F5A0" borderRadius={10} style={styles.miniBtn}>
                    <Ionicons name="add" size={12} color="#1A0533" />
                  </NeuButton>
                </View>
              </View>
            ))}
          </View>
        </NeuTrench>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { alignItems: "center", marginBottom: 12, marginTop: 8 },
  totalBox: { alignItems: "center" },
  totalVal: { fontFamily: "Inter_900Black", fontSize: 64, lineHeight: 70 },
  totalLabel: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  card: { width: "48%" },
  wideCard: { width: "100%" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  iconWell: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontFamily: "Inter_900Black", fontSize: 13, color: "#FFF", textTransform: "uppercase" },
  scoreSummary: { fontFamily: "Inter_800ExtraBold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  adjBtn: { width: 34, height: 34 },
  miniBtn: { width: 28, height: 28 },
  input: { fontFamily: "Inter_900Black", fontSize: 24, textAlign: "center", minWidth: 40, padding: 0 },
  milControls: { gap: 12 },
  milRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  milItem: { flex: 1 },
  milLabel: { fontFamily: "Inter_900Black", fontSize: 9, color: "rgba(255,255,255,0.2)", marginBottom: 6, letterSpacing: 0.5 },
  counter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  count: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF", minWidth: 20, textAlign: "center" },
  coinEntry: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  coinLabel: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  coinInput: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontFamily: "Inter_900Black", fontSize: 20, color: "#FFF", width: 100 },
  coinBadge: { backgroundColor: "#F1C40F22", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  coinBadgeText: { fontFamily: "Inter_900Black", fontSize: 12, color: "#F1C40F" },
  sciTools: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  sciItem: { flex: 1, gap: 6 },
  sciLabel: { fontFamily: "Inter_900Black", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 },
  sciControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  sciVal: { fontFamily: "Inter_900Black", fontSize: 18, color: "#FFF", minWidth: 22, textAlign: "center" },
  manualSection: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Inter_900Black", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10, letterSpacing: 1.5 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  manualInputTrench: { flex: 1, height: 48 },
  manualActionGroup: { flexDirection: "row", alignItems: "center" },
  manualInput: { flex: 1, color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 16, paddingHorizontal: 16 },
  manualAddBtn: { height: 48 },
  shortcutsSection: { marginBottom: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutKey: { width: "23%", height: 44 },
  shortcutKeyText: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "#1A0533" },
});
