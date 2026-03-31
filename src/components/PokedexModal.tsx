import { Student, PokemonData, getEvolutionStage, getProgressToNextEvolution, TYPE_COLORS, TYPE_LABELS, calculateGrades, getGradeColor, getGradeBg } from '@/lib/types';
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
  const grades = calculateGrades(student.tasks);

  const actividades1 = student.tasks.slice(0, 5);
  const actividades2 = student.tasks.slice(5, 10);
  const projetoFinal = student.tasks[10];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-center text-lg font-bold">
            {student.name}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${typeClass}`}>
            {typeLabel}
          </span>
          <p className="font-pixel text-2xl text-primary mt-2">{student.totalScore} pts</p>
          
          {/* Grade summary */}
          <div className="flex justify-center gap-4 mt-3">
            {[
              { label: 'N1', value: grades.nota1 },
              { label: 'N2', value: grades.nota2 },
              { label: 'N3', value: grades.nota3 },
              { label: 'Média', value: grades.media },
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
            <TabsTrigger value="grades">Notas</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            {/* N1 - Atividades 01-05 */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-bold">N1 — Atividades 01-05</span>
                <span className={`font-bold text-sm ${getGradeColor(grades.nota1)}`}>{grades.nota1} pts</span>
              </div>
              <div className="divide-y divide-border">
                {actividades1.map((task, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-muted-foreground">{task.name}</span>
                    <span className="font-bold text-sm">{task.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* N2 - Atividades 06-10 */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-bold">N2 — Atividades 06-10</span>
                <span className={`font-bold text-sm ${getGradeColor(grades.nota2)}`}>{grades.nota2} pts</span>
              </div>
              <div className="divide-y divide-border">
                {actividades2.map((task, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-muted-foreground">{task.name}</span>
                    <span className="font-bold text-sm">{task.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* N3 - Projeto Final */}
            {projetoFinal && (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-bold">N3 — Projeto Final</span>
                  <span className={`font-bold text-sm ${getGradeColor(grades.nota3)}`}>{grades.nota3} pts</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{projetoFinal.name}</span>
                  <span className="font-bold text-sm">{projetoFinal.score}</span>
                </div>
              </div>
            )}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
