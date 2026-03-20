import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PolymerCard, NeuTrench, BrandButton, NeuIconWell } from "./PolymerCard";

interface AddPlayerModalProps {
  visible: boolean;
  completedRounds: number;
  onClose: () => void;
  onAdd: (name: string, catchUpScore: number) => boolean;
}

export function AddPlayerModal({
  visible,
  completedRounds,
  onClose,
  onAdd,
}: AddPlayerModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [scoreText, setScoreText] = useState("0");

  useEffect(() => {
    if (visible) {
      setName("");
      setScoreText("0");
    }
  }, [visible]);

  const handleAdd = () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const normalized = scoreText.replace(/,/g, "").replace(/\u2212/g, "-").trim();
    const parsed = parseFloat(normalized === "" ? "0" : normalized);
    const catchUp = Number.isFinite(parsed) ? parsed : 0;
    const ok = onAdd(trimmed, catchUp);
    if (!ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PolymerCard color="#1A0533" borderRadius={28} padding={20} style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add player</Text>
                <Text style={styles.subtitle}>
                  {completedRounds > 0
                    ? "Catch-up total is stored on the latest completed round."
                    : "Score applies before round 1 is recorded."}
                </Text>
              </View>
              <Pressable onPress={onClose}>
                <NeuIconWell color="#150428" size={36} borderRadius={12}>
                  <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                </NeuIconWell>
              </Pressable>
            </View>

            <Text style={styles.label}>Name</Text>
            <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={14} padding={0} style={styles.inputTrench}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Player name"
                placeholderTextColor="rgba(255,255,255,0.25)"
                autoFocus
                returnKeyType="next"
              />
            </NeuTrench>

            <Text style={styles.label}>Total score so far</Text>
            <NeuTrench color="rgba(0,0,0,0.25)" borderRadius={14} padding={0} style={styles.inputTrench}>
              <TextInput
                style={styles.input}
                value={scoreText}
                onChangeText={setScoreText}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numbers-and-punctuation"
                selectTextOnFocus
              />
            </NeuTrench>

            <BrandButton onPress={handleAdd} style={styles.addBtn}>
              <View style={styles.addBtnInner}>
                <Ionicons name="person-add" size={20} color="#FFFFFF" />
                <Text style={styles.addBtnText}>ADD TO GAME</Text>
              </View>
            </BrandButton>
          </PolymerCard>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontFamily: "Inter_900Black",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    maxWidth: 260,
    lineHeight: 16,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 8,
  },
  inputTrench: {
    marginBottom: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    minHeight: 44,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addBtn: {
    marginTop: 8,
    height: 54,
    width: "100%",
  },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addBtnText: {
    fontFamily: "Inter_900Black",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
