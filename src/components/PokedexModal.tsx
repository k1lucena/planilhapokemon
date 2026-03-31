import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  student: Student | null;
  pokemonData?: PokemonData;
  open: boolean;
  onClose: () => void;
}

export function PokedexModal({ student, pokemonData, open, onClose }: Props) {
  if (!student) return null;

  const stage = getEvolutionStage(student.totalScore);
  const { progress, nextThreshold, currentThreshold } = getProgressToNextEvolution(student.totalScore);
  const typeClass = TYPE_COLORS[student.type] || 'type-normal';

  const evolutions = pokemonData?.evolutions || [];
  const stageLabels = ['Base', 'Evolução 1', 'Evolução Final'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-4 border-primary/30 bg-gradient-to-b from-card to-muted">
        <DialogHeader>
          <DialogTitle className="font-pixel text-center text-primary text-lg">
            📖 Pokédex
          </DialogTitle>
        </DialogHeader>

        {/* Header info */}
        <div className="text-center">
          <h3 className="text-xl font-bold">{student.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${typeClass}`}>
            {student.type}
          </span>
          <p className="font-pixel text-2xl text-primary mt-2">{student.totalScore} pts</p>
        </div>

        {/* Evolution chain */}
        <div className="mt-4">
          <h4 className="font-bold text-sm text-muted-foreground mb-3 text-center">Cadeia de Evolução</h4>
          <div className="flex items-center justify-center gap-2">
            {evolutions.map((evo, i) => {
              const isActive = i === Math.min(stage, evolutions.length - 1);
              const isUnlocked = i <= stage;

              return (
                <div key={evo.name} className="flex items-center">
                  <div className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    isActive ? 'bg-primary/10 ring-2 ring-primary scale-110' : isUnlocked ? 'opacity-80' : 'opacity-30 grayscale'
                  }`}>
                    <img
                      src={evo.sprite}
                      alt={evo.name}
                      className="w-20 h-20 object-contain"
                    />
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
        </div>

        {/* Progress */}
        <div className="mt-4">
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

        {/* Tasks table */}
        <div className="mt-4">
          <h4 className="font-bold text-sm text-muted-foreground mb-2">Pontuação por Tarefa</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.tasks.map((task, i) => (
                <TableRow key={i}>
                  <TableCell className="capitalize">{task.name}</TableCell>
                  <TableCell className="text-right font-bold">{task.score}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-primary/30">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-pixel text-primary">{student.totalScore}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
