import { useMemo } from 'react';
import { GameSession, Player } from '@/context/GameContext';

export interface PlayerStats {
  actionDensity: number;
  wildCount: number;
  caughtCount: number;
  volatility: number;
  avgFirstHalf: number;
  avgSecondHalf: number;
  isSuddenDipper: boolean;
  totalCards: number;
}

export function useSessionAnalysis(session: GameSession | null) {
  return useMemo(() => {
    if (!session) return { roasts: [], stats: {}, chartData: [] };

    const roasts: string[] = [];
    const stats: Record<string, PlayerStats> = {};
    const isUno = session.gameId.startsWith("uno");

    session.players.forEach(p => {
      // 1. Collect calculator-generated roasts
      Object.values(p.roundRoasts).forEach(roundRoasts => {
        roasts.push(...roundRoasts);
      });

      // 2. Perform Session-Wide Stats Analysis
      let totalActions = 0;
      let totalWilds = 0;
      let totalCards = 0;
      let caughtCount = 0;
      
      Object.values(p.roundMetadata).forEach(m => {
        if (m.counts) {
          totalActions += m.counts.action || 0;
          totalWilds += m.counts.wild || 0;
          totalCards += (m.counts.action || 0) + (m.counts.wild || 0) + (m.counts.number || 0);
        }
        if (m.caughtWithUno) {
          caughtCount++;
        }
      });

      // Volatility / Sudden Dip
      let avg1 = 0;
      let avg2 = 0;
      let isSuddenDipper = false;
      if (p.scores.length >= 2) {
        const mid = Math.floor(p.scores.length / 2);
        const firstHalf = p.scores.slice(0, mid);
        const secondHalf = p.scores.slice(mid);
        avg1 = firstHalf.length > 0 ? firstHalf.reduce((a,b)=>a+b,0) / firstHalf.length : 0;
        avg2 = secondHalf.length > 0 ? secondHalf.reduce((a,b)=>a+b,0) / secondHalf.length : 0;
        if (avg1 > 30 && avg2 < 10 && secondHalf.length >= 1) {
          isSuddenDipper = true;
        }
      }

      // Volatility (Variance)
      const mean = p.scores.reduce((a,b)=>a+b,0) / (p.scores.length || 1);
      const variance = p.scores.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / (p.scores.length || 1);

      stats[p.id] = {
        actionDensity: totalCards > 0 ? totalActions / totalCards : 0,
        wildCount: totalWilds,
        caughtCount: caughtCount,
        volatility: Math.sqrt(variance),
        avgFirstHalf: avg1,
        avgSecondHalf: avg2,
        isSuddenDipper,
        totalCards
      };

      // 3. Generate Specific Roasts based on Stats
      if (isUno) {
        const s = stats[p.id];
        if (s.actionDensity > 0.4) {
          roasts.push(`${p.name} the Action Addict: ${Math.round(s.actionDensity * 100)}% of their cards are Skips/Draws. 🃏`);
        }
        if (s.wildCount > 5) {
          roasts.push(`${p.name} the Wild Thing: Hoarding wilds like it's a job. 🌟`);
        }
        if (s.caughtCount > 0) {
          roasts.push(`${p.name} the Choker: Caught with Uno ${s.caughtCount}x. Absolute fumble. 🤡`);
        }
        if (s.isSuddenDipper) {
          roasts.push(`${p.name} the Sudden Dipper: Massive redemption arc in the works. 📈`);
        }
        if (s.volatility > 25) {
          roasts.push(`${p.name} the Chaos Agent: Scores are all over the place. 🌪️`);
        }
      }
    });

    // 4. Chart Data Generation (Cumulative scores)
    const chartData = session.players.map(p => {
      let cumulative = 0;
      const data = p.scores.map((s, i) => {
        cumulative += s;
        return { round: i + 1, score: cumulative };
      });
      return {
        playerId: p.id,
        playerName: p.name,
        playerColor: p.color,
        data
      };
    });

    return { 
      roasts: Array.from(new Set(roasts)).sort(() => 0.5 - Math.random()), 
      stats, 
      chartData 
    };
  }, [session]);
}
