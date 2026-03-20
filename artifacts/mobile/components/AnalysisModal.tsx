import React, { useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, G } from 'react-native-svg';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { GameSession } from '@/context/GameContext';
import { useSessionAnalysis } from '@/hooks/useSessionAnalysis';
import { PolymerCard, NeuTrench, NeuButton } from './PolymerCard';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  session: GameSession;
}

export function AnalysisModal({ visible, onClose, session }: AnalysisModalProps) {
  const insets = useSafeAreaInsets();
  const { roasts, stats, chartData } = useSessionAnalysis(session);

  // Animation State
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  }, [onClose]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
      backdropOpacity.value = interpolate(translateY.value, [0, 400], [1, 0], 'clamp');
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 500) {
        handleDismiss();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  // Entrance Animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 120 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const maxScore = useMemo(() => {
    let max = 10;
    chartData.forEach(p => {
      p.data.forEach(d => { if (d.score > max) max = d.score; });
    });
    return max * 1.1;
  }, [chartData]);

  const renderChart = () => {
    if (session.currentRound <= 1) return null;

    const chartHeight = 150;
    const chartWidth = width - 64;
    const rounds = session.currentRound - 1;
    const stepX = chartWidth / (rounds > 1 ? rounds - 1 : 1);

    return (
      <NeuTrench color="#150428" borderRadius={24} padding={16} style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>SCORE TRENDS</Text>
        <View style={{ height: chartHeight + 20 }}>
          <Svg height={chartHeight} width={chartWidth}>
            {chartData.map((p, pIdx) => {
              const points = p.data.map((d, i) => {
                const x = i * stepX;
                const y = chartHeight - (d.score / maxScore) * chartHeight;
                return `${x},${y}`;
              }).join(' ');

              return (
                <G key={p.playerId}>
                  <Polyline
                    points={points}
                    fill="none"
                    stroke={p.playerColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                  />
                  {p.data.map((d, i) => (
                    <Circle
                      key={i}
                      cx={i * stepX}
                      cy={chartHeight - (d.score / maxScore) * chartHeight}
                      r="4"
                      fill={p.playerColor}
                    />
                  ))}
                </G>
              );
            })}
          </Svg>
        </View>
        <View style={styles.chartLabels}>
          {Array.from({ length: rounds }).map((_, i) => (
            <Text key={i} style={styles.chartLabelText}>R{i+1}</Text>
          ))}
        </View>
      </NeuTrench>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={{ flex: 1 }} onPress={handleDismiss} />
          </Animated.View>

          <Animated.View 
            style={[styles.modalContent, animatedStyle]}
          >
            <PolymerCard 
              color="#1A0533" 
              borderRadius={32} 
              padding={0} 
              style={styles.sheetContent}
            >
              <GestureDetector gesture={gesture}>
                <View style={styles.gestureHeader}>
                  <View style={styles.grabBarContainer}>
                    <View style={styles.grabBar} />
                  </View>
                  
                  <View style={styles.header}>
                    <View>
                      <Text style={styles.headerTitle}>ROAST ROOM</Text>
                      <Text style={styles.headerSub}>Real-time metrics & emotional damage</Text>
                    </View>
                    <NeuButton 
                      size={40} 
                      borderRadius={12} 
                      color="#150428" 
                      onPress={handleDismiss}
                    >
                      <Ionicons name="close" size={20} color="#FFF" />
                    </NeuButton>
                  </View>
                </View>
              </GestureDetector>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
              >
                {renderChart()}

                <Text style={styles.sectionTitle}>THE ROASTS</Text>
                <View style={styles.roastList}>
              {roasts.length === 0 ? (
                <Text style={styles.emptyText}>Not enough data to roast yet. Play more rounds!</Text>
              ) : (
                roasts.map((roast, i) => (
                  <Animated.View 
                    key={i} 
                  >
                    <PolymerCard color="rgba(255, 71, 87, 0.08)" borderRadius={16} padding={16} style={styles.roastCard}>
                      <MaterialCommunityIcons name="fire" size={18} color="#FF4757" />
                      <Text style={styles.roastText}>{roast}</Text>
                    </PolymerCard>
                  </Animated.View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>PLAYER TEAR SHEETS</Text>
            <View style={styles.statsGrid}>
              {session.players.map((p, i) => {
                const s = stats[p.id];
                return (
                  <View 
                    key={p.id}
                  >
                    <NeuTrench color="#150428" borderRadius={20} padding={16} style={styles.playerStatCard}>
                      <View style={styles.playerHeader}>
                        <View style={[styles.playerDot, { backgroundColor: p.color }]} />
                        <Text style={styles.playerName}>{p.name}</Text>
                      </View>
                      
                      <View style={styles.miniStats}>
                        <View style={styles.miniStat}>
                          <Text style={styles.miniStatVal}>{Math.round((s?.actionDensity || 0) * 100)}%</Text>
                          <Text style={styles.miniStatLab}>Actions</Text>
                        </View>
                        <View style={styles.miniStat}>
                          <Text style={styles.miniStatVal}>{s?.caughtCount || 0}</Text>
                          <Text style={styles.miniStatLab}>Caught</Text>
                        </View>
                        <View style={styles.miniStat}>
                          <Text style={styles.miniStatVal}>{Math.round(s?.volatility || 0)}</Text>
                          <Text style={styles.miniStatLab}>Swing</Text>
                        </View>
                      </View>
                    </NeuTrench>
                  </View>
                );
              })}
            </View>
              </ScrollView>
            </PolymerCard>
          </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: "flex-end" 
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    height: "94%",
    backgroundColor: "transparent",
  },
  sheetContent: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  gestureHeader: {
    backgroundColor: "transparent",
    paddingTop: 8,
  },
  grabBarContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  grabBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 24,
    color: '#00F5A0',
    letterSpacing: 1,
  },
  headerSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  sectionTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
    marginTop: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  chartContainer: {
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
    borderRadius: 24,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
  },
  roastList: {
    gap: 12,
    marginBottom: 32,
  },
  roastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
    marginBottom: 12,
  },
  roastText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFBBC1',
    flex: 1,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  statsGrid: {
    gap: 12,
  },
  playerStatCard: {
    marginBottom: 4,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  playerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  playerName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    color: '#FFF',
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatVal: {
    fontFamily: 'Inter_900Black',
    fontSize: 14,
    color: '#FFF',
  },
  miniStatLab: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
  },
});
