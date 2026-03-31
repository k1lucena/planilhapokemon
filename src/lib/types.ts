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
  animatedSprite?: string;
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

export const TYPE_LABELS: Record<string, string> = {
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  poison: 'Veneno',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
};

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

export const STARTER_POKEMON = [
  { name: 'bulbasaur', type: 'grass', label: 'Bulbasaur' },
  { name: 'charmander', type: 'fire', label: 'Charmander' },
  { name: 'squirtle', type: 'water', label: 'Squirtle' },
] as const;

export interface StudentGrades {
  nota1: number;
  nota2: number;
  nota3: number;
  media: number;
}

export function calculateGrades(tasks: StudentTask[]): StudentGrades {
  const scores = tasks.map(t => t.score);
  const nota1 = scores.length >= 5 ? scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5 : 0;
  const nota2 = scores.length >= 10 ? scores.slice(5, 10).reduce((a, b) => a + b, 0) / 5 : 0;
  const nota3 = scores.length >= 11 ? scores[10] : 0;
  const media = (nota1 + nota2 + nota3) / 3;
  return { nota1: +nota1.toFixed(1), nota2: +nota2.toFixed(1), nota3: +nota3.toFixed(1), media: +media.toFixed(1) };
}

export function getGradeColor(grade: number): string {
  if (grade >= 7) return 'text-emerald-400';
  if (grade >= 5) return 'text-yellow-400';
  return 'text-red-400';
}

export function getGradeBg(grade: number): string {
  if (grade >= 7) return 'bg-emerald-500/15 border-emerald-500/30';
  if (grade >= 5) return 'bg-yellow-500/15 border-yellow-500/30';
  return 'bg-red-500/15 border-red-500/30';
}
