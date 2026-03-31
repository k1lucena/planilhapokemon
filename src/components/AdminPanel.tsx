import { useState, useMemo } from 'react';
import { Student, TYPE_LABELS } from '@/lib/types';
import { StudentForm } from './StudentForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, UserPlus, RotateCcw, Download, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  onAddStudent: (student: { name: string; pokemon: string; type: string }) => void;
  onRemoveStudent: (name: string) => void;
  onUpdateStudent: (originalName: string, updates: Partial<Pick<Student, 'name' | 'pokemon' | 'type'>>) => void;
  onAddTask: (taskName: string) => void;
  onRemoveTask: (taskName: string) => void;
  onUpdateScore: (studentName: string, taskName: string, score: number) => void;
  onReset: () => void;
  onEvolveStudent: (studentName: string) => void;
  isLoading: boolean;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(students: Student[]) {
  if (students.length === 0) { toast.error('Nenhum aluno para exportar.'); return; }
  const taskNames = students[0]?.tasks.map(t => t.name) || [];
  const header = ['Nome', 'Pokémon', 'Tipo', 'Nota1', 'Nota2', 'Nota3', ...taskNames, 'Total'].join(',');
  const rows = students.map(s => {
    const tasks = taskNames.map(tn => {
      const t = s.tasks.find(task => task.name === tn);
      return t ? t.score : 0;
    });
    return [s.name, s.pokemon, s.type, s.nota1, s.nota2, s.nota3, ...tasks, s.totalScore].join(',');
  });
  downloadFile([header, ...rows].join('\n'), 'pokedex_alunos.csv', 'text/csv');
  toast.success('CSV exportado!');
}

function exportJson(students: Student[]) {
  if (students.length === 0) { toast.error('Nenhum aluno para exportar.'); return; }
  downloadFile(JSON.stringify(students, null, 2), 'pokedex_alunos.json', 'application/json');
  toast.success('JSON exportado!');
}

export function AdminPanel({
  open, onClose, students,
  onAddStudent, onRemoveStudent, onUpdateStudent,
  onAddTask, onRemoveTask, onUpdateScore,
  onReset, onEvolveStudent, isLoading,
}: AdminPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [taskScores, setTaskScores] = useState<Record<string, number>>({});

  const handleSelectStudent = (name: string) => {
    const s = students.find(st => st.name === name);
    if (s) {
      setSelectedStudent(name);
      const scores: Record<string, number> = {};
      s.tasks.forEach(t => { scores[t.name] = t.score; });
      setTaskScores(scores);
    }
  };

  const handleSaveTasks = () => {
    if (!selectedStudent) return;
    Object.entries(taskScores).forEach(([taskName, score]) => {
      onUpdateScore(selectedStudent, taskName, score);
    });
    toast.success(`Atividades de ${selectedStudent} salvas!`);
  };

  const handleAdd = (data: { name: string; pokemon: string; type: string }) => {
    onAddStudent(data);
    setShowForm(false);
  };

  const handleEdit = (data: { name: string; pokemon: string; type: string }) => {
    if (editingStudent) {
      onUpdateStudent(editingStudent.name, data);
      setEditingStudent(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b border-border">
          <SheetTitle className="font-pixel text-primary text-sm tracking-wider">⚙️ Gerenciar</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="grades" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 bg-muted/50">
            <TabsTrigger value="grades" className="text-xs flex-1">📝 Atividades</TabsTrigger>
            <TabsTrigger value="students" className="text-xs flex-1">👥 Alunos</TabsTrigger>
            <TabsTrigger value="data" className="text-xs flex-1">📤 Exportar</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* ACTIVITIES TAB */}
            <TabsContent value="grades" className="p-4 space-y-3 mt-0">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Selecione o aluno</Label>
                <Select value={selectedStudent} onValueChange={handleSelectStudent}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Escolha um aluno..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (() => {
                const student = students.find(s => s.name === selectedStudent);
                const totalScore = student?.totalScore || 0;
                const currentStage = totalScore >= 200 ? 2 : totalScore >= 100 ? 1 : 0;
                const isMaxStage = currentStage >= 2;

                return (
                  <div className="space-y-3">
                    {Object.entries(taskScores).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Nenhuma atividade encontrada.</p>
                    ) : (
                      Object.entries(taskScores).map(([taskName, score]) => (
                        <div key={taskName} className="flex items-center gap-3">
                          <Label className="text-sm flex-1 truncate">{taskName}</Label>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={score}
                            onChange={e => {
                              setTaskScores(prev => ({
                                ...prev,
                                [taskName]: Math.max(0, Number(e.target.value) || 0),
                              }));
                            }}
                            className="h-9 w-20 bg-background border-border text-center"
                          />
                        </div>
                      ))
                    )}

                    <Button onClick={handleSaveTasks} className="w-full gap-2" size="sm">
                      <Save className="h-4 w-4" /> Salvar Atividades
                    </Button>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Estágio atual: <span className="font-bold text-foreground">{currentStage}/2</span> · Pontuação: <span className="font-bold text-foreground">{totalScore}</span>
                      </p>
                      <Button
                        onClick={() => onEvolveStudent(selectedStudent)}
                        disabled={isMaxStage || isLoading}
                        variant="outline"
                        className="w-full gap-2"
                        size="sm"
                      >
                        <Zap className="h-4 w-4" />
                        {isMaxStage ? 'Estágio Máximo' : 'Evoluir Pokémon'}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            {/* STUDENTS TAB */}
            <TabsContent value="students" className="p-4 space-y-3 mt-0">
              {showForm || editingStudent ? (
                <StudentForm
                  onSubmit={editingStudent ? handleEdit : handleAdd}
                  onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                  initial={editingStudent || undefined}
                  existingNames={students.map(s => s.name)}
                />
              ) : (
                <>
                  <Button onClick={() => setShowForm(true)} className="w-full gap-2" size="sm">
                    <UserPlus className="h-4 w-4" /> Adicionar Aluno
                  </Button>
                  <div className="space-y-2">
                    {students.map(s => (
                      <div key={s.name} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5 border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{s.pokemon} · {TYPE_LABELS[s.type] || s.type}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingStudent(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => onRemoveStudent(s.name)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* EXPORT TAB */}
            <TabsContent value="data" className="p-4 space-y-4 mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Exportar dados</p>
                <Button onClick={() => exportCsv(students)} variant="outline" className="w-full gap-2" size="sm">
                  <Download className="h-4 w-4" /> Exportar CSV
                </Button>
                <Button onClick={() => exportJson(students)} variant="outline" className="w-full gap-2" size="sm">
                  <Download className="h-4 w-4" /> Exportar JSON
                </Button>
              </div>
              <div className="pt-4 border-t border-border">
                <Button onClick={onReset} variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" size="sm">
                  <RotateCcw className="h-4 w-4" /> Resetar para Demo
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
