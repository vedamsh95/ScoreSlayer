import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  Platform, 
  Pressable,
  Dimensions,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TargetEditModalProps {
  visible: boolean;
  initialValue: number;
  onClose: () => void;
  onUpdate: (value: number) => void;
}

export const TargetEditModal = ({
  visible,
  initialValue,
  onClose,
  onUpdate,
}: TargetEditModalProps) => {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(initialValue.toString());
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
      setValue(initialValue.toString());
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
  }, [visible, initialValue]);

  const handleUpdate = () => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      onUpdate(num);
      handleDismiss();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }, animatedStyle]}>
            <PolymerCard color="#1A0533" borderRadius={32} padding={0} style={styles.card}>
              <View style={styles.gestureHeader}>
                <View style={styles.grabBarContainer}>
                  <View style={styles.grabBar} />
                </View>

                <View style={styles.header}>
                  <NeuIconWell color="rgba(255,45,120,0.15)" size={48} borderRadius={14}>
                    <Ionicons name="flag-outline" size={24} color="#FF2D78" />
                  </NeuIconWell>
                  <View style={{ alignItems: "center", marginTop: 12 }}>
                    <Text style={styles.title}>Target Score</Text>
                    <Text style={styles.subtitle}>Enter the new target for this session</Text>
                  </View>
                </View>
              </View>

              <View style={{ padding: 24, paddingTop: 0 }}>
              <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={20} padding={4} style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setValue}
                  ref={inputRef}
                  keyboardType="numeric"
                  selectTextOnFocus
                  autoFocus={visible}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </NeuTrench>

              <View style={styles.actions}>
                <BrandButton
                  onPress={handleDismiss}
                  color="#2D1B4D"
                  highlight="rgba(255,255,255,0.05)"
                  shadow="rgba(0,0,0,0.3)"
                  glowColor="rgba(0,0,0,0.2)"
                  borderRadius={18}
                  style={styles.actionBtn}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </BrandButton>

                <View style={{ width: 12 }} />

                <BrandButton
                  onPress={handleUpdate}
                  color="#00F5A0"
                  highlight="#54FFC9"
                  shadow="#00D289"
                  glowColor="rgba(0, 245, 160, 0.4)"
                  borderRadius={18}
                  style={styles.actionBtn}
                >
                  <Text style={styles.updateText}>Update</Text>
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
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  sheet: { width: "100%", backgroundColor: "transparent", paddingHorizontal: 16 },
  card: { borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  gestureHeader: { paddingTop: 8 },
  grabBarContainer: { width: "100%", alignItems: "center", paddingVertical: 12 },
  grabBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontFamily: "Bungee_400Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
  },
  inputContainer: {
    height: 72,
    marginBottom: 24,
    justifyContent: "center",
  },
  input: {
    fontFamily: "Bungee_400Regular",
    fontSize: 32,
    color: "#00F5A0",
    textAlign: "center",
    height: 72,
    paddingTop: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 54,
  },
  cancelText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    paddingTop: 3,
  },
  updateText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "#1A0533",
    paddingTop: 3,
  },
});
