import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useGame } from "@/context/GameContext";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "< 1m";
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { state, deleteSession } = useGame();

  const sortedSessions = useMemo(
    () =>
      [...state.sessions].sort(
        (a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt)
      ),
    [state.sessions]
  );

  const completedSessions = sortedSessions.filter((s) => s.isComplete);
  const activeSessions = sortedSessions.filter((s) => !s.isComplete);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Game?",
      `Remove this ${name} session from history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteSession(id);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.heading}>Game History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{state.sessions.length}</Text>
        </View>
      </View>

      {state.sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="game-controller-outline" size={56} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>No Games Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first game to see your history here
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.emptyBtnText}>Choose a Game</Text>
          </Pressable>
        </View>
      )}

      {activeSessions.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Active</Text>
          {activeSessions.map((s) => (
            <Pressable
              key={s.id}
              style={styles.sessionCard}
              onPress={() =>
                router.push({ pathname: "/game/[id]", params: { id: s.id } })
              }
              onLongPress={() => handleDelete(s.id, s.gameName)}
            >
              <View
                style={[styles.sessionColorBar, { backgroundColor: s.gameColor }]}
              />
              <View style={styles.sessionInfo}>
                <View style={styles.sessionTop}>
                  <Text style={styles.sessionGame}>{s.gameName}</Text>
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>
                <Text style={styles.sessionMeta}>
                  Round {s.currentRound} · {s.players.length} players
                </Text>
                <Text style={styles.sessionDate}>
                  {formatDate(s.startedAt)}
                </Text>
                <View style={styles.playerChips}>
                  {s.players.map((p) => (
                    <View key={p.id} style={styles.playerChip}>
                      <View
                        style={[styles.chipDot, { backgroundColor: p.color }]}
                      />
                      <Text style={styles.chipName}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.25)"
              />
            </Pressable>
          ))}
        </View>
      )}

      {completedSessions.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Completed</Text>
          {completedSessions.map((s) => (
            <Pressable
              key={s.id}
              style={styles.sessionCard}
              onPress={() =>
                router.push({ pathname: "/results/[id]", params: { id: s.id } })
              }
              onLongPress={() => handleDelete(s.id, s.gameName)}
            >
              <View
                style={[styles.sessionColorBar, { backgroundColor: s.gameColor }]}
              />
              <View style={styles.sessionInfo}>
                <View style={styles.sessionTop}>
                  <Text style={styles.sessionGame}>{s.gameName}</Text>
                  <Text style={styles.sessionDate}>
                    {s.endedAt ? formatDate(s.endedAt) : "—"}
                  </Text>
                </View>
                <Text style={styles.sessionMeta}>
                  {s.currentRound - 1} rounds · {s.players.length} players
                  {s.endedAt
                    ? ` · ${formatDuration(s.endedAt - s.startedAt)}`
                    : ""}
                </Text>
                <View style={styles.winnerRow}>
                  <Text style={styles.winnerLabel}>
                    Winner:
                  </Text>
                  <Text style={[styles.winnerName, { color: s.gameColor }]}>
                    {s.winnerName}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.25)"
              />
            </Pressable>
          ))}
        </View>
      )}

      {state.sessions.length > 0 && (
        <Text style={styles.longPressHint}>
          Long-press any session to delete
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0533",
  },
  content: {
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: "#00F5A0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1A0533",
  },
  group: {
    marginBottom: 28,
  },
  groupLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sessionColorBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  sessionInfo: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  sessionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionGame: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,245,160,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00F5A0",
  },
  liveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#00F5A0",
    letterSpacing: 1,
  },
  sessionMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  sessionDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  playerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipName: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  winnerLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  winnerName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  longPressHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    textAlign: "center",
    paddingVertical: 8,
  },
});
