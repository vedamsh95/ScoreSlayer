import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface PolymerButtonProps {
  label?: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "clay" | "neumorphic" | "ghost";
  icon?: React.ReactNode;
}

/**
 * CLAY button: inflated 3D pill
 * - Large drop shadow beneath (floating)
 * - Top-left gloss streak (light hitting inflated surface)
 * - Bottom-right inner dark shadow (underside curvature)
 * - Press: springs DOWN into screen (scale + shadow shrink)
 */
export function PolymerButton({
  label,
  onPress,
  color = "#00F5A0",
  textColor = "#1A0533",
  style,
  disabled = false,
  size = "md",
  variant = "clay",
  icon,
}: PolymerButtonProps) {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.55);
  const shadowOffset = useSharedValue(10);

  const animatedWrapper = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowOffset.value,
  }));

  const handlePressIn = useCallback(() => {
    // Clay squishes down: scale shrinks, shadow flattens
    scale.value = withSpring(0.93, { damping: 18, stiffness: 500 });
    shadowOpacity.value = withSpring(0.2, { damping: 18, stiffness: 500 });
    shadowOffset.value = withSpring(3, { damping: 18, stiffness: 500 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 380 });
    shadowOpacity.value = withSpring(0.55, { damping: 14, stiffness: 380 });
    shadowOffset.value = withSpring(10, { damping: 14, stiffness: 380 });
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [disabled, onPress]);

  const paddingH = size === "sm" ? 16 : size === "lg" ? 32 : 22;
  const paddingV = size === "sm" ? 11 : size === "lg" ? 19 : 14;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const br = size === "sm" ? 18 : size === "lg" ? 28 : 22;

  if (variant === "neumorphic") {
    // Neumorphic pill: carved into the surface
    return (
      <Animated.View style={[animatedWrapper, style, { borderRadius: br }]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.neuBody,
            {
              paddingHorizontal: paddingH,
              paddingVertical: paddingV,
              borderRadius: br,
              opacity: disabled ? 0.4 : 1,
            },
          ]}
        >
          {/* Top-left carved dark edge */}
          <View style={[StyleSheet.absoluteFillObject, styles.neuEdgeDark, { borderRadius: br }]} pointerEvents="none" />
          {/* Bottom-right light reflection edge */}
          <View style={[StyleSheet.absoluteFillObject, styles.neuEdgeLight, { borderRadius: br }]} pointerEvents="none" />
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            {label && <Text style={[styles.label, { fontSize, color: "rgba(255,255,255,0.85)" }]}>{label}</Text>}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === "ghost") {
    return (
      <Animated.View style={[animatedWrapper, style, { borderRadius: br }]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[styles.ghostBody, { paddingHorizontal: paddingH, paddingVertical: paddingV, borderRadius: br, borderColor: color, opacity: disabled ? 0.4 : 1 }]}
        >
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            {label && <Text style={[styles.label, { fontSize, color }]}>{label}</Text>}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // === CLAY VARIANT (default) ===
  return (
    <Animated.View
      style={[
        styles.clayShadowWrap,
        animatedWrapper,
        {
          borderRadius: br,
          shadowColor: "#000",
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.clayBody,
          {
            backgroundColor: color,
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
            borderRadius: br,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        {/* Top-left gloss streak — the inflated light hit */}
        <View
          style={[
            styles.glossStreak,
            { borderRadius: br - 3, borderBottomRightRadius: 30 },
          ]}
          pointerEvents="none"
        />
        {/* Bottom-right inner shadow — underside of the puffy shape */}
        <View
          style={[
            styles.innerShadowBR,
            { borderRadius: br, borderTopLeftRadius: 30 },
          ]}
          pointerEvents="none"
        />
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          {label && (
            <Text style={[styles.label, { fontSize, color: textColor, fontFamily: "Inter_700Bold" }]}>
              {label}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clayShadowWrap: {
    // The big floating drop shadow — this is what makes clay look 3D
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  clayBody: {
    overflow: "hidden",
    position: "relative",
  },
  glossStreak: {
    position: "absolute",
    top: 4,
    left: 6,
    width: "52%",
    height: "46%",
    backgroundColor: "rgba(255,255,255,0.28)",
    zIndex: 1,
  },
  innerShadowBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "55%",
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.22)",
    zIndex: 1,
  },
  neuBody: {
    backgroundColor: "#150428",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.45)",
  },
  neuEdgeDark: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: "rgba(0,0,0,0.6)",
  },
  neuEdgeLight: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(107,33,232,0.4)",
  },
  ghostBody: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    gap: 8,
  },
  iconWrap: {},
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
