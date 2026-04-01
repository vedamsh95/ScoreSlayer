import React, { useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View, ViewStyle, Pressable, Text, Modal, Dimensions, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/DesignTokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  color?: string;
  borderRadius?: number;
  padding?: number;
}

/**
 * High-gloss Claymorphic Card
 * Used for main containers and surfaces.
 */
export const PolymerCard = ({ children, style, color = COLORS.surface, borderRadius = 32, padding = 20 }: Props) => {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const rootStyle: ViewStyle = {};
  
  // Extract all layout-critical properties to the outer shadow container
  const layoutProps = [
    'flex', 'height', 'width', 'minHeight', 'minWidth', 'maxHeight', 'maxWidth',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
    'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'alignSelf'
  ];

  layoutProps.forEach(prop => {
    if ((flattenedStyle as any)[prop] !== undefined) {
      (rootStyle as any)[prop] = (flattenedStyle as any)[prop];
    }
  });

  return (
    <View style={[styles.clayShadow, { borderRadius }, rootStyle as ViewStyle]}>
      <View style={[styles.cardBody, { backgroundColor: color, borderRadius, padding }, style as ViewStyle]}>
        <View pointerEvents="none" style={[styles.gloss, { borderRadius }]} />
        {children}
      </View>
    </View>
  );
};

/**
 * Sunken Neumorphic Trench
 * Used for input areas, lists, and secondary data wells.
 */
export const NeuTrench = ({ children, style, color = COLORS.background, borderRadius = 20, padding = 12 }: Props) => (
  <View 
    style={[
      styles.trench, 
      { backgroundColor: color, borderRadius, padding }, 
      style
    ]}
  >
    {/* Decorative border only — must not sit above TextInput in the hit tree */}
    <View pointerEvents="none" style={[styles.trenchInnerShadow, { borderRadius }]} />
    {children}
  </View>
);

/**
 * Tactile Claymorphic Button
 */
export const NeuButton = ({ 
  children, 
  onPress, 
  color = COLORS.primary, 
  size, 
  style,
  borderRadius = 16 
}: Props & { onPress?: () => void, size?: number }) => (
  <Pressable 
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    style={({ pressed }) => [
      getBtnShadow(pressed ? 0 : 4, pressed ? 0.1 : 0.2) as ViewStyle,
      { borderRadius, width: size, height: size },
      style as ViewStyle
    ]}
  >
    {({ pressed }) => (
      <View style={[
        styles.btnBody, 
        { 
          backgroundColor: color, 
          borderRadius, 
          transform: [{ translateY: pressed ? 1.5 : 0 }, { scale: pressed ? 0.98 : 1 }],
          opacity: 1 
        }
      ]}>
        <View 
          pointerEvents="none"
          style={[styles.btnInnerHighlight, { borderRadius }]} 
        />
        {children}
      </View>
    )}
  </Pressable>
);

/**
 * Brand Puffy Button
 * High-fidelity brand button with multi-layered shadows.
 */
export const BrandButton = ({ 
  children, 
  onPress, 
  style,
  borderRadius = 22,
  color = "#8B5CF6",
  highlight = "#A78BFA",
  shadow = "#6D28D9",
  glowColor = "rgba(139, 92, 246, 0.4)",
  disabled = false
}: Props & { onPress?: () => void, highlight?: string, shadow?: string, glowColor?: string, disabled?: boolean }) => (
  <Pressable 
    disabled={disabled}
    onPress={() => {
      if (disabled) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPress?.();
    }}
    style={({ pressed }) => [
      {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: (pressed && !disabled) ? 4 : 20 },
        shadowOpacity: (pressed && !disabled) ? 0.2 : 0.4,
        shadowRadius: (pressed && !disabled) ? 10 : 40,
        elevation: (pressed && !disabled) ? 4 : 20,
        borderRadius,
        opacity: disabled ? 0.5 : 1,
      },
      style as ViewStyle
    ]}
  >
    {({ pressed }) => (
      <View style={[
        styles.brandBody, 
        { 
          borderRadius,
          backgroundColor: color,
          transform: [{ translateY: (pressed && !disabled) ? 4 : 0 }]
        }
      ]}>
        <View 
          pointerEvents="none"
          style={[
            styles.brandInnerHighlight, 
            { borderRadius, borderColor: (pressed && !disabled) ? shadow : highlight },
          ]} 
        />
        <View 
          pointerEvents="none"
          style={[
            styles.brandInnerShadow, 
            { borderRadius, borderColor: (pressed && !disabled) ? highlight : shadow },
          ]} 
        />
        {children}
      </View>
    )}
  </Pressable>
);

