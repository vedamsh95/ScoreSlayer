import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  Keyboard,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView, Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Player } from "@/context/GameContext";
import { GameDefinition } from "@/constants/games";
import { PolymerCard, NeuTrench, NeuButton, BrandButton, NeuIconWell, PolymerAlert } from "./PolymerCard";

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
import { GeneralCalculator } from "./game_calculators/GeneralCalculator";
import { FiveCrownsCalculator } from "./game_calculators/FiveCrownsCalculator";
import { MoelkkyCalculator } from "./game_calculators/MoelkkyCalculator";
import { SkullKingCalculator } from "./game_calculators/SkullKingCalculator";
import { WizardCalculator } from "./game_calculators/WizardCalculator";
import { OhHellCalculator } from "./game_calculators/OhHellCalculator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ScoreInputModalProps {
  visible: boolean;
  players: Player[];
  game: GameDefinition;
  roundNumber: number;
  initialLogs?: Record<string, number[]>;
  initialCleared?: Record<string, boolean>;
  initialBids?: Record<string, number>;
  initialTricksWon?: Record<string, number>;
  initialMetadata?: Record<string, any>;
  initialScores?: Record<string, number>;
  customScoreRules?: any[];
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
  roundNumber,
  initialLogs,
  initialCleared,
  initialBids,
  initialTricksWon,
  initialMetadata,
  initialScores,
  customScoreRules,
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
    Keyboard.dismiss();
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  }, [onClose]);

  const gesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
      backdropOpacity.value = interpolate(translateY.value, [0, 400], [1, 0], 'clamp');
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationY > 150 || event.velocityY > 500) {
        backdropOpacity.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
          'worklet';
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    }), [onClose, SCREEN_HEIGHT]);

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
  const [showResetAlert, setShowResetAlert] = useState(false);

  const [showNoWinnerConfirm, setShowNoWinnerConfirm] = useState(false);
  const [showConflictAlert, setShowConflictAlert] = useState<{ name: string } | null>(null);

  // Initialize state when initial values change or modal opens
  useEffect(() => {
    if (visible) {
      if (!isEditing) {
        setActivePlayerIndex(0);
      }
      
      setAllLogs(initialLogs || {});
      setAllCleared(initialCleared || {});
      setAllBids(initialBids || {});
      setAllTricksWon(initialTricksWon || {});
      setAllMetadata(initialMetadata || {});
      
      const scores: Record<string, number> = {};
      if (initialScores) {
        Object.assign(scores, initialScores);
      } else if (initialLogs) {
        Object.keys(initialLogs).forEach(pid => {
          scores[pid] = (initialLogs[pid] || []).reduce((a, b: number) => a + b, 0);
        });
      }
      setAllScores(scores);
    }
  }, [visible, isEditing, initialLogs, initialCleared, initialBids, initialTricksWon, initialMetadata, initialScores]);

  const activePlayer = players[activePlayerIndex];

  const alreadyDeclaredPlayerName = useMemo(() => {
    // Phase 10 allows multiple players to complete phases in one round
    const isPhase10 = game.id.startsWith("phase10") || game.parentId === "phase10";
    if (isPhase10) return null;

    const isWinnerGame = game.parentId === "rummy" || game.parentId === "uno" || game.id === "uno" || game.id.includes("rummy");
    if (!isWinnerGame) return null;
    const otherWinner = players.find(p => p.id !== activePlayer.id && allCleared[p.id]);
    return otherWinner ? otherWinner.name : null;
  }, [game.id, game.parentId, players, activePlayer.id, allCleared]);

  const handleUpdate = useCallback((score: number, logs: any[], extra?: any) => {
    setAllScores(prev => ({ ...prev, [activePlayer.id]: score }));
    setAllLogs(prev => ({ ...prev, [activePlayer.id]: logs }));
    
    if (extra) {
      if (extra.cleared !== undefined) {
        // If trying to declare but someone else already did, show conflict
        if (extra.cleared && alreadyDeclaredPlayerName) {
          setShowConflictAlert({ name: alreadyDeclaredPlayerName });
          return;
        }
        setAllCleared(prev => ({ ...prev, [activePlayer.id]: extra.cleared }));
      }
      if (extra.bid !== undefined) setAllBids(prev => ({ ...prev, [activePlayer.id]: extra.bid }));
      if (extra.won !== undefined) setAllTricksWon(prev => ({ ...prev, [activePlayer.id]: extra.won }));
      setAllMetadata(prev => ({ ...prev, [activePlayer.id]: extra }));
    }
  }, [activePlayer.id, alreadyDeclaredPlayerName]);

  const handleSubmit = useCallback(() => {
    const isWinnerGame = game.parentId === "rummy" || game.parentId === "uno" || game.id.startsWith("phase10") || game.id === "uno" || game.id.includes("rummy");
    const hasWinner = Object.values(allCleared).some(v => v === true);

    if (isWinnerGame && !hasWinner) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowNoWinnerConfirm(true);
      return;
    }

    onSubmit(allScores, allLogs, allCleared, allBids, allTricksWon, allMetadata);
    handleDismiss();
  }, [allScores, allLogs, allCleared, allBids, allTricksWon, allMetadata, onSubmit, handleDismiss, game]);

  const confirmSubmit = () => {
    setShowNoWinnerConfirm(false);
    onSubmit(allScores, allLogs, allCleared, allBids, allTricksWon, allMetadata);
    handleDismiss();
  };

  const handleReset = useCallback(() => {
    setShowResetAlert(true);
  }, []);

  const confirmReset = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResetCounters(prev => ({ ...prev, [activePlayer.id]: (prev[activePlayer.id] || 0) + 1 }));
    setAllScores(prev => ({ ...prev, [activePlayer.id]: 0 }));
    setAllLogs(prev => ({ ...prev, [activePlayer.id]: [] }));
    setAllCleared(prev => ({ ...prev, [activePlayer.id]: false }));
    setAllMetadata(prev => ({ ...prev, [activePlayer.id]: {} }));
    setShowResetAlert(false);
  }, [activePlayer.id]);

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
    if (game.parentId === "phase10" || game.id.startsWith("phase10")) {
      return (
        <Phase10Calculator 
          key={calcKey}
          {...common} 
          customScoreRules={customScoreRules}
          initialPhase={allMetadata[activePlayer.id]?.phase} 
          initialLogs={allLogs[activePlayer.id]} 
          initialCleared={allCleared[activePlayer.id]} 
          alreadyDeclaredPlayerName={alreadyDeclaredPlayerName}
        />
      );
    }
    if (game.id === "golf") {
      return <GolfCalculator key={calcKey} {...common} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "uno" || game.parentId === "uno" || game.id.startsWith("uno")) {
      return (
        <UnoCalculator 
          key={calcKey} 
          {...common} 
          customScoreRules={customScoreRules} 
          initialLogs={allLogs[activePlayer.id]} 
          initialMetadata={allMetadata[activePlayer.id]}
          alreadyDeclaredPlayerName={alreadyDeclaredPlayerName}
        />
      );
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
    if (game.id === "custom_game") {
      return (
        <GeneralCalculator 
          key={calcKey} 
          {...common} 
          customScoreRules={customScoreRules} 
          initialLogs={allLogs[activePlayer.id]} 
          initialMetadata={allMetadata[activePlayer.id]}
        />
      );
    }
    if (game.id === "five_crowns") {
      return <FiveCrownsCalculator key={calcKey} {...common} round={roundNumber} initialLogs={allLogs[activePlayer.id]} />;
    }
    if (game.id === "moelkky") {
      return <MoelkkyCalculator key={calcKey} {...common} initialScore={allScores[activePlayer.id]} />;
    }
    if (game.id === "skull_king") {
      return <SkullKingCalculator key={calcKey} {...common} round={roundNumber} initialBid={allBids[activePlayer.id]} initialWon={allTricksWon[activePlayer.id]} />;
    }
    if (game.id === "wizard") {
      return <WizardCalculator key={calcKey} {...common} round={roundNumber} initialBid={allBids[activePlayer.id]} initialWon={allTricksWon[activePlayer.id]} />;
    }
    if (game.id === "oh_hell") {
      return <OhHellCalculator key={calcKey} {...common} initialBid={allBids[activePlayer.id]} initialWon={allTricksWon[activePlayer.id]} />;
    }
    if (game.parentId === "rummy" || game.id.includes("rummy")) {
      if (game.id === "rummy_gin") {
        return (
          <GinRummyCalculator 
            key={calcKey} 
            {...common} 
            initialMetadata={allMetadata[activePlayer.id]}
            alreadyDeclaredPlayerName={alreadyDeclaredPlayerName}
          />
        );
      }
      return (
        <RummyCalculator 
          key={calcKey} 
          {...common} 
          initialLogs={allLogs[activePlayer.id]} 
          initialMetadata={allMetadata[activePlayer.id]}
          alreadyDeclaredPlayerName={alreadyDeclaredPlayerName}
        />
      );
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={styles.overlay} behavior="padding">
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
          </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }, animatedStyle]}>
            <PolymerCard 
              color="#1A0533" 
              borderRadius={32} 
              padding={0} 
              style={styles.sheetContent}
            >
              <View style={styles.gestureHeader}>
                <View style={styles.grabBarContainer}>
                  <View style={styles.grabBar} />
                </View>
                
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.title}>{isEditing ? `Edit Round ${roundNumber}` : `Round ${roundNumber}`}</Text>
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
                      color={activePlayerIndex === i ? p.color + "25" : "#1C0638"} 
                      borderRadius={16} 
                      padding={10} 
                      style={[
                        styles.playerTab,
                        activePlayerIndex === i ? { borderColor: p.color + "60", borderWidth: 1.5 } : { borderWidth: 1.5, borderColor: "transparent" }
                      ]}
                    >
                      <View style={styles.tabContent}>
                        <View style={[styles.tabDot, { backgroundColor: p.color }]} />
                        <Text style={[styles.tabText, activePlayerIndex === i ? { color: "#FFF" } : { color: "rgba(255,255,255,0.9)" }]}>{p.name}</Text>
                      </View>
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
                <BrandButton
                  onPress={() => {
                    if (activePlayerIndex < players.length - 1) {
                      setActivePlayerIndex(idx => idx + 1);
                    } else {
                      handleSubmit();
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  style={{ height: 62, width: "100%" }}
                >
                  <View style={styles.footerBtnInner}>
                    <Text style={styles.brandBtnText}>
                      {activePlayerIndex < players.length - 1 ? "NEXT PLAYER" : (isEditing ? "SAVE CHANGES" : "SUBMIT ALL")}
                    </Text>
                    <Ionicons 
                      name={activePlayerIndex < players.length - 1 ? "arrow-forward" : "checkmark-circle"} 
                      size={20} 
                      color="rgba(255,255,255,0.9)" 
                    />
                  </View>
                </BrandButton>
            </View>
            </PolymerCard>
          </Animated.View>
        </GestureDetector>
        </KeyboardAvoidingView>

      {/* Styled Alert: No Winner Declared */}
      <Modal visible={showNoWinnerConfirm} transparent animationType="fade">
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.alertOverlay}>
            <PolymerCard color="#150428" borderRadius={32} padding={24} style={styles.alertCard}>
              <View style={styles.alertIconWell}>
                <Ionicons name="trophy-outline" size={32} color="#FFB800" />
              </View>
              <Text style={styles.alertTitle}>NO WINNER DECLARED</Text>
              <Text style={styles.alertMessage}>
                It looks like no one has declared a win. In {game.name}, usually one person must declare per round.
              </Text>
              
              <View style={styles.alertActions}>
                <NeuButton 
                  onPress={() => setShowNoWinnerConfirm(false)} 
                  color="#150428" 
                  style={{ flex: 1, height: 50 }}
                >
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter_700Bold", fontSize: 14 }}>I FORGOT</Text>
                </NeuButton>
                <BrandButton 
                  onPress={confirmSubmit} 
                  style={{ flex: 1.2, height: 50 }}
                >
                  <Text style={styles.alertBtnText}>CONTINUE</Text>
                </BrandButton>
              </View>
            </PolymerCard>
          </View>
        </BlurView>
      </Modal>

      {/* Styled Alert: Winner Conflict */}
      <Modal visible={!!showConflictAlert} transparent animationType="fade">
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.alertOverlay}>
            <PolymerCard color="#150428" borderRadius={32} padding={24} style={styles.alertCard}>
              <View style={[styles.alertIconWell, { backgroundColor: "rgba(255,92,92,0.1)" }]}>
                <MaterialCommunityIcons name="alert-octagon" size={32} color="#FF5C5C" />
              </View>
              <Text style={styles.alertTitle}>ALREADY DECLARED</Text>
              <Text style={styles.alertMessage}>
                <Text style={{ color: "#FFF", fontWeight: "900" }}>{showConflictAlert?.name}</Text> has already declared a win for this round. Only one person can be the winner.
              </Text>
              
              <View style={styles.alertActions}>
                <BrandButton 
                  onPress={() => setShowConflictAlert(null)} 
                  style={{ flex: 1, height: 50 }}
                >
                  <Text style={styles.alertBtnText}>GOT IT</Text>
                </BrandButton>
              </View>
            </PolymerCard>
          </View>
        </BlurView>
      </Modal>

      <PolymerAlert
        visible={showResetAlert}
        title="Reset Scores?"
        message={`This will clear all entries for ${activePlayer.name} in this round.`}
        confirmText="Reset"
        type="danger"
        onConfirm={confirmReset}
        onCancel={() => setShowResetAlert(false)}
      />
      </GestureHandlerRootView>
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
    width: "100%",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    height: "94%",
  },
  sheetContent: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1.5,
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
    fontSize: 13, 
    color: "rgba(255,255,255,0.85)",
    flexShrink: 1,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    overflow: "hidden",
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
    paddingTop: 16,
    flexShrink: 0,
    width: "100%",
  },
  footerBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  brandBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 15,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Alert Styles
  alertOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  alertCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  alertIconWell: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,184,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  alertTitle: {
    fontFamily: "Bungee_400Regular",
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 12
  },
  alertMessage: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%"
  },
  alertBtnText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 14,
    color: "#FFF",
    paddingTop: 2
  }
});
