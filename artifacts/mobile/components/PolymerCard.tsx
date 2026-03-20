import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../constants/DesignTokens";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  color?: string;
  borderRadius?: number;
  padding?: number;
}

export const PolymerCard = ({ children, style, color = COLORS.surface, borderRadius = 24 }: Props) => (
  <View style={[styles.cardShadow, { borderRadius }]}>
    <View style={[styles.cardBody, { backgroundColor: color, borderRadius }, style]}>
      {children}
    </View>
  </View>
);

export const NeuTrench = ({ children, style, color = COLORS.background, borderRadius = 16, padding = 12 }: Props) => (
  <View 
    style={[
      styles.trench, 
      { backgroundColor: color, borderRadius, padding, borderColor: "rgba(255,255,255,0.03)", borderWidth: 1 }, 
      style
    ]}
  >
    {children}
  </View>
);

export const NeuIconWell = ({ children, color = COLORS.surface, size = 44, borderRadius = 12 }: Props & { size?: number }) => (
  <View style={[styles.well, { backgroundColor: color, width: size, height: size, borderRadius }]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardBody: {
    position: "relative",
    overflow: "hidden",
  },
  trench: {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  well: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  }
});