export const NeuIconWell = ({ children, color = COLORS.surface, size = 48, borderRadius = 14, style }: Props & { size?: number }) => (
  <View style={[styles.well, { backgroundColor: color, width: size, height: size, borderRadius }, style]}>
    {children}
  </View>
);

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "info" | "danger";
}

export const PolymerAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info"
}: AlertProps) => {
  const getColors = () => {
    switch (type) {
      case "danger":
      case "warning":
        return {
          color: "#FF2D78",
          highlight: "#FF70A5",
          shadow: "#C2004D",
          glow: "rgba(255, 45, 120, 0.4)"
        };
      default:
        return {
          color: "#00F5A0",
          highlight: "#54FFC9",
          shadow: "#00D289",
          glow: "rgba(0, 245, 160, 0.4)"
        };
    }
  };

  const theme = getColors();
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
    Keyboard.dismiss();
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onCancel)();
    });
  }, [onCancel]);

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
          runOnJS(onCancel)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    }), [onCancel, SCREEN_HEIGHT]);

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
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }, animatedStyle]}>
            <PolymerCard 
              color="#1A0533" 
              borderRadius={32} 
              padding={0} 
              style={styles.alertCard}
            >
              <View style={styles.gestureHeader}>
                <View style={styles.grabBarContainer}>
                  <View style={styles.grabBar} />
                </View>
                
                <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
                  <Text style={styles.alertTitle}>{title}</Text>
                  <Text style={styles.alertMessage}>{message}</Text>
                </View>
              </View>
            <View style={{ padding: 24, paddingTop: 0 }}>
              <View style={styles.alertActions}>
                <BrandButton
                  onPress={handleDismiss}
                  color="#2D1B4D"
                  highlight="rgba(255,255,255,0.05)"
                  shadow="rgba(0,0,0,0.3)"
                  glowColor="rgba(0,0,0,0.2)"
                  borderRadius={18}
                  style={{ flex: 1, height: 50 }}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </BrandButton>
                
                <View style={{ width: 12 }} />
                
                <BrandButton
                  onPress={() => {
                    onConfirm();
                    handleDismiss();
                  }}
                  color={theme.color}
                  highlight={theme.highlight}
                  shadow={theme.shadow}
                  glowColor={theme.glow}
                  borderRadius={18}
                  style={{ flex: 1, height: 50 }}
                >
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </BrandButton>
              </View>
            </View>
          </PolymerCard>
        </Animated.View>
      </GestureDetector>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const getBtnShadow = (h: number, o: number) => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: h },
  shadowOpacity: o,
  shadowRadius: h * 1.5,
  elevation: h,
});

const styles = StyleSheet.create({
  clayShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBody: {
    position: "relative",
    overflow: "hidden",
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  gloss: {
    position: "absolute",
    top: -50,
    left: -50,
    right: -50,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "-45deg" }],
  },
  trench: {
    position: "relative",
    overflow: "hidden",
  },
  trenchInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "rgba(0,0,0,0.35)",
    borderLeftColor: "rgba(0,0,0,0.35)",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  btnBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  btnInnerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: "rgba(255,255,255,0.25)",
  },
  brandOuterShadow: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  brandOuterShadowPressed: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  brandBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  brandInnerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: "#A78BFA",
  },
  brandInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderColor: "#6D28D9",
  },
  well: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "rgba(0,0,0,0.4)",
    borderLeftColor: "rgba(0,0,0,0.4)",
    borderBottomColor: "rgba(255,255,255,0.1)",
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  modalOverlay: {
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
  alertCard: {
    width: "100%",
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
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  alertTitle: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  alertActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  confirmText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#1A0533",
  },
});
