import { useEffect, useState, useRef, useCallback } from 'react';
import { EvolutionEvent } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';

interface EvolutionAnimationProps {
  event: EvolutionEvent;
  onComplete: () => void;
}

function playEvolutionSound(): { stop: () => void } {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const duration = 0.15;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * duration);
      osc.stop(ctx.currentTime + (i + 1) * duration);
    });

    // Fanfare chord at the end
    const chordStart = notes.length * duration;
    [523.25, 659.25, 783.99].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + chordStart);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + chordStart + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + chordStart);
      osc.stop(ctx.currentTime + chordStart + 0.8);
    });

    return { stop: () => ctx.close() };
  } catch {
    return { stop: () => {} };
  }
}

export function EvolutionAnimation({ event, onComplete }: EvolutionAnimationProps) {
  const [phase, setPhase] = useState<'old' | 'flash' | 'new' | 'done'>('old');
  const { pokemonMap } = usePokemonData([event.pokemon]);
  const pokemonData = pokemonMap.get(event.pokemon);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundRef = useRef<{ stop: () => void } | null>(null);

  const oldSprite = pokemonData?.evolutions?.[event.oldStage]?.sprite || pokemonData?.sprite || '';
  const newSprite = pokemonData?.evolutions?.[event.newStage]?.sprite || pokemonData?.sprite || '';

  const skip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    soundRef.current?.stop();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    soundRef.current = playEvolutionSound();

    const t1 = setTimeout(() => setPhase('flash'), 800);
    const t2 = setTimeout(() => setPhase('new'), 1600);
    const t3 = setTimeout(() => setPhase('done'), 2800);
    const t4 = setTimeout(onComplete, 3500);
    timersRef.current = [t1, t2, t3, t4];

    return () => {
      timersRef.current.forEach(clearTimeout);
      soundRef.current?.stop();
    };
  }, [onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') skip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

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

      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={skip}
        className="absolute bottom-8 right-8 gap-2 text-muted-foreground hover:text-foreground"
      >
        <SkipForward className="h-4 w-4" />
        Pular
      </Button>
    </div>
  );
}
