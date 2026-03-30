import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { NeuTrench, NeuButton, NeuIconWell } from "../PolymerCard";

interface GeneralCalculatorProps {
  player: Player;
  game: GameDefinition;
  initialLogs?: number[];
  customScoreRules?: any[];
  onUpdate: (score: number, logs: any[], metadata?: any) => void;
}

export function GeneralCalculator({ player, game, initialLogs, customScoreRules, onUpdate }: GeneralCalculatorProps) {
  const [logs, setLogs] = useState<number[]>(initialLogs || []);
  const [manualValue, setManualValue] = useState("");

  const total = useMemo(() => logs.reduce((a, b) => a + b, 0), [logs]);

  useEffect(() => {
    onUpdate(total, logs, {});
  }, [total, logs, onUpdate]);

  const addValue = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs(prev => [...prev, val]);
  };

  const handleManualAdd = () => {
    const val = parseFloat(manualValue);
    if (!isNaN(val)) {
      addValue(val);
      setManualValue("");
    }
  };

  const removeLast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setLogs([]);
  };

  // Split score rules into numeric (1-10) and custom labels
  const numericRules = useMemo(() => 
    (customScoreRules || game.scoreRules || []).filter(r => !isNaN(Number(r.label)) && Number(r.label) <= 10 && Number(r.label) > 0)
    .sort((a, b) => Number(a.label) - Number(b.label)),
    [customScoreRules, game.scoreRules]
  );

  const customRules = useMemo(() => 
    (customScoreRules || game.scoreRules || []).filter(r => isNaN(Number(r.label)) || Number(r.label) > 10 || Number(r.label) <= 0),
    [customScoreRules, game.scoreRules]
  );

  return (
    <View style={styles.container}>
      {/* Display Area */}
      <View style={styles.displayRow}>
        <View style={styles.scoreWell}>
          <Text style={styles.scoreLabel}>POINTS THIS ROUND</Text>
          <Text style={styles.scoreValue}>{total > 0 ? `+${total}` : total}</Text>
        </View>
        
        <Pressable onPress={removeLast} style={styles.undoBtn}>
            <NeuIconWell color="rgba(255,255,255,0.05)" size={54} borderRadius={16}>
                <Feather name="corner-up-left" size={20} color="#FFB800" />
            </NeuIconWell>
        </Pressable>
      </View>

      {/* History Ribbon */}
      <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={16} padding={10} style={styles.historyTrench}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
          {logs.length === 0 ? (
            <Text style={styles.emptyHistory}>ADD POINTS BELOW</Text>
          ) : (
            logs.map((log, i) => (
              <View key={i} style={styles.historyBadge}>
                <Text style={styles.historyText}>{log > 0 ? `+${log}` : log}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </NeuTrench>

      {/* Manual Input */}
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
      </View>

      {/* Value Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.numericGrid}>
          {numericRules.map((rule) => (
            <Pressable key={rule.id} style={styles.gridItem} onPress={() => addValue(rule.points)}>
                <NeuButton color="rgba(255,255,255,0.05)" borderRadius={16} style={styles.gridBtn}>
                    <Text style={styles.gridBtnText}>{rule.label}</Text>
                </NeuButton>
            </Pressable>
          ))}
        </View>

        {customRules.length > 0 && (
          <ScrollView style={styles.customList} showsVerticalScrollIndicator={false}>
            <View style={styles.customGrid}>
                {customRules.map((rule) => (
                <Pressable key={rule.id} style={styles.customItem} onPress={() => addValue(rule.points)}>
                    <NeuButton color={rule.points < 0 ? "rgba(255,45,120,0.15)" : "rgba(0,245,160,0.15)"} borderRadius={16} style={styles.customBtn}>
                         <View style={styles.customBtnContent}>
                            <Text style={styles.customBtnLabel}>{rule.label}</Text>
                            <Text style={[styles.customBtnPoints, { color: rule.points < 0 ? "#FF2D78" : "#00F5A0" }]}>
                                {rule.points > 0 ? `+${rule.points}` : rule.points}
                            </Text>
                         </View>
                    </NeuButton>
                </Pressable>
                ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  scoreWell: {
    flex: 1,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scoreLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 32,
    color: '#FFF',
    includeFontPadding: false,
  },
  undoBtn: {
    height: 80,
    justifyContent: 'center',
  },
  historyTrench: {
    height: 50,
    marginBottom: 20,
  },
  historyScroll: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  emptyHistory: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
  historyBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  historyText: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 12,
    color: '#00F5A0',
  },
  manualRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  manualInputTrench: {
    flex: 1,
    height: 48,
  },
  manualInput: {
    flex: 1,
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  manualAddBtn: {
    height: 48,
  },
  gridContainer: {
    flex: 1,
  },
  numericGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gridItem: {
    width: '18.4%', // 5 items per row with gap
    height: 48,
  },
  gridBtn: {
    flex: 1,
  },
  gridBtnText: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 16,
    color: '#FFF',
  },
  customList: {
    flex: 1,
  },
  customGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  customItem: {
    width: '48%',
    height: 54,
  },
  customBtn: {
    flex: 1,
  },
  customBtnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  customBtnLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFF',
    flex: 1,
  },
  customBtnPoints: {
    fontFamily: 'Bungee_400Regular',
    fontSize: 13,
  }
});
