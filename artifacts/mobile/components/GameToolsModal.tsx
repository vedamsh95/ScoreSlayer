import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { PolymerButton } from "./PolymerButton";
import { NeuIconWell, NeuTrench, PolymerCard } from "./PolymerCard";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface GameToolsModalProps {
  visible: boolean;
  players: Player[];
  onShuffle: (newPlayers: Player[]) => void;
  onClose: () => void;
}

export function GameToolsModal({ visible, players, onShuffle, onClose }: GameToolsModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"seating" | "first" | "timer">("seating");

  // Animation State
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // --- Seating Randomizer State ---
  const [localPlayers, setLocalPlayers] = useState(players);
  const shuffleScale = useSharedValue(1);

  // --- Who Goes First State ---
  const [spinning, setSpinning] = useState(false);
  const spinRotation = useSharedValue(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setLocalPlayers(players);
  }, [players]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  }, [onClose]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
      backdropOpacity.value = interpolate(translateY.value, [0, 400], [1, 0], 'clamp');
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 500) {
        handleDismiss();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  // Entrance Animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 120 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const shuffleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shuffleScale.value }],
  }));

  const spinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value}deg` }],
  }));

  const startTimer = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerActive) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const handleShuffle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    shuffleScale.value = withSpring(1.2, { damping: 10, stiffness: 200 }, () => {
      shuffleScale.value = withSpring(1);
    });

    const shuffled = [...localPlayers].sort(() => Math.random() - 0.5);
    setLocalPlayers(shuffled);
    onShuffle(shuffled);
  };

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinnerIndex(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const randomSpins = 3 + Math.random() * 5;
    const finalAngle = spinRotation.value + (randomSpins * 360);

    spinRotation.value = withSpring(finalAngle, { damping: 40, stiffness: 80 }, (finished) => {
      if (finished) {
        runOnJS(setSpinning)(false);
        const totalDegrees = finalAngle % 360;
        const playerAngleStep = 360 / players.length;
        const idx = Math.round(totalDegrees / playerAngleStep) % players.length;
        runOnJS(setWinnerIndex)(idx);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      }
    });
  };

  const renderSeating = () => {
    const radius = 100;
    const center = { x: (SCREEN_WIDTH - 48) / 2, y: 150 };

    return (
      <View style={styles.seatingArea}>
        <View style={styles.circleContainer}>
          {localPlayers.map((p, i) => {
            const angle = (i * 360) / players.length - 90;
            const x = center.x + radius * Math.cos((angle * Math.PI) / 180) - 20;
            const y = center.y + radius * Math.sin((angle * Math.PI) / 180) - 20;

            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.playerAvatar,
                  { left: x, top: y, backgroundColor: p.color },
                  shuffleAnimatedStyle
                ]}
              >
                <Text style={styles.avatarText}>{p.name[0]}</Text>
              </Animated.View>
            );
          })}
          <View style={[styles.centerMark, { left: center.x - 2, top: center.y - 2 }]} />
        </View>
        <PolymerButton label="Randomize Seating" onPress={handleShuffle} color="#00F5A0" textColor="#1A0533" size="md" />
      </View>
    );
  };

  const renderWhoFirst = () => {
    const radius = 100;
    const center = { x: (SCREEN_WIDTH - 48) / 2, y: 150 };

    return (
      <View style={styles.seatingArea}>
        <View style={styles.circleContainer}>
          {players.map((p, i) => {
            const angle = (i * 360) / players.length - 90;
            const x = center.x + radius * Math.cos((angle * Math.PI) / 180) - 20;
            const y = center.y + radius * Math.sin((angle * Math.PI) / 180) - 20;

            return (
              <View
                key={p.id}
                style={[
                  styles.playerAvatar,
                  { left: x, top: y, backgroundColor: p.color },
                  winnerIndex === i && styles.winnerHighlight
                ]}
              >
                <Text style={styles.avatarText}>{p.name[0]}</Text>
              </View>
            );
          })}
          <View style={[styles.bottleWrapper, { left: center.x - 20, top: center.y - 45 }]}>
            <Animated.View style={spinAnimatedStyle}>
              <MaterialCommunityIcons name="bottle-wine" size={60} color="#FF2D78" />
            </Animated.View>
          </View>
        </View>
        <PolymerButton label={spinning ? "Spinning..." : "Spin the Bottle"} onPress={handleSpin} color="#FF2D78" textColor="#FFF" size="md" />
      </View>
    );
  };

  const renderTimer = () => {
    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const rs = s % 60;
      return `${m}:${rs < 10 ? "0" : ""}${rs}`;
    };

    return (
      <View style={styles.timerArea}>
        <View style={styles.timerRow}>
          <Pressable onPress={() => { setTimeLeft(Math.max(0, timeLeft - 10)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>-10s</Text>
          </Pressable>
          <Pressable onPress={() => { setTimeLeft(Math.max(0, timeLeft - 1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>-1s</Text>
          </Pressable>

          <NeuTrench color="#150428" borderRadius={25} padding={20} style={styles.timerDisplay}>
            <Text style={[styles.timerText, timeLeft < 10 && { color: "#FF2D78" }]}>{formatTime(timeLeft)}</Text>
          </NeuTrench>

          <Pressable onPress={() => { setTimeLeft(timeLeft + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>+1s</Text>
          </Pressable>
          <Pressable onPress={() => { setTimeLeft(timeLeft + 10); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>+10s</Text>
          </Pressable>
        </View>

        <View style={styles.presets}>
          {[30, 60, 120, 300].map(s => (
            <Pressable key={s} onPress={() => startTimer(s)} style={styles.presetChip}>
              <Text style={styles.presetText}>{s < 60 ? `${s}s` : `${s / 60}m`}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timerActions}>
          <PolymerButton 
            label={timerActive ? "Pause" : "Resume"} 
            onPress={() => setTimerActive(!timerActive)} 
            color="#00F5A0" 
            textColor="#1A0533" 
            size="md" 
            style={{ flex: 1 }}
          />
          <PolymerButton 
            label="Reset" 
            onPress={() => { setTimeLeft(60); setTimerActive(false); }} 
            color="rgba(255,255,255,0.1)" 
            textColor="#FFF" 
            size="md" 
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
          </Animated.View>

          <Animated.View 
            style={[styles.modalContent, animatedStyle]}
          >
            <PolymerCard 
              color="#1A0533" 
              borderRadius={32} 
              padding={0} 
              style={styles.sheetContent}
            >
              <GestureDetector gesture={gesture}>
                <View style={styles.gestureHeader}>
                  <View style={styles.grabBarContainer}>
                    <View style={styles.grabBar} />
                  </View>
                  
                  <View style={styles.header}>
                    <View>
                      <Text style={styles.title}>Game Night Tools</Text>
                      <Text style={styles.subtitle}>Handy utilities for the table</Text>
                    </View>
                    <Pressable onPress={handleDismiss}>
                      <NeuIconWell color="#150428" size={36} borderRadius={12}>
                        <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                      </NeuIconWell>
                    </Pressable>
                  </View>
                </View>
              </GestureDetector>

              <View style={styles.tabs}>
                {[
                  { id: "seating", label: "Seating", icon: "people" },
                  { id: "first", label: "Who First?", icon: "flash" },
                  { id: "timer", label: "Timer", icon: "timer" },
                ].map(tab => (
                  <Pressable
                    key={tab.id}
                    onPress={() => { setActiveTab(tab.id as any); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  >
                    <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? "#00F5A0" : "rgba(255,255,255,0.3)"} />
                    <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.content}>
                {activeTab === "seating" && renderSeating()}
                {activeTab === "first" && renderWhoFirst()}
                {activeTab === "timer" && renderTimer()}
              </View>
            </PolymerCard>
          </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: "flex-end" 
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    height: "94%",
    backgroundColor: "transparent",
  },
  sheetContent: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gestureHeader: {
    backgroundColor: "transparent",
    paddingTop: 8,
  },
  grabBarContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  grabBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    paddingHorizontal: 24, 
    paddingBottom: 20 
  },
  title: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
  subtitle: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  tabs: { flexDirection: "row", paddingHorizontal: 24, gap: 10, marginBottom: 24 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  tabActive: { backgroundColor: "rgba(0,245,160,0.1)", borderColor: "rgba(0,245,160,0.2)" },
  tabText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: "#00F5A0" },
  content: { paddingHorizontal: 24, minHeight: 400 },
  seatingArea: { alignItems: "center", justifyContent: "center" },
  circleContainer: { width: "100%", height: 300, position: "relative" },
  playerAvatar: { position: "absolute", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  avatarText: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF" },
  centerMark: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  winnerHighlight: { borderWidth: 3, borderColor: "#FFB000", shadowColor: "#FFB000", shadowOpacity: 1, shadowRadius: 10, elevation: 10 },
  bottleWrapper: { position: "absolute", width: 60, height: 90, alignItems: "center", justifyContent: "center" },
  timerArea: { alignItems: "center", gap: 24 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", justifyContent: "center" },
  timerDisplay: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center" },
  timerText: { fontFamily: "Inter_900Black", fontSize: 42, color: "#00F5A0" },
  adjustBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  adjustText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "rgba(255,255,255,0.4)" },
  presets: { flexDirection: "row", gap: 8 },
  presetChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)" },
  presetText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFF" },
  timerActions: { flexDirection: "row", gap: 12, width: "100%" },
});
