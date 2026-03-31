import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  student: Student;
  pokemonData?: PokemonData;
  onClick: () => void;
}

export function StudentCard({ student, pokemonData, onClick }: Props) {
  const stage = getEvolutionStage(student.totalScore);
  const { progress } = getProgressToNextEvolution(student.totalScore);
  const typeClass = TYPE_COLORS[student.type] || 'type-normal';

  const sprite = pokemonData
    ? (pokemonData.evolutions[Math.min(stage, pokemonData.evolutions.length - 1)]?.sprite || pokemonData.sprite)
    : '';

  const currentName = pokemonData
    ? (pokemonData.evolutions[Math.min(stage, pokemonData.evolutions.length - 1)]?.name || pokemonData.name)
    : student.pokemon;

  const stageLabel = stage === 0 ? 'Base' : stage === 1 ? 'Evolução 1' : 'Evolução Final';

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/40 overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        {/* Sprite */}
        <div className="w-24 h-24 mb-3 relative">
          {sprite ? (
            <img
              src={sprite}
              alt={currentName}
              className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-3xl animate-pulse">?</div>
          )}
        </div>

        {/* Info */}
        <h3 className="font-bold text-sm truncate w-full">{student.name}</h3>
        <p className="text-xs text-muted-foreground capitalize mb-1">{currentName}</p>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${typeClass}`}>
          {student.type}
        </span>

        {/* Score */}
        <p className="font-pixel text-sm text-primary mb-1">{student.totalScore} pts</p>
        <span className="text-xs text-muted-foreground mb-2">{stageLabel}</span>

        {/* Progress */}
        <div className="w-full">
          <Progress value={progress} className="h-2" />
          {stage < 2 && (
            <p className="text-xs text-muted-foreground mt-1">
              {stage === 0 ? `${student.totalScore}/100` : `${student.totalScore}/200`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
