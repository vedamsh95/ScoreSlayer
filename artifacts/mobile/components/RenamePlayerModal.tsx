import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  Pressable,
  Keyboard,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
import { Player } from "@/context/GameContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface RenamePlayerModalProps {
  visible: boolean;
  player: Player | null;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function RenamePlayerModal({
  visible,
  player,
  onClose,
  onRename,
}: RenamePlayerModalProps) {
  const [name, setName] = useState("");
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

  const handleDismiss = useCallback(() => {
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
      if (player) setName(player.name);
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
  }, [visible, player]);

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onRename(name.trim());
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
        <KeyboardAvoidingView style={styles.overlay} behavior="padding" keyboardVerticalOffset={12}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheet, animatedStyle]}>
            <PolymerCard color="#1A0533" borderRadius={32} padding={0} style={styles.card}>
                <View style={styles.gestureHeader}>
                <View style={styles.grabBarContainer}>
                  <View style={styles.grabBar} />
                </View>

                <View style={styles.header}>
                  <NeuIconWell color={player?.color ?? "#00F5A0"} size={42} borderRadius={12}>
                    <Ionicons name="pencil" size={20} color="#1A0533" />
                  </NeuIconWell>
                  <Text style={styles.title}>RENAME PLAYER</Text>
                </View>
              </View>

              <View style={{ padding: 24, paddingTop: 0 }}>
                <Text style={styles.label}>Change Name</Text>
                <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.inputTrench}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    ref={inputRef}
                    placeholder="Enter name..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                  />
                </NeuTrench>

                <View style={styles.footer}>
                  <BrandButton onPress={handleDismiss} color="#334155" style={{ flex: 1, height: 54 }}>
                    <Text style={styles.btnText}>CANCEL</Text>
                  </BrandButton>
                  <BrandButton onPress={handleSave} style={{ flex: 1.5, height: 54 }}>
                    <Text style={styles.btnText}>SAVE</Text>
                  </BrandButton>
                </View>
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
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  sheet: {
    width: "100%",
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gestureHeader: { paddingTop: 8 },
  grabBarContainer: { width: "100%", alignItems: "center", paddingVertical: 12 },
  grabBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 24, marginBottom: 24 },
  title: { fontFamily: "Bungee_400Regular", fontSize: 20, color: "#FFFFFF", paddingTop: 4 },
  label: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
  inputTrench: { height: 54, marginBottom: 32 },
  input: { flex: 1, color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 18, paddingHorizontal: 16 },
  footer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  btnText: { fontFamily: "Bungee_400Regular", fontSize: 14, color: "#FFFFFF", paddingTop: 3 },
});
