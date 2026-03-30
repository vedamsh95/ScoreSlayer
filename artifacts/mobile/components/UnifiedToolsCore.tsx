import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from 'react-native-svg';
import { NeuTrench, NeuIconWell, BrandButton } from "./PolymerCard";

const { width } = Dimensions.get("window");
const DICE_SIZE = width * 0.22;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WinnerAvatar = ({ player, isWinner, initial }: { player: any, isWinner: boolean, initial: string }) => {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isWinner) {
        glowScale.value = withRepeat(withTiming(1.5, { duration: 800 }), -1, true);
        glowOpacity.value = withRepeat(withTiming(0.1, { duration: 800 }), -1, true);
    } else {
        glowScale.value = 1;
        glowOpacity.value = 0;
    }
  }, [isWinner]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.avatarBody, { backgroundColor: player.color, borderColor: isWinner ? '#FFF' : 'rgba(255,255,255,0.2)' }]}>
        <Text style={[styles.avatarText, initial.length > 1 && { fontSize: 14 }]}>{initial}</Text>
        {isWinner && <Animated.View style={[styles.winnerGlow, glowStyle, { backgroundColor: player.color }]} />}
    </View>
  );
};

interface UnifiedToolsCoreProps {
  initialTab?: "dice" | "first" | "seating" | "timer";
  initialPlayers?: { id: string; name: string; color: string }[];
  onShuffleSeating?: (shuffled: any[]) => void;
  showPlayerInput?: boolean;
}

const DICE_FACES: Record<number, number[][]> = {
  1: [[4]],
  2: [[0], [8]],
  3: [[0], [4], [8]],
  4: [[0, 2], [6, 8]],
  5: [[0, 2], [4], [6, 8]],
  6: [[0, 3, 6], [2, 5, 8]],
};

const SeatItem = ({ player, x, y, initial }: { player: any, x: number, y: number, initial: string }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
        { translateX: withSpring(x, { damping: 15, stiffness: 100 }) },
        { translateY: withSpring(y, { damping: 15, stiffness: 100 }) }
    ],
  }));

  return (
    <Animated.View style={[styles.seat, animatedStyle]}>
        <View style={[styles.seatBody, { borderColor: player.color }]}>
            <Text style={[styles.seatText, initial.length > 1 && { fontSize: 11 }]}>{initial}</Text>
        </View>
        <Text style={styles.avatarName} numberOfLines={1}>{player.name}</Text>
    </Animated.View>
  );
};

const getInitial = (name: string, allNames: string[]) => {
  if (!name) return "?";
  const firstChar = name[0].toUpperCase();
  const othersHaveSameFirst = allNames.filter(n => n.toLowerCase() !== name.toLowerCase()).some(n => n[0]?.toUpperCase() === firstChar);
  return othersHaveSameFirst ? name.substring(0, 2).toUpperCase() : firstChar;
};

