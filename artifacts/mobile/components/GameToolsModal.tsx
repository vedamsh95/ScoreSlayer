import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Player } from "@/context/GameContext";
import { PolymerButton } from "./PolymerButton";
import { NeuIconWell, NeuTrench, PolymerCard } from "./PolymerCard";
import { UnifiedToolsCore } from "./UnifiedToolsCore";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface GameToolsModalProps {
  visible: boolean;
  players: Player[];
  onShuffle: (newPlayers: Player[]) => void;
  onClose: () => void;
}

export function GameToolsModal({ visible, players, onShuffle, onClose }: GameToolsModalProps) {
  const insets = useSafeAreaInsets();

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

  const gesture = useMemo(() => Gesture.Pan()
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

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleDismiss}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
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

              <View style={styles.content}>
                <UnifiedToolsCore 
                  initialPlayers={players.map(p => ({ id: p.id, name: p.name, color: p.color }))}
                  onShuffleSeating={(shuffled: any[]) => onShuffle(shuffled.map(s => players.find(p => p.id === s.id)!))}
                />
              </View>
            </PolymerCard>
          </Animated.View>
        </GestureDetector>
      </View>
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
  gestureHeader: {
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
