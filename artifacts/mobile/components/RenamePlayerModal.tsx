import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PolymerCard, NeuTrench, BrandButton, NeuIconWell } from "./PolymerCard";
import { Player } from "@/context/GameContext";

interface RenamePlayerModalProps {
  visible: boolean;
  player: Player | null;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function RenamePlayerModal({
  visible,
  player,
  onClose,
  onRename,
}: RenamePlayerModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (player) setName(player.name);
  }, [player]);

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onRename(name.trim());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <PolymerCard color="#1A0533" borderRadius={28} padding={24} style={styles.card}>
          <View style={styles.header}>
            <NeuIconWell color={player?.color ?? "#00F5A0"} size={42} borderRadius={12}>
              <Ionicons name="pencil" size={20} color="#1A0533" />
            </NeuIconWell>
            <Text style={styles.title}>RENAME PLAYER</Text>
          </View>

          <Text style={styles.label}>Change Name</Text>
          <NeuTrench color="rgba(0,0,0,0.3)" borderRadius={16} padding={0} style={styles.inputTrench}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder="Enter name..."
              placeholderTextColor="rgba(255,255,255,0.2)"
            />
          </NeuTrench>

          <View style={styles.footer}>
            <BrandButton onPress={onClose} color="#334155" style={{ flex: 1, height: 54 }}>
              <Text style={styles.btnText}>CANCEL</Text>
            </BrandButton>
            <BrandButton onPress={handleSave} style={{ flex: 1.5, height: 54 }}>
              <Text style={styles.btnText}>SAVE</Text>
            </BrandButton>
          </View>
        </PolymerCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { width: "100%", maxWidth: 400, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
  title: { fontFamily: "Bungee_400Regular", fontSize: 20, color: "#FFFFFF", paddingTop: 4 },
  label: { fontFamily: "Inter_900Black", fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
  inputTrench: { height: 54, marginBottom: 32 },
  input: { flex: 1, color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 18, paddingHorizontal: 16 },
  footer: { flexDirection: "row", gap: 12 },
  btnText: { fontFamily: "Bungee_400Regular", fontSize: 14, color: "#FFFFFF", paddingTop: 3 },
});
