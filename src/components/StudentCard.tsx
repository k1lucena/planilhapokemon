import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS, TYPE_LABELS, calculateGrades, getGradeColor } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface Props {
  student: Student;
  pokemonData?: PokemonData;
  onClick: () => void;
  index?: number;
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
        <div className="w-20 h-20 mb-2 relative">
          {sprite ? (
            <img src={sprite} alt={currentName} className="w-full h-full object-contain drop-shadow-md" />
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

        {/* Grades - 4 columns */}
        <div className="w-full grid grid-cols-4 gap-1 mb-2 text-[10px]">
          {[
            { label: 'N1', value: grades.nota1 },
            { label: 'N2', value: grades.nota2 },
            { label: 'N3', value: grades.nota3 },
            { label: 'Méd', value: grades.media },
          ].map(g => (
            <div key={g.label} className="rounded bg-muted/50 py-1 px-0.5">
              <span className="text-muted-foreground">{g.label}</span>
              <p className={`font-bold text-xs ${getGradeColor(g.value)}`}>{g.value}</p>
            </div>
          ))}
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
