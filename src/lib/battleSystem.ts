import { Student } from './types';

export type PlayerStatus = 'hot' | 'rising' | 'cold';

export interface BattleResult {
  opponentName: string;
  opponentPokemon: string;
  opponentType: string;
  opponentScore: number;
  won: boolean;
  hadAdvantage: boolean;
  hadDisadvantage: boolean;
  adjustedScore: number;
  opponentAdjustedScore: number;
}

export interface PlayerBattleStats {
  wins: number;
  losses: number;
  recentBattles: BattleResult[];
  status: PlayerStatus;
}

const TYPE_ADVANTAGES: Record<string, string[]> = {
  fire: ['grass', 'bug', 'ice', 'steel'],
  water: ['fire', 'ground', 'rock'],
  grass: ['water', 'ground', 'rock'],
  electric: ['water', 'flying'],
  psychic: ['fighting', 'poison'],
  fighting: ['normal', 'rock', 'ice', 'dark', 'steel'],
  dragon: ['dragon'],
  ice: ['grass', 'ground', 'flying', 'dragon'],
  ghost: ['psychic', 'ghost'],
  dark: ['psychic', 'ghost'],
  fairy: ['fighting', 'dragon', 'dark'],
  flying: ['grass', 'fighting', 'bug'],
  poison: ['grass', 'fairy'],
  ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
  rock: ['fire', 'ice', 'flying', 'bug'],
  bug: ['grass', 'psychic', 'dark'],
  steel: ['ice', 'rock', 'fairy'],
  normal: [],
};

function hasAdvantage(attackerType: string, defenderType: string): boolean {
  return TYPE_ADVANTAGES[attackerType]?.includes(defenderType) ?? false;
}

function simulateBattle(a: Student, b: Student): { aWins: boolean; aAdv: boolean; bAdv: boolean; aAdj: number; bAdj: number } {
  const aAdv = hasAdvantage(a.type, b.type);
  const bAdv = hasAdvantage(b.type, a.type);
  const aAdj = a.totalScore * (aAdv ? 1.1 : bAdv ? 0.9 : 1);
  const bAdj = b.totalScore * (bAdv ? 1.1 : aAdv ? 0.9 : 1);
  return { aWins: aAdj >= bAdj, aAdv, bAdv, aAdj, bAdj };
}

export function generateBattleResults(students: Student[]): Map<string, PlayerBattleStats> {
  const statsMap = new Map<string, PlayerBattleStats>();
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  students.forEach(s => {
    statsMap.set(s.name, { wins: 0, losses: 0, recentBattles: [], status: 'cold' });
  });

  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const a = students[i];
      const b = students[j];
      const { aWins, aAdv, bAdv, aAdj, bAdj } = simulateBattle(a, b);

      const statsA = statsMap.get(a.name)!;
      const statsB = statsMap.get(b.name)!;

      if (aWins) {
        statsA.wins++;
        statsB.losses++;
      } else {
        statsB.wins++;
        statsA.losses++;
      }

      statsA.recentBattles.push({
        opponentName: b.name,
        opponentPokemon: b.pokemon,
        opponentType: b.type,
        opponentScore: b.totalScore,
        won: aWins,
        hadAdvantage: aAdv,
        hadDisadvantage: bAdv,
        adjustedScore: aAdj,
        opponentAdjustedScore: bAdj,
      });

      statsB.recentBattles.push({
        opponentName: a.name,
        opponentPokemon: a.pokemon,
        opponentType: a.type,
        opponentScore: a.totalScore,
        won: !aWins,
        hadAdvantage: bAdv,
        hadDisadvantage: aAdv,
        adjustedScore: bAdj,
        opponentAdjustedScore: aAdj,
      });
    }
  }

  sorted.forEach((s, i) => {
    const stats = statsMap.get(s.name)!;
    const cutTop = Math.max(1, Math.floor(sorted.length * 0.25));
    const cutMid = Math.max(2, Math.floor(sorted.length * 0.6));
    
    if (i < cutTop) stats.status = 'hot';
    else if (i < cutMid) stats.status = 'rising';
    else stats.status = 'cold';
    
    stats.recentBattles = stats.recentBattles.slice(0, 5);
  });

  return statsMap;
}

export function getStatusEmoji(status: PlayerStatus): string {
  return status === 'hot' ? '🔥' : status === 'rising' ? '⚡' : '❄️';
}

export function getStatusLabel(status: PlayerStatus): string {
  return status === 'hot' ? 'Em alta' : status === 'rising' ? 'Subindo' : 'Estagnado';
}
