import React, { useMemo } from 'react';
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
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, G } from 'react-native-svg';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  SlideInDown 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GameSession } from '@/context/GameContext';
import { useSessionAnalysis } from '@/hooks/useSessionAnalysis';
import { NeuTrench } from './PolymerCard';

const { width } = Dimensions.get('window');

interface AnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  session: GameSession;
}

export function AnalysisModal({ visible, onClose, session }: AnalysisModalProps) {
  const insets = useSafeAreaInsets();
  const { roasts, stats, chartData } = useSessionAnalysis(session);

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
      <View style={styles.chartContainer}>
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
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <Animated.View 
          entering={SlideInDown.springify().damping(25).stiffness(120)}
          style={[styles.modalContent, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>ROAST ROOM</Text>
              <Text style={styles.headerSub}>Real-time metrics & emotional damage</Text>
            </View>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
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
                    entering={FadeInRight.delay(i * 100)}
                    style={styles.roastCard}
                  >
                    <MaterialCommunityIcons name="fire" size={18} color="#FF4757" />
                    <Text style={styles.roastText}>{roast}</Text>
                  </Animated.View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>PLAYER TEAR SHEETS</Text>
            <View style={styles.statsGrid}>
              {session.players.map((p, i) => {
                const s = stats[p.id];
                return (
                  <Animated.View 
                    key={p.id}
                    entering={FadeInDown.delay(i * 100)}
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
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(21, 4, 40, 0.9)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
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
  chartSvg: {
    height: 150,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    marginLeft: -3,
    marginTop: -3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
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
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
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
