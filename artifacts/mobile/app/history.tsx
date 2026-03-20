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
import { PolymerCard, NeuTrench, BrandButton, PolymerAlert } from "@/components/PolymerCard";

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
  const { state, deleteSession, deleteAllSessions } = useGame();

  const sortedSessions = useMemo(
    () =>
      [...state.sessions].sort(
        (a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt)
      ),
    [state.sessions]
  );

  const [showDeleteAllAlert, setShowDeleteAllAlert] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<{id: string, name: string} | null>(null);

  const completedSessions = sortedSessions.filter((s) => s.isComplete);
  const activeSessions = sortedSessions.filter((s) => !s.isComplete);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleDelete = (id: string, name: string) => {
    setSessionToDelete({ id, name });
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const confirmDeleteAll = () => {
    deleteAllSessions();
    setShowDeleteAllAlert(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        <BrandButton 
          style={{ width: 44, height: 44 }}
          borderRadius={14} 
          color="#150428"
          highlight="rgba(255,255,255,0.1)"
          shadow="rgba(0,0,0,0.5)"
          glowColor="rgba(0,0,0,0.3)"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </BrandButton>
        <Text style={styles.heading}>Game History</Text>
        
        {state.sessions.length > 0 && (
          <BrandButton
            onPress={() => setShowDeleteAllAlert(true)}
            color="#FF2D78"
            shadow="#C2004D"
            highlight="#FF70A5"
            borderRadius={12}
            style={{ width: 40, height: 40, marginRight: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </BrandButton>
        )}
        
        <NeuTrench color="rgba(255,255,255,0.1)" borderRadius={10} padding={4} style={styles.countBadge}>
          <Text style={styles.countText}>{state.sessions.length}</Text>
        </NeuTrench>
      </View>

      {state.sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="game-controller-outline" size={56} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>No Games Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first game to see your history here
          </Text>
          <BrandButton
            color="#00F5A0"
            highlight="#54FFC9"
            shadow="#00D289"
            glowColor="rgba(0, 245, 160, 0.4)"
            borderRadius={14}
            onPress={() => router.replace("/(tabs)")}
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={styles.emptyBtnText}>Choose a Game</Text>
          </BrandButton>
        </View>
      )}

      {activeSessions.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Active</Text>
          {activeSessions.map((s) => (
            <Pressable
              key={s.id}
              onPress={() =>
                router.push({ pathname: "/game/[id]", params: { id: s.id } })
              }
              onLongPress={() => handleDelete(s.id, s.gameName)}
              style={{ marginBottom: 12 }}
            >
              <PolymerCard 
                color={s.gameColor + "CC"} 
                borderRadius={24} 
                padding={18} 
                style={styles.sessionPolyCard}
              >
                <View style={styles.sessionInner}>
                  <View
                    style={[styles.sessionColorBar, { backgroundColor: s.gameColor }]}
                  />
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionTop}>
                      <Text style={styles.sessionGame}>{s.gameName}</Text>
                      <NeuTrench color="rgba(0,245,160,0.2)" borderRadius={8} padding={2} style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </NeuTrench>
                    </View>
                    <Text style={styles.sessionMeta}>
                      Round {s.currentRound} · {s.players.length} players
                    </Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(s.startedAt)}
                    </Text>
                    <View style={styles.playerChips}>
                      {s.players.map((p) => (
                        <NeuTrench key={p.id} color="rgba(0,0,0,0.15)" borderRadius={8} padding={4} style={styles.playerChip}>
                          <View
                            style={[styles.chipDot, { backgroundColor: p.color }]}
                          />
                          <Text style={styles.chipName}>{p.name}</Text>
                        </NeuTrench>
                      ))}
                    </View>
                  </View>
                  <View style={styles.sessionRight}>
                    <BrandButton
                      onPress={() => handleDelete(s.id, s.gameName)}
                      color="rgba(0,0,0,0.2)"
                      shadow="rgba(0,0,0,0.4)"
                      highlight="rgba(255,255,255,0.05)"
                      borderRadius={12}
                      style={styles.cardTrashBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.4)" />
                    </BrandButton>
                    <Feather
                      name="chevron-right"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                    />
                  </View>
                </View>
              </PolymerCard>
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
              onPress={() =>
                router.push({ pathname: "/results/[id]", params: { id: s.id } })
              }
              onLongPress={() => handleDelete(s.id, s.gameName)}
              style={{ marginBottom: 12 }}
            >
              <PolymerCard 
                color={s.gameColor + "CC"} 
                borderRadius={24} 
                padding={18} 
                style={styles.sessionPolyCard}
              >
                <View style={styles.sessionInner}>
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
                    <Text style={[styles.sessionMeta, { color: "#FFFFFF" }]}>
                      {s.currentRound - 1} rounds · {s.players.length} players
                      {s.endedAt
                        ? ` · ${formatDuration(s.endedAt - s.startedAt)}`
                        : ""}
                    </Text>
                    <NeuTrench color="rgba(0,0,0,0.15)" borderRadius={10} padding={2} style={styles.winnerWell}>
                      <Text style={styles.winnerLabel}>Winner:</Text>
                      <Text style={[styles.winnerName, { color: s.gameColor }]}>
                        {s.winnerName}
                      </Text>
                    </NeuTrench>
                  </View>
                  <View style={styles.sessionRight}>
                    <BrandButton
                      onPress={() => handleDelete(s.id, s.gameName)}
                      color="rgba(0,0,0,0.2)"
                      shadow="rgba(0,0,0,0.4)"
                      highlight="rgba(255,255,255,0.05)"
                      borderRadius={12}
                      style={styles.cardTrashBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.4)" />
                    </BrandButton>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color="rgba(255,255,255,0.25)"
                    />
                  </View>
                </View>
              </PolymerCard>
            </Pressable>
          ))}
        </View>
      )}

      {state.sessions.length > 0 && (
        <Text style={styles.longPressHint}>
          Long-press any session to delete
        </Text>
      )}

      <PolymerAlert
        visible={!!sessionToDelete}
        title="Delete Game?"
        message={`Remove this ${sessionToDelete?.name} session from history?`}
        confirmText="Delete"
        type="danger"
        onConfirm={confirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />

      <PolymerAlert
        visible={showDeleteAllAlert}
        title="Clear All History?"
        message="Are you sure? This will permanently delete EVERY game in your history."
        confirmText="Clear All"
        type="danger"
        onConfirm={() => {
          confirmDeleteAll();
        }}
        onCancel={() => setShowDeleteAllAlert(false)}
      />
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
  sessionPolyCard: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sessionInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionGame: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 17,
    color: "#FFFFFF",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00F5A0",
  },
  liveText: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    color: "#00F5A0",
    letterSpacing: 1.5,
  },
  sessionMeta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  sessionDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
  },
  playerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  winnerWell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  winnerLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  winnerName: {
    fontFamily: "Inter_900Black",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  longPressHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    paddingVertical: 12,
  },
  sessionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTrashBtn: {
    width: 32,
    height: 32,
  },
});
