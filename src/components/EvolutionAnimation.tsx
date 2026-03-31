import { useEffect, useState } from 'react';
import { EvolutionEvent } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';

interface EvolutionAnimationProps {
  event: EvolutionEvent;
  onComplete: () => void;
}

export function EvolutionAnimation({ event, onComplete }: EvolutionAnimationProps) {
  const [phase, setPhase] = useState<'old' | 'flash' | 'new' | 'done'>('old');
  const { pokemonMap } = usePokemonData([event.pokemon]);
  const pokemonData = pokemonMap.get(event.pokemon);

  const oldSprite = pokemonData?.evolutions?.[event.oldStage]?.sprite || pokemonData?.sprite || '';
  const newSprite = pokemonData?.evolutions?.[event.newStage]?.sprite || pokemonData?.sprite || '';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flash'), 800);
    const t2 = setTimeout(() => setPhase('new'), 1600);
    const t3 = setTimeout(() => setPhase('done'), 2800);
    const t4 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        {/* Old sprite */}
        <div
          className={`transition-all duration-700 ${
            phase === 'old'
              ? 'scale-100 opacity-100'
              : phase === 'flash'
              ? 'scale-150 opacity-0 blur-sm'
              : 'scale-0 opacity-0'
          }`}
        >
          {oldSprite && (
            <img
              src={oldSprite}
              alt="old pokemon"
              className="w-40 h-40 md:w-56 md:h-56 object-contain pixelated drop-shadow-lg"
            />
          )}
        </div>

        {/* Flash */}
        {phase === 'flash' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-secondary/60 animate-ping" />
            <div className="absolute w-48 h-48 rounded-full bg-primary/40 animate-pulse" />
          </div>
        )}

        {/* New sprite */}
        <div
          className={`absolute transition-all duration-700 ${
            phase === 'new' || phase === 'done'
              ? 'scale-100 opacity-100'
              : 'scale-50 opacity-0'
          }`}
        >
          {newSprite && (
            <img
              src={newSprite}
              alt="new pokemon"
              className="w-48 h-48 md:w-64 md:h-64 object-contain pixelated drop-shadow-[0_0_30px_hsl(var(--secondary)/0.6)]"
            />
          )}
        </div>

        {/* Text */}
        <div
          className={`absolute bottom-1/4 transition-all duration-500 ${
            phase === 'new' || phase === 'done'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="font-pixel text-xl md:text-3xl text-secondary tracking-wider text-center drop-shadow-[0_0_20px_hsl(var(--secondary)/0.8)]">
            ✨ EVOLUIU! ✨
          </p>
          <p className="text-center text-muted-foreground text-sm mt-2 font-medium">
            {event.studentName}
          </p>
        </div>
      </div>
    </div>
  );
}
