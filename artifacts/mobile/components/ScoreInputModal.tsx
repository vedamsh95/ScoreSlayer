import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { PolymerCard, NeuTrench, NeuButton, NeuIconWell } from "./PolymerCard";

// Game Calculators
import { SkyjoCalculator } from "./game_calculators/SkyjoCalculator";
import { CornholeCalculator } from "./game_calculators/CornholeCalculator";
import { UnoCalculator } from "./game_calculators/UnoCalculator";
import { Phase10Calculator } from "./game_calculators/Phase10Calculator";
import { SpadesCalculator } from "./game_calculators/SpadesCalculator";
import { HeartsCalculator } from "./game_calculators/HeartsCalculator";
import { SevenWondersCalculator } from "./game_calculators/SevenWondersCalculator";
import { RummyCalculator } from "./game_calculators/RummyCalculator";
import { GinRummyCalculator } from "./game_calculators/GinRummyCalculator";
import { GolfCalculator } from "./game_calculators/GolfCalculator";
import { CatanCalculator } from "./game_calculators/CatanCalculator";
import { CarcassonneCalculator } from "./game_calculators/CarcassonneCalculator";
import { BilliardsCalculator } from "./game_calculators/BilliardsCalculator";
import { HandAndFootCalculator } from "./game_calculators/HandAndFootCalculator";
import { SkipBoCalculator } from "./game_calculators/SkipBoCalculator";
import { DutchBlitzCalculator } from "./game_calculators/DutchBlitzCalculator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ScoreInputModalProps {
  visible: boolean;
  players: Player[];
  game: GameDefinition;
  round: number;
  initialLogs?: Record<string, number[]>;
  initialCleared?: Record<string, boolean>;
  initialBids?: Record<string, number>;
  initialTricksWon?: Record<string, number>;
  onSubmit: (
    scores: Record<string, number>,
    logs: Record<string, number[]>,
    cleared: Record<string, boolean>,
    bids?: Record<string, number>,
    tricksWon?: Record<string, number>,
    metadata?: Record<string, any>
  ) => void;
  onClose: () => void;
  isEditing?: boolean;
}

