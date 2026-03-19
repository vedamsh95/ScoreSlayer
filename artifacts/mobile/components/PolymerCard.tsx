import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PolymerCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  indent?: boolean;
  indentColor?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * CLAYMORPHISM outer card
 * - Inflated 3D look: large drop shadow, top-left gloss streak, bottom-right inner shadow
 * - Light source: top-left
 */
export function PolymerCard({
  children,
  style,
  color = "#4C1AA3",
  indent = false,
  indentColor,
  size = "md",
}: PolymerCardProps) {
  if (indent) {
    return <NeuTrench style={style} color={indentColor}>{children}</NeuTrench>;
  }

  const br = size === "sm" ? 20 : size === "lg" ? 32 : 26;
  const pad = size === "sm" ? 14 : size === "lg" ? 24 : 18;

  return (
    <View style={[styles.clayShadowOuter, { borderRadius: br }, style]}>
      {/* Main clay body */}
      <View style={[styles.clayBody, { backgroundColor: color, borderRadius: br, padding: pad }]}>
        {/* Top-left gloss streak — the "inflated" light hit */}
        <View style={[styles.glossStreak, { borderRadius: br - 4 }]} />
        {/* Bottom-right inner shadow to make it look puffy/rounded */}
        <View style={[styles.clayInnerShadow, { borderRadius: br }]} />
        {/* Content on top */}
        <View style={{ zIndex: 2 }}>{children}</View>
      </View>
    </View>
  );
}

/**
 * NEUMORPHIC trench / carved-out well
 * - Deep inset look: dark shadow top-left, lighter glow bottom-right
 * - Used for icon wells, score inputs, toggles, stat boxes
 */
export function NeuTrench({
  children,
  style,
  color,
  borderRadius = 16,
  padding = 12,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  borderRadius?: number;
  padding?: number;
}) {
  const bg = color ?? "#1A0533";
  // Darker shade for top-left shadow edge
  const darkEdge = "rgba(0,0,0,0.55)";
  // Lighter shade for bottom-right highlight edge
  const lightEdge = "rgba(107,33,232,0.35)";

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius,
          padding,
          // Outer shadow creates the "pit" illusion
          shadowColor: darkEdge,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 0,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.4)",
        },
        style,
      ]}
    >
      {/* Inner top-left dark edge (carved top wall) */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderTopWidth: 2,
            borderLeftWidth: 2,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            borderColor: darkEdge,
          },
        ]}
        pointerEvents="none"
      />
      {/* Inner bottom-right light edge (carved floor reflection) */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 2,
            borderRightWidth: 2,
            borderColor: lightEdge,
          },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

/**
 * NEUMORPHIC icon well - the square carved pit for icons
 */
export function NeuIconWell({
  children,
  color,
  size = 48,
  borderRadius = 14,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const bg = color ?? "#150428";
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          // Outer dark shadow top-left
          shadowColor: "#000",
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 0.7,
          shadowRadius: 6,
          elevation: 2,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.5)",
        },
        style,
      ]}
    >
      {/* Top-left carved dark edge */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderTopWidth: 1.5,
            borderLeftWidth: 1.5,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            borderColor: "rgba(0,0,0,0.6)",
          },
        ]}
        pointerEvents="none"
      />
      {/* Bottom-right lifted light edge */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 1.5,
            borderRightWidth: 1.5,
            borderColor: "rgba(107,33,232,0.4)",
          },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clayShadowOuter: {
    // Large soft drop shadow — the "floating off screen" clay effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  clayBody: {
    overflow: "hidden",
    position: "relative",
  },
  glossStreak: {
    position: "absolute",
    top: 5,
    left: 8,
    width: "55%",
    height: "38%",
    // Top-left white gloss — light hitting the inflated surface
    backgroundColor: "rgba(255,255,255,0.22)",
    zIndex: 1,
    // Soft feathered edge
    borderBottomRightRadius: 40,
  },
  clayInnerShadow: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "60%",
    height: "45%",
    // Bottom-right inner shadow — the underside of the inflated shape
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1,
    borderTopLeftRadius: 40,
  },
});
