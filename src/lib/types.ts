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
  const n1 = tasks.find(t => t.name === 'N1')?.score ?? 0;
  const n2 = tasks.find(t => t.name === 'N2')?.score ?? 0;
  const n3 = tasks.find(t => t.name === 'N3')?.score ?? 0;
  const total = n1 + n2 + n3;
  return { nota1: +n1.toFixed(1), nota2: +n2.toFixed(1), nota3: +n3.toFixed(1), media: +total.toFixed(1) };
}

export function getGradeColor(grade: number): string {
  return 'text-foreground';
}

export function getGradeBg(grade: number): string {
  return 'bg-muted/50 border-border';
}