export function ScoreInputModal({
  visible,
  players,
  game,
  round,
  initialLogs,
  initialCleared,
  initialBids,
  initialTricksWon,
  onSubmit,
  onClose,
  isEditing = false,
}: ScoreInputModalProps) {
  const insets = useSafeAreaInsets();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  
  // Animation State
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

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

  // Unified Session State for the Modal
  const [allLogs, setAllLogs] = useState<Record<string, any[]>>({});
  const [allCleared, setAllCleared] = useState<Record<string, boolean>>({});
  const [allScores, setAllScores] = useState<Record<string, number>>({});
  const [allBids, setAllBids] = useState<Record<string, number>>({});
  const [allTricksWon, setAllTricksWon] = useState<Record<string, number>>({});
  const [allMetadata, setAllMetadata] = useState<Record<string, any>>({});
  const [resetCounters, setResetCounters] = useState<Record<string, number>>({});

  // Initialize state when initial values change or modal opens
  useEffect(() => {
    if (visible) {
      setAllLogs(initialLogs || {});
      setAllCleared(initialCleared || {});
      setAllBids(initialBids || {});
      setAllTricksWon(initialTricksWon || {});
      
      const scores: Record<string, number> = {};
      if (initialLogs) {
        Object.keys(initialLogs).forEach(pid => {
          scores[pid] = (initialLogs[pid] || []).reduce((a, b: number) => a + b, 0);
        });
      }
      setAllScores(scores);
    }
  }, [visible, initialLogs, initialCleared, initialBids, initialTricksWon]);

  const activePlayer = players[activePlayerIndex];

  const handleUpdate = useCallback((score: number, logs: any[], extra?: any) => {
    setAllScores(prev => ({ ...prev, [activePlayer.id]: score }));
    setAllLogs(prev => ({ ...prev, [activePlayer.id]: logs }));
    
    if (extra) {
      if (extra.cleared !== undefined) setAllCleared(prev => ({ ...prev, [activePlayer.id]: extra.cleared }));
      if (extra.bid !== undefined) setAllBids(prev => ({ ...prev, [activePlayer.id]: extra.bid }));
      if (extra.won !== undefined) setAllTricksWon(prev => ({ ...prev, [activePlayer.id]: extra.won }));
      setAllMetadata(prev => ({ ...prev, [activePlayer.id]: extra }));
    }
  }, [activePlayer.id]);

  const handleSubmit = useCallback(() => {
    onSubmit(allScores, allLogs, allCleared, allBids, allTricksWon, allMetadata);
    handleDismiss();
  }, [allScores, allLogs, allCleared, allBids, allTricksWon, allMetadata, onSubmit, handleDismiss]);

  const handleReset = useCallback(() => {
    Alert.alert(
      "Reset Scores?",
      `This will clear all entries for ${activePlayer.name} in this round.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setResetCounters(prev => ({ ...prev, [activePlayer.id]: (prev[activePlayer.id] || 0) + 1 }));
            setAllScores(prev => ({ ...prev, [activePlayer.id]: 0 }));
            setAllLogs(prev => ({ ...prev, [activePlayer.id]: [] }));
            setAllCleared(prev => ({ ...prev, [activePlayer.id]: false }));
            setAllMetadata(prev => ({ ...prev, [activePlayer.id]: {} }));
          }
        }
      ]
    );
  }, [activePlayer.id, activePlayer.name]);

  const renderCalculator = () => {
    const common = {
      player: activePlayer,
      game: game,
      onUpdate: handleUpdate
    };

    const calcKey = activePlayer.id + (resetCounters[activePlayer.id] || 0);

    if (game.id === "skyjo") {
      return <SkyjoCalculator key={calcKey} {...common} initialGrid={allLogs[activePlayer.id]} />;
    }
    if (game.parentId === "phase10" || game.id.includes("phase10")) {
      return (
        <Phase10Calculator 
          key={calcKey}
          {...common} 
          initialPhase={allMetadata[activePlayer.id]?.phase} 
          initialLogs={allLogs[activePlayer.id]} 
          initialCleared={allCleared[activePlayer.id]} 
        />
      );
    }
    if (game.id === "golf") {
      return <GolfCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "uno" || game.parentId === "uno") {
      return <UnoCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "cornhole") {
      return <CornholeCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]} />;
    }
    if (game.parentId === "spades" || game.id.startsWith("spades")) {
      return <SpadesCalculator key={calcKey} {...common} initialBid={allBids[activePlayer.id]} initialWon={allTricksWon[activePlayer.id]} />;
    }
    if (game.parentId === "hearts" || game.id.startsWith("hearts")) {
      return <HeartsCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "seven_wonders") {
      return <SevenWondersCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} initialScience={allMetadata[activePlayer.id]?.science} />;
    }
    if (game.id === "catan") {
      return <CatanCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} />;
    }
    if (game.id === "carcassonne") {
      return <CarcassonneCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} />;
    }
    if (game.id === "billiards") {
      return <BilliardsCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "hand_and_foot") {
      return <HandAndFootCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} />;
    }
    if (game.id === "skip_bo") {
      return <SkipBoCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} />;
    }
    if (game.id === "dutch_blitz") {
      return <DutchBlitzCalculator key={calcKey} {...common} initialStats={allMetadata[activePlayer.id]?.stats} />;
    }
    if (game.parentId === "rummy" || game.id.includes("rummy")) {
      if (game.id === "rummy_gin") {
        return <GinRummyCalculator key={calcKey} {...common} />;
      }
      return <RummyCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }

    // Default to Uno Style for now as a fallback
    return <UnoCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
  };

  return (
    <Modal 
      visible={visible} 
      animationType="none" 
      transparent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
          </Animated.View>

          <Animated.View 
            style={[styles.sheet, animatedStyle]}
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
                
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.title}>{isEditing ? "Edit Round" : `Round ${round}`}</Text>
                    <Text style={styles.subtitle}>Enter cards for {activePlayer.name}</Text>
                  </View>
                  <View style={styles.headerActions}>
                    <NeuButton 
                      size={40} 
                      borderRadius={12} 
                      color="#150428" 
                      onPress={handleReset}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF4757" />
                    </NeuButton>
                    
                    <NeuButton 
                      size={40} 
                      borderRadius={12} 
                      color="#150428" 
                      onPress={handleDismiss}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                    </NeuButton>
                  </View>
                </View>
              </View>
            </GestureDetector>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.playerStrip}
                contentContainerStyle={styles.playerStripContent}
              >
                {players.map((p, i) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setActivePlayerIndex(i);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.playerTabWrapper}
                  >
                    <NeuTrench 
                      color={activePlayerIndex === i ? p.color + "20" : "#150428"} 
                      borderRadius={16} 
                      padding={10}
                      style={[
                        styles.playerTab,
                        activePlayerIndex === i ? { borderColor: p.color + "40", borderWidth: 1 } : {}
                      ]}
                    >
                      <View style={[styles.tabDot, { backgroundColor: p.color }]} />
                      <Text style={[styles.tabText, activePlayerIndex === i && { color: "#FFF" }]}>{p.name}</Text>
                      {allScores[p.id] !== undefined && (
                        <Text style={[styles.tabScore, { color: p.color }]}>{allScores[p.id]}</Text>
                      )}
                    </NeuTrench>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.calcArea}>
                {renderCalculator()}
              </View>

              <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
                <NeuButton
                  borderRadius={20}
                  onPress={() => {
                    if (activePlayerIndex < players.length - 1) {
                      setActivePlayerIndex(idx => idx + 1);
                    } else {
                      handleSubmit();
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  color={activePlayerIndex < players.length - 1 ? "rgba(255,255,255,0.08)" : "#00F5A0"}
                  style={{ flex: 1, height: 60 }}
                >
                  <View style={styles.footerBtnInner}>
                    <Text style={[
                      styles.footerBtnText, 
                      { color: activePlayerIndex < players.length - 1 ? "#FFF" : "#1A0533" }
                    ]}>
                      {activePlayerIndex < players.length - 1 ? "NEXT PLAYER" : (isEditing ? "SAVE CHANGES" : "SUBMIT ALL")}
                    </Text>
                    <Ionicons 
                      name={activePlayerIndex < players.length - 1 ? "arrow-forward" : "checkmark-circle"} 
                      size={20} 
                      color={activePlayerIndex < players.length - 1 ? "rgba(255,255,255,0.5)" : "#1A0533"} 
                    />
                  </View>
                </NeuButton>
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
  sheet: { 
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
  grabBarContainer: { 
    width: "100%", 
    height: 32, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  grabBar: { 
    width: 44, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: "rgba(255,255,255,0.15)" 
  },
  sheetHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    paddingHorizontal: 24, 
    paddingBottom: 20
  },
  gestureHeader: {
    backgroundColor: "transparent",
    paddingTop: 8,
  },
  title: { 
    fontFamily: "Inter_900Black", 
    fontSize: 24, 
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 13, 
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  headerActions: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  playerStrip: { 
    flexGrow: 0, 
    marginBottom: 20 
  },
  playerStripContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  playerTabWrapper: {
    minWidth: 100,
  },
  playerTab: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
  },
  tabDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 10 
  },
  tabText: { 
    fontFamily: "Inter_800ExtraBold", 
    fontSize: 14, 
    color: "rgba(255,255,255,0.4)" 
  },
  tabScore: { 
    fontFamily: "Inter_900Black", 
    fontSize: 12, 
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 6,
  },
  calcArea: { 
    paddingHorizontal: 20, 
    flex: 1 
  },
  footer: { 
    paddingHorizontal: 20, 
    paddingTop: 16 
  },
  footerBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  footerBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    letterSpacing: 1.5,
  },
});
