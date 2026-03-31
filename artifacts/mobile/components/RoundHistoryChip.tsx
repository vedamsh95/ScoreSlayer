import { StyleSheet, Text, View, ViewStyle, Pressable } from "react-native";
import { NeuTrench } from "./PolymerCard";
import { COLORS } from "../constants/DesignTokens";

interface RoundHistoryChipProps {
  score: number;
  label?: string;
  color?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * A compact score chip for the round history strip.
 */
export function RoundHistoryChip({ 
  score, 
  label, 
  color = COLORS.text, 
  style,
  onPress
}: RoundHistoryChipProps) {
  const isPositive = score > 0;
  const isNegative = score < 0;
  
  return (
    <Pressable onPress={onPress}>
      <NeuTrench 
        color="rgba(255,255,255,0.05)" 
        borderRadius={12} 
        padding={8} 
        style={[styles.container, style as ViewStyle]}
      >
        <Text style={[styles.score, { color: isPositive ? COLORS.primary : isNegative ? COLORS.secondary : color }]}>
          {isPositive ? "+" : ""}{score}
        </Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </NeuTrench>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  score: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 8,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
    textTransform: "uppercase",
  },
});
