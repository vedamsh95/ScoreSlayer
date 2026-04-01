import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { PolymerCard, NeuTrench, BrandButton, NeuIconWell } from "./PolymerCard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddPlayerModalProps {
  visible: boolean;
  completedRounds: number;
  onClose: () => void;
  onAdd: (name: string, catchUpScore: number) => boolean;
}

export function AddPlayerModal({
  visible,
  completedRounds,
  onClose,
  onAdd,
}: AddPlayerModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [scoreText, setScoreText] = useState("0");
  const inputRef = useRef<TextInput>(null);

  // Animation State
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = React.useCallback(() => {
    Keyboard.dismiss();
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

  useEffect(() => {
    if (visible) {
      setName("");
      setScoreText("0");
      translateY.value = withSpring(0, { damping: 25, stiffness: 120 });
      backdropOpacity.value = withTiming(1, { duration: 300 });

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const handleAdd = () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const normalized = scoreText.replace(/,/g, "").replace(/\u2212/g, "-").trim();
    const parsed = parseFloat(normalized === "" ? "0" : normalized);
    const catchUp = Number.isFinite(parsed) ? parsed : 0;
    const ok = onAdd(trimmed, catchUp);
    if (!ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleDismiss();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="none" 
      transparent 
      onRequestClose={handleDismiss}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior="padding"
          keyboardVerticalOffset={12}
        >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
        </Animated.View>
        
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }, animatedStyle]}>
            <PolymerCard color="#1A0533" borderRadius={28} padding={0} style={styles.card}>
              <View style={styles.gestureHeader}>
                <View style={styles.grabBarContainer}>
                  <View style={styles.grabBar} />
                </View>
                
                <View style={styles.header}>
                  <View>
                    <Text style={styles.title}>Add player</Text>
                    <Text style={styles.subtitle}>
                      {completedRounds > 0
                        ? "Catch-up total is stored on the latest completed round."
                        : "Score applies before round 1 is recorded."}
                    </Text>
                  </View>
                  <Pressable onPress={handleDismiss}>
                    <NeuIconWell color="#150428" size={36} borderRadius={12}>
                      <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                    </NeuIconWell>
                  </Pressable>
                </View>
              </View>

              <View style={{ padding: 20, paddingTop: 0 }}>
                <Text style={styles.label}>Name</Text>
                <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={14} padding={0} style={styles.inputTrench}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    ref={inputRef}
                    placeholder="Player name"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    autoFocus
                    returnKeyType="next"
                  />
                </NeuTrench>

                <Text style={styles.label}>Total score so far</Text>
                <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={14} padding={0} style={styles.inputTrench}>
                  <TextInput
                    style={styles.input}
                    value={scoreText}
                    onChangeText={setScoreText}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="numbers-and-punctuation"
                    selectTextOnFocus
                  />
                </NeuTrench>

                <BrandButton onPress={handleAdd} style={styles.addBtn}>
                  <View style={styles.addBtnInner}>
                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>ADD TO GAME</Text>
                  </View>
                </BrandButton>
              </View>
            </PolymerCard>
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  sheetWrap: {
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 2,
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
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontFamily: "Inter_900Black",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    maxWidth: 260,
    lineHeight: 16,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 8,
  },
  inputTrench: {
    marginBottom: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    minHeight: 44,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addBtn: {
    marginTop: 8,
    height: 54,
    width: "100%",
  },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
