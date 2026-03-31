import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS, TYPE_LABELS } from '@/lib/types';
import { PlayerBattleStats, getStatusEmoji, getStatusLabel } from '@/lib/battleSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  student: Student | null;
  pokemonData?: PokemonData;
  battleStats?: PlayerBattleStats;
  open: boolean;
  onClose: () => void;
}

export function PokedexModal({ student, pokemonData, battleStats, open, onClose }: Props) {
  if (!student) return null;

  const stage = getEvolutionStage(student.totalScore);
  const { progress, nextThreshold, currentThreshold } = getProgressToNextEvolution(student.totalScore);
  const typeClass = TYPE_COLORS[student.type] || 'type-normal';
  const typeLabel = TYPE_LABELS[student.type] || student.type;
  const evolutions = pokemonData?.evolutions || [];
  const stageLabels = ['Base', 'Evolução 1', 'Evolução Final'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-2 border-[hsl(var(--pokedex-red)/0.4)] bg-card overflow-hidden">
        <DialogHeader className="pokedex-modal-header pb-3 pt-2 -mx-6 -mt-6 px-6 pt-6 mb-2">
          <div className="flex items-center justify-center gap-3">
            <div className="pokedex-lens" style={{ width: 24, height: 24 }} />
            <DialogTitle className="font-pixel text-center text-primary text-sm">
              📖 POKÉDEX
            </DialogTitle>
            <div className="flex gap-1">
              <div className="pokedex-led pokedex-led-red" style={{ width: 7, height: 7 }} />
              <div className="pokedex-led pokedex-led-yellow" style={{ width: 7, height: 7 }} />
              <div className="pokedex-led pokedex-led-green" style={{ width: 7, height: 7 }} />
            </div>
          </div>
        </DialogHeader>

        <div className="text-center">
          <h3 className="text-xl font-bold">{student.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${typeClass}`}>
            {typeLabel}
          </span>
          <p className="font-pixel text-2xl text-primary mt-2">{student.totalScore} pts</p>
          {battleStats && (
            <p className="text-sm text-muted-foreground mt-1">
              {getStatusEmoji(battleStats.status)} {getStatusLabel(battleStats.status)} — ⚔️ {battleStats.wins}V / {battleStats.losses}D
            </p>
          )}
        </div>

        <Tabs defaultValue="evolution" className="mt-4">
          <TabsList className="w-full justify-center">
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="battles">Batalhas</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {evolutions.map((evo, i) => {
                const isActive = i === Math.min(stage, evolutions.length - 1);
                const isUnlocked = i <= stage;
                return (
                  <div key={evo.name} className="flex items-center">
                    <div className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      isActive ? 'bg-primary/10 ring-2 ring-primary scale-110' : isUnlocked ? 'opacity-80' : 'opacity-30 grayscale'
                    }`}>
                      <img src={evo.sprite} alt={evo.name} className="w-20 h-20 object-contain" />
                      <p className="text-xs font-bold capitalize mt-1">{evo.name}</p>
                      <p className="text-xs text-muted-foreground">{stageLabels[i] || `Forma ${i + 1}`}</p>
                      {isActive && <Badge className="mt-1 text-xs">Atual</Badge>}
                    </div>
                    {i < evolutions.length - 1 && (
                      <span className="text-muted-foreground text-lg mx-1">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <h4 className="font-bold text-sm text-muted-foreground mb-2">Progresso</h4>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentThreshold} pts</span>
                {stage < 2 ? (
                  <span>{nextThreshold} pts (próxima evolução)</span>
                ) : (
                  <span>Evolução máxima! ⭐</span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-2">
              {student.tasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="capitalize text-sm">{task.name}</span>
                  <span className="font-bold text-sm text-primary">{task.score} pts</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                <span className="font-bold text-sm">Total</span>
                <span className="font-pixel text-primary">{student.totalScore} pts</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="battles">
            {battleStats && battleStats.recentBattles.length > 0 ? (
              <div className="space-y-2">
                {battleStats.recentBattles.map((b, i) => {
                  const oppTypeLabel = TYPE_LABELS[b.opponentType] || b.opponentType;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        b.won ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">vs {b.opponentName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {b.opponentPokemon} ({oppTypeLabel})
                          {b.hadAdvantage && ' • Vantagem de tipo!'}
                          {b.hadDisadvantage && ' • Desvantagem de tipo'}
                        </p>
                      </div>
                      <span className={`font-bold text-sm ${b.won ? 'text-green-400' : 'text-red-400'}`}>
                        {b.won ? '✅ Vitória' : '❌ Derrota'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">Sem batalhas registradas</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
