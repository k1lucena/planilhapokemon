import { useEffect, useState, useCallback, useRef } from 'react';
import { EvolutionEvent } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Button } from '@/components/ui/button';

interface EvolutionAnimationProps {
  event: EvolutionEvent;
  onComplete: () => void;
}

// Generate 8-bit evolution sound using Web Audio API
function playEvolutionSound(audioCtxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'square') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Rising arpeggio
    const notes = [262, 330, 392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, i * 0.12, 0.2, 'square');
    });

    // Sparkle effect
    playTone(1318, 0.9, 0.3, 'sine');
    playTone(1568, 1.0, 0.3, 'sine');
    playTone(2093, 1.1, 0.5, 'sine');
  } catch {
    // Audio not available
  }
}

export function EvolutionAnimation({ event, onComplete }: EvolutionAnimationProps) {
  const [phase, setPhase] = useState<'old' | 'flash' | 'new' | 'done'>('old');
  const { pokemonMap } = usePokemonData([event.pokemon]);
  const pokemonData = pokemonMap.get(event.pokemon);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const oldSprite = pokemonData?.evolutions?.[event.oldStage]?.sprite || pokemonData?.sprite || '';
  const newSprite = pokemonData?.evolutions?.[event.newStage]?.sprite || pokemonData?.sprite || '';

  const skip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('flash');
      playEvolutionSound(audioCtxRef);
    }, 800);
    const t2 = setTimeout(() => setPhase('new'), 1600);
    const t3 = setTimeout(() => setPhase('done'), 2800);
    const t4 = setTimeout(onComplete, 3500);
    timersRef.current = [t1, t2, t3, t4];
    return () => timersRef.current.forEach(clearTimeout);
  }, [onComplete]);

  // ESC or Space to skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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

        {/* Skip button */}
        <div className="absolute bottom-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={skip}
            className="text-muted-foreground hover:text-foreground text-xs gap-1"
          >
            Pular (ESC)
          </Button>
        </div>
      </div>
    </div>
  );
}
