import React, { useState, useEffect } from "react";
import { Modal, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PolymerCard, NeuTrench, BrandButton, NeuIconWell } from "./PolymerCard";
import { COLORS } from "@/constants/DesignTokens";

interface TargetEditModalProps {
  visible: boolean;
  initialValue: number;
  onClose: () => void;
  onUpdate: (value: number) => void;
}

export const TargetEditModal = ({
  visible,
  initialValue,
  onClose,
  onUpdate,
}: TargetEditModalProps) => {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (visible) {
      setValue(initialValue.toString());
    }
  }, [visible, initialValue]);

  const handleUpdate = () => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      onUpdate(num);
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <PolymerCard color="#1A0533" borderRadius={32} padding={24} style={styles.card}>
            <View style={styles.header}>
              <NeuIconWell color="rgba(255,45,120,0.15)" size={48} borderRadius={14}>
                <Ionicons name="flag-outline" size={24} color="#FF2D78" />
              </NeuIconWell>
              <Text style={styles.title}>Target Score</Text>
              <Text style={styles.subtitle}>Enter the new target for this session</Text>
            </View>

            <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={20} padding={4} style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                selectTextOnFocus
                autoFocus={visible}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
            </NeuTrench>

            <View style={styles.actions}>
              <BrandButton
                onPress={onClose}
                color="#2D1B4D"
                highlight="rgba(255,255,255,0.05)"
                shadow="rgba(0,0,0,0.3)"
                glowColor="rgba(0,0,0,0.2)"
                borderRadius={18}
                style={styles.actionBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </BrandButton>

              <View style={{ width: 12 }} />

              <BrandButton
                onPress={handleUpdate}
                color="#00F5A0"
                highlight="#54FFC9"
                shadow="#00D289"
                glowColor="rgba(0, 245, 160, 0.4)"
                borderRadius={18}
                style={styles.actionBtn}
              >
                <Text style={styles.updateText}>Update</Text>
              </BrandButton>
            </View>
          </PolymerCard>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 360,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Bungee_400Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
  },
  inputContainer: {
    height: 72,
    marginBottom: 24,
    justifyContent: "center",
  },
  input: {
    fontFamily: "Bungee_400Regular",
    fontSize: 32,
    color: "#00F5A0",
    textAlign: "center",
    height: 72,
    paddingTop: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    flex: 1,
    height: 54,
  },
  cancelText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    paddingTop: 3,
  },
  updateText: {
    fontFamily: "Bungee_400Regular",
    fontSize: 12,
    color: "#1A0533",
    paddingTop: 3,
  },
});
