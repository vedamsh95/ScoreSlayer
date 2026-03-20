import React from "react";
import { StyleSheet, View, ViewStyle, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/DesignTokens";

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
  const rootStyle = Array.isArray(style) ? style.filter(s => s && (s as any).flex !== undefined || (s as any).height !== undefined) : (style?.flex !== undefined || style?.height !== undefined ? { flex: style.flex, height: style.height } : {});
  
  return (
    <View style={[styles.clayShadow, { borderRadius }, rootStyle]}>
      <View style={[styles.cardBody, { backgroundColor: color, borderRadius, padding }, style]}>
        <View style={[styles.gloss, { borderRadius }]} />
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
      { backgroundColor: color, borderRadius, padding, borderColor: "rgba(0,0,0,0.3)", borderWidth: 1 }, 
      style
    ]}
  >
    <View style={[styles.trenchInnerShadow, { borderRadius }]} />
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
      styles.btnOuterShadow,
      { borderRadius, width: size, height: size },
      style
    ]}
  >
    {({ pressed }) => (
      <View style={[
        styles.btnBody, 
        { 
          backgroundColor: color, 
          borderRadius, 
          transform: [{ scale: pressed ? 0.96 : 1 }],
          opacity: pressed ? 0.8 : 1
        }
      ]}>
        <View style={[styles.btnGloss, { borderRadius }]} />
        {children}
      </View>
    )}
  </Pressable>
);

export const NeuIconWell = ({ children, color = COLORS.surface, size = 48, borderRadius = 14 }: Props & { size?: number }) => (
  <View style={[styles.well, { backgroundColor: color, width: size, height: size, borderRadius }]}>
    <View style={[styles.wellInner, { borderRadius: borderRadius - 2 }]} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  clayShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  cardBody: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  gloss: {
    position: "absolute",
    top: -50,
    left: -50,
    right: -50,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "-45deg" }],
  },
  trench: {
    position: "relative",
    overflow: "hidden",
  },
  trenchInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  btnOuterShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  btnGloss: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  well: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  wellInner: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  }
});
