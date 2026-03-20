import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/DesignTokens";

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  size?: "md" | "lg";
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const PolymerButton = ({ 
  label, 
  onPress, 
  color = COLORS.primary, 
  textColor = "#1A0533", 
  size = "md", 
  style,
  icon
}: Props) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={[styles.shadow, { borderRadius: size === "lg" ? 20 : 14 }, style]}>
      <Pressable 
        onPress={handlePress} 
        style={({ pressed }) => [
          styles.button, 
          { backgroundColor: color, paddingVertical: size === "lg" ? 18 : 12, borderRadius: size === "lg" ? 20 : 14 },
          pressed && { opacity: 0.9, transform: [{ translateY: 2 }] }
        ]}
      >
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 2,
  },
  icon: {},
  text: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 16,
    letterSpacing: -0.5,
  }
});