const DiceFace = ({ value }: { value: number }) => {
  const dots = DICE_FACES[value] || [];
  return (
    <View style={styles.diceClassicShadow}>
      <View style={styles.diceClassicBody}>
        <View style={styles.diceClassicGloss} />
        <View style={styles.diceGrid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const isDot = dots.some((row) => row.includes(i));
            return (
              <View key={i} style={styles.dotCell}>
                {isDot && <View style={styles.dotClassic} />}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export function UnifiedToolsCore({ initialPlayers = [], onShuffleSeating, showPlayerInput = false, initialTab = "first" }: UnifiedToolsCoreProps) {
  const [activeTab, setActiveTab] = useState<"dice" | "first" | "seating" | "timer">(initialTab);
  
  // PLAYER STATE
  const [players, setPlayers] = useState(initialPlayers);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (initialPlayers.length > 0) setPlayers(initialPlayers);
  }, [initialPlayers]);

  // DICE STATE
  const [diceCount, setDiceCount] = useState(2);
  const [diceResults, setDiceResults] = useState<number[]>(Array(diceCount).fill(1));
  const [isRolling, setIsRolling] = useState(false);
  const rollRotation = useSharedValue(0);
  const rollScale = useSharedValue(1);

  // BOTTLE SPIN STATE (FIRST)
  const [isSpinning, setIsSpinning] = useState(false);
const spinRotation = useSharedValue(0);
  const idleRotation = useSharedValue(0);
  useEffect(() => {
    idleRotation.value = withRepeat(withTiming(360, { duration: 20000 }), -1, true);
  }, []);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  // TIMER STATE
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(60);
  const timerProgress = useSharedValue(1);

  // --- DICE LOGIC ---
  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setWinnerIdx(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    rollRotation.value = withSequence(withTiming(720, { duration: 600 }), withTiming(0, { duration: 0 }));
    rollScale.value = withSequence(withTiming(0.8, { duration: 150 }), withSpring(1.2), withSpring(1));

    // High-speed physics shuffle
    let count = 0;
    const interval = setInterval(() => {
        setDiceResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
        Haptics.selectionAsync();
        count++;
        if (count > 12) {
            clearInterval(interval);
            setIsRolling(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, 50);
  }, [diceCount, isRolling]);

  // --- BOTTLE SPIN LOGIC ---
  const spinBottle = useCallback(() => {
    if (isSpinning || players.length < 2) return;
    setIsSpinning(true);
    setWinnerIdx(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const randomSpins = 4 + Math.random() * 6;
    const finalAngle = spinRotation.value + (randomSpins * 360);

    spinRotation.value = withSpring(finalAngle, { damping: 40, stiffness: 80 }, (finished) => {
      if (finished) {
        runOnJS(setIsSpinning)(false);
        const totalDegrees = finalAngle % 360;
        const playerAngleStep = 360 / players.length;
        const offsetCorrection = playerAngleStep / 2; // Point to player center
        const correctedAngle = (totalDegrees + offsetCorrection) % 360;
        const idx = Math.floor(correctedAngle / playerAngleStep) % players.length;
        runOnJS(setWinnerIdx)(idx);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      }
    });
  }, [players, isSpinning]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
           const next = t - 1;
           timerProgress.value = withTiming(next / initialTime, { duration: 1000 });
           return next;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timeLeft, initialTime]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsTimerRunning(true);
    timerProgress.value = 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const addPlayerManual = () => {
    if (!newName.trim()) return;
    const normalized = newName.trim();
    if (players.some(p => p.name.toLowerCase() === normalized.toLowerCase())) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
    }
    const colors = ["#00F5A0", "#FF2D78", "#8B5CF6", "#FFB800", "#00D2FF", "#EE5253"];
    setPlayers([...players, { id: Date.now().toString(), name: normalized, color: colors[players.length % colors.length] }]);
    setNewName("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removePlayerManual = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // --- ANIMATED STYLES ---
  const animatedDiceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rollRotation.value}deg` }, { scale: rollScale.value }],
  }));

const animatedSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value + idleRotation.value}deg` }],
  }));

  const animatedTimerProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(timerProgress.value, [0, 1], [2 * Math.PI * 140, 0]),
  }));

  const renderTabHeader = () => (
    <View style={styles.tabBar}>
        <View style={styles.tabRow}>
            {(["dice", "first", "seating", "timer"] as const).map(tab => {
                const active = activeTab === tab;
                const iconName = tab === 'dice' ? 'dice-6' : tab === 'first' ? 'bottle-wine' : tab === 'seating' ? 'seat-recline-normal' : 'timer-outline';
                
                return active ? (
                    <Pressable
                        key={tab}
                        style={[styles.tabOptionShadow, { flex: 1, borderRadius: 16 }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setActiveTab(tab);
                        }}
                    >
                        <View style={[styles.tabOptionClay, { borderRadius: 16, backgroundColor: "#00F5A0" }]}>
                            <View style={styles.tabGloss} pointerEvents="none" />
                        <MaterialCommunityIcons name={iconName as any} size={20} color="#1A0533" />
                            <Text style={styles.tabTextActive}>{tab.toUpperCase()}</Text>
                        </View>
                    </Pressable>
                ) : (
                    <Pressable key={tab} style={{ flex: 1 }} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveTab(tab);
                    }}>
                        <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={16} padding={10} style={styles.tabOptionNeu}>
                            <MaterialCommunityIcons name={iconName as any} size={18} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.tabTextInactive}>{tab.toUpperCase()}</Text>
                        </NeuTrench>
                    </Pressable>
                );
            })}
        </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dice":
        return (
          <View style={styles.tabContent}>
            <View style={styles.toolMain}>
                <View style={[styles.diceArea, { minHeight: 200 }]}>
                    <Animated.View style={[styles.diceLayout, animatedDiceStyle]}>
                    {diceResults.map((val, idx) => (
                        <DiceFace key={idx} value={val} />
                    ))}
                    </Animated.View>
                    {!isRolling && (
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalValue}>{diceResults.reduce((a, b) => a + b, 0)}</Text>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                    </View>
                    )}
                </View>

                <View style={styles.toolControls}>
                    <View style={styles.countPicker}>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                        <Pressable key={num} onPress={() => { setDiceCount(num); setDiceResults(Array(num).fill(1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={{ flex: 1 }}>
                            <NeuTrench color={diceCount === num ? "rgba(0, 245, 160, 0.1)" : "rgba(255,255,255,0.03)"} borderRadius={12} padding={8} style={[styles.countTrench, diceCount === num ? styles.activeTrench : {}]}>
                            <Text style={[styles.countBtnText, diceCount === num && { color: "#00F5A0" }]}>{num}</Text>
                            </NeuTrench>
                        </Pressable>
                        ))}
                    </View>
                    <BrandButton 
                      onPress={rollDice} 
                      disabled={isRolling} 
                      color="#00F5A0" 
                      highlight="#54FFC9"
                      shadow="#00D289"
                      glowColor="rgba(0, 245, 160, 0.4)"
                      style={styles.actionBtn}
                    >
                        <View style={styles.brandBtnContent}>
                          <Feather name="refresh-cw" size={18} color="#1A0533" />
                          <Text style={[styles.brandBtnText, { color: '#1A0533' }]}>{isRolling ? "ROLLING..." : "ROLL DICE"}</Text>
                        </View>
                    </BrandButton>
                </View>
            </View>
          </View>
        );
      
      case 'first':
        return (
          <View style={styles.tabContent}>
             <View style={styles.toolMain}>
                <View style={[styles.tableArea, { transform: [{ scale: 1.1 }] }]}>
                    {players.map((p, i) => {
                        const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
                        const x = Math.cos(angle) * 110;
                        const y = Math.sin(angle) * 110;
                        const initial = getInitial(p.name, players.map(pl => pl.name));
                        return (
                            <View key={p.id} style={[styles.avatar, { transform: [{ translateX: x }, { translateY: y }] }, winnerIdx === i && styles.winnerAvatar]}>
                                <WinnerAvatar player={p} isWinner={winnerIdx === i} initial={initial} />
                                <Text style={[styles.avatarName, winnerIdx === i && { color: '#FFF' }]} numberOfLines={1}>{p.name}</Text>
                            </View>
                        );
                    })}
                    <Animated.View style={[styles.bottleWrapper, animatedSpinStyle]}>
                        <MaterialCommunityIcons name="bottle-wine" size={110} color="#FF2D78" style={styles.spinBottleIcon} />
                    </Animated.View>
                </View>

                <View style={styles.bottleSpinControls}>
                    {winnerIdx !== null ? (
                        <View style={styles.pickedResultFixed}>
                            <Text style={styles.wonLabel}>GOES FIRST!</Text>
                            <Text style={styles.pickedName}>{players[winnerIdx]?.name}</Text>
                        </View>
                    ) : (
                        <View style={{ height: 60 }} />
                    )}

                    <BrandButton 
                        onPress={spinBottle} 
                        disabled={isSpinning || players.length < 2} 
                        color="#00F5A0" 
                        highlight="#54FFC9"
                        shadow="#00D289"
                        glowColor="rgba(0, 245, 160, 0.4)"
                        style={styles.actionBtn}
                    >
                        <View style={styles.brandBtnContent}>
                          <Feather name="refresh-cw" size={18} color="#1A0533" />
                          <Text style={[styles.brandBtnText, { color: '#1A0533' }]}>{isSpinning ? "SPINNING..." : "SPIN THE BOTTLE"}</Text>
                        </View>
                    </BrandButton>
                </View>
             </View>
          </View>
        );

      case "seating":
        return (
          <View style={styles.tabContent}>
             <View style={styles.toolMain}>
                <View style={[styles.tableArea, { transform: [{ scale: 1.1 }] }]}>
                    <View style={styles.tableWood}>
                        <View style={styles.tableInnerRing} />
                        <Text style={styles.woodText}>TABLE</Text>
                    </View>
                    {players.map((p, i) => {
                        const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
                        const x = Math.cos(angle) * 115;
                        const y = Math.sin(angle) * 115;
                        const initial = getInitial(p.name, players.map(pl => pl.name));
                        return (
                            <SeatItem key={p.id} player={p} x={x} y={y} initial={initial} />
                        );
                    })}
                </View>
                <BrandButton 
                  onPress={() => {
                    const shuffled = [...players].sort(() => Math.random() - 0.5);
                    setPlayers(shuffled);
                    if (onShuffleSeating) onShuffleSeating(shuffled);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }} 
                  color="#00F5A0" 
                  highlight="#54FFC9"
                  shadow="#00D289"
                  glowColor="rgba(0, 245, 160, 0.4)"
                  style={styles.actionBtn}
                >
                    <View style={styles.brandBtnContent}>
                      <Feather name="users" size={18} color="#1A0533" />
                      <Text style={[styles.brandBtnText, { color: '#1A0533' }]}>SHUFFLE SEATS</Text>
                    </View>
                </BrandButton>
             </View>
          </View>
        );

      case "timer":
        return (
          <View style={styles.tabContent}>
             <View style={styles.timerMain}>
                <View style={styles.timerDisplayArea}>
                    <View style={styles.timerRow}>
                        <View style={styles.timerSideControls}>
                            <Pressable onPress={() => { setTimeLeft(Math.max(0, timeLeft - 10)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
                                <Text style={styles.adjustText}>-10s</Text>
                            </Pressable>
                            <Pressable onPress={() => { setTimeLeft(Math.max(0, timeLeft - 1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
                                <Text style={styles.adjustText}>-1s</Text>
                            </Pressable>
                        </View>

                        <NeuTrench color="#150428" borderRadius={30} padding={0} style={styles.timerDisplay}>
                            <View style={styles.timerDigitsWrapper}>
                                <Text style={[styles.timerDigits, timeLeft < 10 && { color: "#FF2D78" }]}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </Text>
                            </View>
                        </NeuTrench>

                        <View style={styles.timerSideControls}>
                            <Pressable onPress={() => { setTimeLeft(timeLeft + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
                                <Text style={styles.adjustText}>+1s</Text>
                            </Pressable>
                            <Pressable onPress={() => { setTimeLeft(timeLeft + 10); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
                                <Text style={styles.adjustText}>+10s</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Text style={styles.timerSubText}>REMAINING</Text>
                </View>

                <View style={styles.timerControls}>
                    <View style={styles.timerPresets}>
                        {[30, 60, 300, 600].map(s => (
                            <Pressable key={s} onPress={() => startTimer(s)} style={{ flex: 1 }}>
                                <NeuTrench color="rgba(255,255,255,0.05)" padding={12} borderRadius={12} style={styles.presetTrench}>
                                    <Text style={styles.presetText}>{s < 60 ? `${s}s` : `${s/60}m`}</Text>
                                </NeuTrench>
                            </Pressable>
                        ))}
                    </View>
                    <BrandButton 
                        onPress={() => setIsTimerRunning(!isTimerRunning)} 
                        color={isTimerRunning ? "rgba(255,255,255,0.15)" : "#00F5A0"} 
                        highlight={isTimerRunning ? "rgba(255,255,255,0.2)" : "#54FFC9"}
                        shadow={isTimerRunning ? "rgba(0,0,0,0.3)" : "#00D289"}
                        glowColor={isTimerRunning ? "rgba(0,0,0,0.2)" : "rgba(0, 245, 160, 0.4)"}
                        style={styles.actionBtn}
                    >
                        <View style={styles.brandBtnContent}>
                          <Feather name={isTimerRunning ? "pause" : "play"} size={18} color={isTimerRunning ? "#FFFFFF" : "#1A0533"} />
                          <Text style={[styles.brandBtnText, { color: isTimerRunning ? "#FFFFFF" : "#1A0533" }]}>{isTimerRunning ? "PAUSE" : (timeLeft < initialTime ? "RESUME" : "START TIMER")}</Text>
                        </View>
                    </BrandButton>
                </View>
             </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderTabHeader()}

      {showPlayerInput && (activeTab === "first" || activeTab === "seating") && (
         <View style={styles.inputArea}>
            <View style={styles.playerInputRow}>
                <NeuTrench color="rgba(0,0,0,0.2)" borderRadius={16} padding={0} style={styles.nameTrench}>
                    <TextInput 
                      style={styles.nameInput} 
                      value={newName} 
                      onChangeText={setNewName} 
                      placeholder="Add Player..." 
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      onSubmitEditing={addPlayerManual}
                    />
                </NeuTrench>
                <Pressable onPress={addPlayerManual}>
                    <NeuIconWell color="rgba(0,245,160,0.1)" size={48} borderRadius={14}>
                        <Feather name="plus" size={24} color="#00F5A0" />
                    </NeuIconWell>
                </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerChips}>
                {players.map((p) => (
                    <Pressable key={p.id} onPress={() => removePlayerManual(p.id)} style={styles.chip}>
                        <Text style={styles.chipText}>{p.name}</Text>
                        <Feather name="x" size={12} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                ))}
            </ScrollView>
         </View>
      )}

      <View style={styles.main}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { marginBottom: 32 },
  tabRow: { flexDirection: "row", gap: 10 },
  tabOptionShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  tabOptionClay: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, overflow: "hidden", position: "relative",
  },
  tabGloss: {
    position: "absolute", top: 2, left: 4, width: "40%", height: "50%",
    backgroundColor: "rgba(255,255,255,0.25)", borderBottomRightRadius: 20,
  },
  tabOptionNeu: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  tabTextActive: { fontFamily: "Bungee_400Regular", fontSize: 11, color: "#1A0533", paddingTop: 2 },
  tabTextInactive: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  main: { flex: 1 },
  tabContent: { flex: 1, paddingBottom: 10 },
  tabContentCentered: { flex: 1, justifyContent: "center", paddingHorizontal: 10, paddingBottom: 20 },
  // DICE STYLES
  diceGroup: { gap: 32, alignItems: 'center', justifyContent: 'center' },
  diceArea: { alignItems: "center", justifyContent: "center" },
  diceLayout: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 20, width: "100%" },
  diceClassicShadow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  diceClassicBody: {
    width: DICE_SIZE, height: DICE_SIZE, borderRadius: 20, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
  },
  diceClassicGloss: {
    position: "absolute", top: 0, left: 0, right: 0, height: "40%",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  diceGrid: { width: "100%", height: "100%", flexDirection: "row", flexWrap: "wrap", padding: 10 },
  dotCell: { width: "33.33%", height: "33.33%", alignItems: "center", justifyContent: "center" },
  dotClassic: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#1A0533", opacity: 0.9 },
  totalBadge: { marginTop: 10, alignItems: "center" },
  totalLabel: { fontFamily: "Bungee_400Regular", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 3, marginTop: 2 },
  totalValue: { fontFamily: "Bungee_400Regular", fontSize: 50, color: "#FFF" },
  // FIRST PLAYER / SPIN BOTTLE
  toolMain: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingBottom: 20, paddingTop: 80 },
  tableArea: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatar: { position: 'absolute', alignItems: 'center', width: 60 },
  avatarBody: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, position: 'relative' },
  avatarText: { color: '#FFF', fontFamily: 'Bungee_400Regular', fontSize: 18, zIndex: 2 },
  avatarName: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter_700Bold', marginTop: 6, width: 60, textAlign: 'center' },
  winnerAvatar: { },
  winnerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 24, opacity: 0.4, transform: [{ scale: 1.3 }], zIndex: -1 },
  bottleWrapper: { position: 'absolute', width: 140, height: 140, alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  spinBottleIcon: { textShadowColor: 'rgba(255,45,120,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  bottleSpinControls: { width: '100%', gap: 20, marginTop: 40 },
  pickedResultFixed: { alignItems: 'center' },
  wonLabel: { fontFamily: 'Bungee_400Regular', fontSize: 12, color: '#FF2D78', letterSpacing: 4, marginBottom: 8 },
  pickedName: { fontFamily: 'Bungee_400Regular', fontSize: 36, color: '#FFF' },
  // SEATING STYLES
  tableWood: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,184,0,0.05)', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255,184,0,0.2)' },
  tableInnerRing: { ...StyleSheet.absoluteFillObject, margin: 15, borderRadius: 80, borderStyle: 'dotted', borderWidth: 1, borderColor: 'rgba(255,184,0,0.1)' },
  woodText: { fontFamily: 'Bungee_400Regular', fontSize: 14, color: 'rgba(255,184,0,0.3)', letterSpacing: 4 },
  seat: { position: 'absolute', alignItems: 'center' },
  seatBody: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  seatText: { color: '#FFF', fontFamily: 'Bungee_400Regular', fontSize: 14 },
  // TIMER STYLES
  timerMain: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 },
  timerDisplayArea: { alignItems: 'center', justifyContent: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' },
  timerSideControls: { flexDirection: 'row', gap: 6, width: 90, justifyContent: 'center' },
  adjustBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  adjustText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_700Bold', fontSize: 10 },
  timerDisplay: { width: 170, height: 86, justifyContent: 'center', alignItems: 'center' },
  timerDigitsWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerDigits: { fontFamily: 'Bungee_400Regular', fontSize: 44, color: '#FFF', letterSpacing: -1, textAlign: 'center', textShadowColor: 'rgba(255,255,255,0.1)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10, lineHeight: 52 },
  timerSubText: { fontFamily: 'Bungee_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 5, marginTop: 15 },
  timerControls: { width: '100%', gap: 20 },
  timerPresets: { flexDirection: 'row', gap: 10 },
  presetTrench: { height: 50, alignItems: 'center', justifyContent: 'center' },
  presetText: { color: '#FFF', fontFamily: 'Bungee_400Regular', fontSize: 15 },
  // COMMON STYLES
  toolControls: { gap: 16, width: '100%' },
  toolControlLabel: { fontFamily: "Bungee_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  countPicker: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  countTrench: { alignItems: 'center', justifyContent: 'center', height: 48 },
  activeTrench: { borderColor: "#00F5A0", borderWidth: 1.5 },
  countBtnText: { fontFamily: "Bungee_400Regular", fontSize: 18, color: "rgba(255,255,255,0.2)" },
  actionBtn: { height: 60 },
  brandBtnContent: { flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "center" },
  brandBtnText: { fontFamily: "Bungee_400Regular", fontSize: 16, color: "#FFFFFF", letterSpacing: 2, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, paddingTop: 4 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnText: { fontFamily: "Bungee_400Regular", fontSize: 16, color: "#1A0533" },
  inputArea: { marginBottom: 16 },
  playerInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  nameTrench: { flex: 1, height: 48 },
  nameInput: { flex: 1, paddingHorizontal: 16, color: '#FFF', fontFamily: 'Inter_600SemiBold' },
  playerChips: { flexDirection: 'row', marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 8, marginRight: 8 },
  chipText: { color: '#FFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
