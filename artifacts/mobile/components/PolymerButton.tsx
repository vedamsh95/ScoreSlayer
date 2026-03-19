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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const paddingH = size === "sm" ? 14 : size === "lg" ? 28 : 20;
  const paddingV = size === "sm" ? 10 : size === "lg" ? 18 : 14;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const borderRadius = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  if (variant === "neumorphic") {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.neumorphic,
            {
              paddingHorizontal: paddingH,
              paddingVertical: paddingV,
              borderRadius,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            {label && (
              <Text style={[styles.label, { fontSize, color: "#FFFFFF" }]}>
                {label}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === "ghost") {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.ghost,
            {
              paddingHorizontal: paddingH,
              paddingVertical: paddingV,
              borderRadius,
              borderColor: color,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            {label && (
              <Text style={[styles.label, { fontSize, color }]}>{label}</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.clay,
          {
            backgroundColor: color,
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
            borderRadius,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.clayHighlight,
            { borderRadius: borderRadius - 2 },
          ]}
        />
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          {label && (
            <Text
              style={[
                styles.label,
                { fontSize, color: textColor, fontFamily: "Inter_700Bold" },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clay: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    overflow: "visible",
  },
  clayHighlight: {
    position: "absolute",
    top: 3,
    left: 6,
    right: "45%",
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.3)",
    zIndex: 0,
  },
  neumorphic: {
    backgroundColor: "#2A0A60",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  ghost: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconWrap: {
    marginRight: 6,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
