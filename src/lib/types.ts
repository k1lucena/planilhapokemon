export interface StudentTask {
  name: string;
  score: number;
}

export interface Student {
  name: string;
  pokemon: string;
  type: string;
  tasks: StudentTask[];
  totalScore: number;
}

export interface PokemonEvolution {
  name: string;
  sprite: string;
}

export interface PokemonData {
  id: number;
  name: string;
  sprite: string;
  evolutions: PokemonEvolution[];
}

export function getEvolutionStage(score: number): number {
  if (score >= 200) return 2;
  if (score >= 100) return 1;
  return 0;
}

export function getProgressToNextEvolution(score: number): { progress: number; nextThreshold: number; currentThreshold: number } {
  if (score >= 200) return { progress: 100, nextThreshold: 200, currentThreshold: 200 };
  if (score >= 100) return { progress: ((score - 100) / 100) * 100, nextThreshold: 200, currentThreshold: 100 };
  return { progress: (score / 100) * 100, nextThreshold: 100, currentThreshold: 0 };
}

export const TYPE_COLORS: Record<string, string> = {
  fire: 'type-fire',
  water: 'type-water',
  grass: 'type-grass',
  electric: 'type-electric',
  psychic: 'type-psychic',
  ice: 'type-ice',
  dragon: 'type-dragon',
  dark: 'type-dark',
  fairy: 'type-fairy',
  normal: 'type-normal',
  fighting: 'type-fighting',
  flying: 'type-flying',
  poison: 'type-poison',
  ground: 'type-ground',
  rock: 'type-rock',
  bug: 'type-bug',
  ghost: 'type-ghost',
  steel: 'type-steel',
};
