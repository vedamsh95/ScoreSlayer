import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { PolymerButton } from "./PolymerButton";
import { NeuIconWell, NeuTrench } from "./PolymerCard";

const { width } = Dimensions.get("window");

interface GameToolsModalProps {
  visible: boolean;
  players: Player[];
  onShuffle: (newPlayers: Player[]) => void;
  onClose: () => void;
}

export function GameToolsModal({ visible, players, onShuffle, onClose }: GameToolsModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"seating" | "first" | "timer">("seating");

  // --- Seating Randomizer State ---
  const [localPlayers, setLocalPlayers] = useState(players);
  const shuffleAnim = useRef(new Animated.Value(0)).current;

  // --- Who Goes First State ---
  const [spinning, setSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const handleShuffle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(shuffleAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1)) }),
      Animated.timing(shuffleAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();

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
    const finalAngle = randomSpins * 360;

    Animated.timing(spinAnim, {
      toValue: finalAngle,
      duration: 3500,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setSpinning(false);
      const totalDegrees = finalAngle % 360;
      const playerAngleStep = 360 / players.length;
      // Adjust winner calculation to match the visual pointing
      // The bottle points to (rotation - 0) degrees. 
      // Since players are at (i * 360 / N) - 90, 
      // and rotation is (angle + 90), it should match perfectly.
      const idx = Math.round(totalDegrees / playerAngleStep) % players.length;
      setWinnerIndex(idx);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  const renderSeating = () => {
    const radius = 100;
    const center = { x: (width - 40) / 2, y: 150 };

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
                  { left: x, top: y, backgroundColor: p.color, transform: [{ scale: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }
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
    const center = { x: (width - 48) / 2, y: 150 };
    const spin = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] });

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
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Game Night Tools</Text>
            <Pressable onPress={onClose}>
              <NeuIconWell color="#150428" size={36} borderRadius={12}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </NeuIconWell>
            </Pressable>
          </View>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#1A0533", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  title: { fontFamily: "Inter_900Black", fontSize: 24, color: "#FFF" },
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
