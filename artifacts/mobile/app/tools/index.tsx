import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import { router, Stack } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NeuTrench, NeuIconWell, BrandButton, NeuButton } from "@/components/PolymerCard";
import { UnifiedToolsCore } from "@/components/UnifiedToolsCore";

const { width } = Dimensions.get("window");

export default function GameToolsScreen() {
  const insets = useSafeAreaInsets();
  const [playerNames, setPlayerNames] = useState<string[]>(["P1", "P2"]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="chevron-left" size={24} color="#FFF" /></Pressable>
        <Text style={styles.title}>Game Tools</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.main}>
        <UnifiedToolsCore initialPlayers={playerNames.map((n, i) => ({ id: i.toString(), name: n, color: ["#00F5A0", "#FF2D78", "#8B5CF6", "#FFB800"][i % 4] }))} showPlayerInput={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_900Black", fontSize: 16, color: "#FFF", textTransform: "uppercase", letterSpacing: 2 },
  tabTrench: { flexDirection: "row", height: 56 },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  activeTabOverlay: { ...StyleSheet.absoluteFillObject, padding: 4 },
  activeTabBody: { flex: 1, backgroundColor: "rgba(0,245,160,0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,245,160,0.3)" },
  main: { flex: 1, paddingHorizontal: 20, paddingBottom: 30 },
});
