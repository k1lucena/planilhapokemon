import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface Props {
  students: Student[];
  pokemonMap: Map<string, PokemonData>;
  onSelect: (student: Student) => void;
}

export function Podium({ students, pokemonMap, onSelect }: Props) {
  const top3 = [...students].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  if (top3.length === 0) return null;

  const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const positions = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  function getSprite(student: Student) {
    const poke = pokemonMap.get(student.pokemon);
    if (!poke) return '';
    const stage = getEvolutionStage(student.totalScore);
    const idx = Math.min(stage, poke.evolutions.length - 1);
    return poke.evolutions[idx]?.sprite || poke.sprite;
  }

  const medalColors = ['', 'from-yellow-300 to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-800'];
  const heights = ['', 'h-40', 'h-28', 'h-20'];
  const sizes = ['', 'w-32 h-32', 'w-24 h-24', 'w-24 h-24'];

  return (
    <section className="mb-12">
      <h2 className="font-pixel text-center text-xl md:text-2xl text-primary mb-8 tracking-wider">
        🏆 PÓDIO
      </h2>
      <div className="flex items-end justify-center gap-4 md:gap-8">
        {order.map((student, i) => {
          const pos = positions[i];
          const sprite = getSprite(student);
          const typeClass = TYPE_COLORS[student.type] || 'type-normal';

          return (
            <div
              key={student.name}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onSelect(student)}
            >
              {/* Sprite */}
              <div className={`relative mb-2 ${pos === 1 ? 'animate-float' : ''}`}>
                {pos === 1 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">👑</div>
                )}
                {sprite ? (
                  <img
                    src={sprite}
                    alt={student.pokemon}
                    className={`${sizes[pos]} object-contain drop-shadow-lg transition-transform group-hover:scale-110`}
                  />
                ) : (
                  <div className={`${sizes[pos]} rounded-full bg-muted flex items-center justify-center text-2xl`}>?</div>
                )}
              </div>

              {/* Name & Score */}
              <div className="text-center mb-2">
                <p className="font-bold text-sm md:text-base truncate max-w-[120px]">{student.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${typeClass}`}>
                  {student.type}
                </span>
                <p className="font-pixel text-xs mt-1">{student.totalScore} pts</p>
              </div>

              {/* Pedestal */}
              <div className={`${heights[pos]} w-24 md:w-32 rounded-t-lg bg-gradient-to-t ${medalColors[pos]} flex items-center justify-center relative overflow-hidden`}>
                {pos === 1 && <div className="absolute inset-0 animate-shine" />}
                <span className="font-pixel text-2xl text-white drop-shadow-md relative z-10">
                  {pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
