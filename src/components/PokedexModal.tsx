import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS, TYPE_LABELS, getMediaFromNotas, getGradeColor, getGradeBg } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const typeLabel = TYPE_LABELS[student.type] || student.type;
  const evolutions = pokemonData?.evolutions || [];
  const stageLabels = ['Base', 'Evolução 1', 'Evolução Final'];
  const media = getMediaFromNotas(student.nota1, student.nota2, student.nota3);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-center text-lg font-bold">{student.name}</DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${typeClass}`}>{typeLabel}</span>
          <p className="font-pixel text-2xl text-primary mt-2">{student.totalScore} pts</p>
          
          <div className="flex justify-center gap-4 mt-3">
            {[
              { label: 'N1', value: student.nota1 },
              { label: 'N2', value: student.nota2 },
              { label: 'N3', value: student.nota3 },
              { label: 'Média', value: media },
            ].map(g => (
              <div key={g.label} className={`px-3 py-2 rounded-lg border ${getGradeBg(g.value)}`}>
                <p className="text-xs text-muted-foreground">{g.label}</p>
                <p className={`text-lg font-bold ${getGradeColor(g.value)}`}>{g.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="grades" className="mt-4">
          <TabsList className="w-full justify-center">
            <TabsTrigger value="grades">Atividades</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-2">
            {student.tasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">{task.name}</span>
                <span className="font-bold text-sm">{task.score}</span>
              </div>
            ))}
          </TabsContent>

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
                    {i < evolutions.length - 1 && <span className="text-muted-foreground text-lg mx-1">→</span>}
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="font-bold text-sm text-muted-foreground mb-2">Progresso</h4>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentThreshold} pts</span>
                {stage < 2 ? <span>{nextThreshold} pts (próxima evolução)</span> : <span>Evolução máxima! ⭐</span>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
