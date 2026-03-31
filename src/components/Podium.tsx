import { Student, PokemonData, getEvolutionStage, TYPE_COLORS } from '@/lib/types';
import { PlayerBattleStats, getStatusEmoji, getStatusLabel } from '@/lib/battleSystem';

interface Props {
  students: Student[];
  pokemonMap: Map<string, PokemonData>;
  battleStats: Map<string, PlayerBattleStats>;
  onSelect: (student: Student) => void;
}

const GLOW_CLASSES: Record<string, string> = {
  fire: 'glow-fire', water: 'glow-water', grass: 'glow-grass', electric: 'glow-electric',
  psychic: 'glow-psychic', ice: 'glow-ice', dragon: 'glow-dragon', dark: 'glow-dark',
  fairy: 'glow-fairy', normal: 'glow-normal', fighting: 'glow-fighting', flying: 'glow-flying',
  poison: 'glow-poison', ground: 'glow-ground', rock: 'glow-rock', bug: 'glow-bug',
  ghost: 'glow-ghost', steel: 'glow-steel',
};

export function Podium({ students, pokemonMap, battleStats, onSelect }: Props) {
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

  const heights = ['', 'h-44', 'h-32', 'h-24'];
  const sizes = ['', 'w-36 h-36', 'w-28 h-28', 'w-28 h-28'];

  return (
    <section className="mb-12">
      <h2 className="font-pixel text-center text-lg md:text-2xl text-primary mb-2 tracking-wider">
        ⚔️ ARENA
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8">Os campeões do momento</p>

      <div className="flex items-end justify-center gap-4 md:gap-8">
        {order.map((student, i) => {
          const pos = positions[i];
          const sprite = getSprite(student);
          const typeClass = TYPE_COLORS[student.type] || 'type-normal';
          const glowClass = GLOW_CLASSES[student.type] || '';
          const stats = battleStats.get(student.name);

          return (
            <div
              key={student.name}
              className="flex flex-col items-center cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${i * 0.15}s` }}
              onClick={() => onSelect(student)}
            >
              {/* Sprite */}
              <div className={`relative mb-3 ${pos === 1 ? 'animate-float' : ''}`}>
                {pos === 1 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-3xl">👑</div>
                )}
                <div className={`rounded-full p-2 border-2 ${glowClass} bg-card/50`}>
                  {sprite ? (
                    <img
                      src={sprite}
                      alt={student.pokemon}
                      className={`${sizes[pos]} object-contain drop-shadow-lg transition-transform group-hover:scale-110`}
                    />
                  ) : (
                    <div className={`${sizes[pos]} rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground`}>
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-2">
                <p className="font-bold text-sm md:text-base truncate max-w-[120px]">{student.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${typeClass}`}>
                  {student.type}
                </span>
                <p className="font-pixel text-xs mt-1 text-primary">{student.totalScore} pts</p>
                {stats && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStatusEmoji(stats.status)} {stats.wins}V / {stats.losses}D
                  </p>
                )}
              </div>

              {/* Pedestal */}
              <div className={`${heights[pos]} w-24 md:w-32 rounded-t-xl glass-card flex items-center justify-center relative overflow-hidden border-t-2 ${glowClass}`}>
                {pos === 1 && <div className="absolute inset-0 animate-shine" />}
                <span className="font-pixel text-2xl drop-shadow-md relative z-10">
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
