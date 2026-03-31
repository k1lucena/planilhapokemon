import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS, TYPE_LABELS, calculateGrades, getGradeColor } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface Props {
  student: Student;
  pokemonData?: PokemonData;
  onClick: () => void;
}

const GLOW_CLASSES: Record<string, string> = {
  fire: 'glow-fire', water: 'glow-water', grass: 'glow-grass', electric: 'glow-electric',
  psychic: 'glow-psychic', ice: 'glow-ice', dragon: 'glow-dragon', dark: 'glow-dark',
  fairy: 'glow-fairy', normal: 'glow-normal', fighting: 'glow-fighting', flying: 'glow-flying',
  poison: 'glow-poison', ground: 'glow-ground', rock: 'glow-rock', bug: 'glow-bug',
  ghost: 'glow-ghost', steel: 'glow-steel',
};

export function StudentCard({ student, pokemonData, onClick }: Props) {
  const stage = getEvolutionStage(student.totalScore);
  const { progress } = getProgressToNextEvolution(student.totalScore);
  const typeClass = TYPE_COLORS[student.type] || 'type-normal';
  const glowClass = GLOW_CLASSES[student.type] || '';
  const typeLabel = TYPE_LABELS[student.type] || student.type;
  const grades = calculateGrades(student.tasks);

  const sprite = pokemonData
    ? (pokemonData.evolutions[Math.min(stage, pokemonData.evolutions.length - 1)]?.sprite || pokemonData.sprite)
    : '';

  const currentName = pokemonData
    ? (pokemonData.evolutions[Math.min(stage, pokemonData.evolutions.length - 1)]?.name || pokemonData.name)
    : student.pokemon;

  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className={`glass-card rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${glowClass} overflow-hidden animate-fade-in`}
      onClick={onClick}
    >
      <div className="p-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-3 relative">
          {sprite ? (
            <img
              src={sprite}
              alt={currentName}
              className="w-full h-full object-contain drop-shadow-md"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
              {initials}
            </div>
          )}
        </div>

        <h3 className="font-bold text-sm truncate w-full">{student.name}</h3>
        <p className="text-xs text-muted-foreground capitalize mb-1">{currentName}</p>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${typeClass}`}>
          {typeLabel}
        </span>

        <p className="font-pixel text-sm text-primary mb-2">{student.totalScore} pts</p>

        {/* Grades */}
        <div className="w-full grid grid-cols-3 gap-1 mb-2 text-xs">
          <div className="rounded bg-muted/50 py-1">
            <span className="text-muted-foreground">N1</span>
            <p className={`font-bold ${getGradeColor(grades.nota1)}`}>{grades.nota1}</p>
          </div>
          <div className="rounded bg-muted/50 py-1">
            <span className="text-muted-foreground">N2</span>
            <p className={`font-bold ${getGradeColor(grades.nota2)}`}>{grades.nota2}</p>
          </div>
          <div className="rounded bg-muted/50 py-1">
            <span className="text-muted-foreground">N3</span>
            <p className={`font-bold ${getGradeColor(grades.nota3)}`}>{grades.nota3}</p>
          </div>
        </div>

        <div className="w-full">
          <Progress value={progress} className="h-2" />
          {stage < 2 ? (
            <p className="text-xs text-muted-foreground mt-1">
              {stage === 0 ? `${student.totalScore}/100` : `${student.totalScore}/200`}
            </p>
          ) : (
            <p className="text-xs text-secondary mt-1">⭐ MÁX</p>
          )}
        </div>
      </div>
    </div>
  );
}
