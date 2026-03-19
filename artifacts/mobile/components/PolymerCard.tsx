import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PolymerCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  indent?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PolymerCard({
  children,
  style,
  color = "#4C1AA3",
  indent = false,
  size = "md",
}: PolymerCardProps) {
  if (indent) {
    return (
      <View style={[styles.indentOuter, style]}>
        <View style={[styles.indentInner]}>{children}</View>
      </View>
    );
  }

  const borderRadius = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const padding = size === "sm" ? 12 : size === "lg" ? 24 : 16;

  return (
    <View
      style={[
        styles.clay,
        {
          backgroundColor: color,
          borderRadius,
          padding,
        },
        style,
      ]}
    >
      <View style={[styles.highlight, { borderRadius: borderRadius - 4 }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clay: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: "visible",
  },
  highlight: {
    position: "absolute",
    top: 4,
    left: 4,
    right: "50%",
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.18)",
    zIndex: 0,
  },
  indentOuter: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  indentInner: {
    borderRadius: 14,
    shadowColor: "rgba(255,255,255,0.12)",
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    padding: 12,
  },
});
