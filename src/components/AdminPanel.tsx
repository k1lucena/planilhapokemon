import { useState, useRef } from 'react';
import { Student, TYPE_LABELS } from '@/lib/types';
import { StudentForm } from './StudentForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, UserPlus, RotateCcw, FileSpreadsheet, FileJson, FileText, Save } from 'lucide-react';
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
  onImportSheet: (url: string) => void;
  onImportCsv: (file: File) => void;
  onImportJson: (file: File) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function AdminPanel({
  open, onClose, students,
  onAddStudent, onRemoveStudent, onUpdateStudent,
  onAddTask, onRemoveTask, onUpdateScore,
  onImportSheet, onImportCsv, onImportJson, onReset, isLoading,
}: AdminPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Quick grades state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [quickScores, setQuickScores] = useState<number[]>([]);

  const handleSelectStudent = (name: string) => {
    const s = students.find(st => st.name === name);
    if (s) {
      setSelectedStudent(name);
      setQuickScores(s.tasks.map(t => t.score));
    }
  };

  const handleSaveQuickScores = async () => {
    const s = students.find(st => st.name === selectedStudent);
    if (!s) return;
    for (let i = 0; i < s.tasks.length; i++) {
      if (s.tasks[i].score !== quickScores[i]) {
        await onUpdateScore(selectedStudent, s.tasks[i].name, quickScores[i]);
      }
    }
    toast.success(`Notas de ${selectedStudent} salvas!`);
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

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, handler: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
      e.target.value = '';
    }
  };

  const currentStudent = students.find(s => s.name === selectedStudent);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b border-border">
          <SheetTitle className="font-pixel text-primary text-sm tracking-wider">⚙️ Gerenciar</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="grades" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 bg-muted/50">
            <TabsTrigger value="grades" className="text-xs flex-1">📝 Notas</TabsTrigger>
            <TabsTrigger value="students" className="text-xs flex-1">👥 Alunos</TabsTrigger>
            <TabsTrigger value="data" className="text-xs flex-1">📥 Dados</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* QUICK GRADES TAB */}
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

              {currentStudent && quickScores.length > 0 && (
                <div className="space-y-3">
                  {/* N1 */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-muted/50 px-3 py-1.5">
                      <span className="text-xs font-bold">N1 — Atividades 01-05</span>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {currentStudent.tasks.slice(0, 5).map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex-1 truncate">{task.name}</span>
                          <Input
                            type="number"
                            min={0}
                            max={1000}
                            value={quickScores[i]}
                            onChange={e => {
                              const v = [...quickScores];
                              v[i] = Math.max(0, Number(e.target.value) || 0);
                              setQuickScores(v);
                            }}
                            className="w-20 h-7 text-xs bg-background border-border text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* N2 */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-muted/50 px-3 py-1.5">
                      <span className="text-xs font-bold">N2 — Atividades 06-10</span>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {currentStudent.tasks.slice(5, 10).map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex-1 truncate">{task.name}</span>
                          <Input
                            type="number"
                            min={0}
                            max={1000}
                            value={quickScores[i + 5]}
                            onChange={e => {
                              const v = [...quickScores];
                              v[i + 5] = Math.max(0, Number(e.target.value) || 0);
                              setQuickScores(v);
                            }}
                            className="w-20 h-7 text-xs bg-background border-border text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* N3 */}
                  {currentStudent.tasks.length > 10 && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted/50 px-3 py-1.5">
                        <span className="text-xs font-bold">N3 — Projeto Final</span>
                      </div>
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex-1 truncate">{currentStudent.tasks[10].name}</span>
                          <Input
                            type="number"
                            min={0}
                            max={1000}
                            value={quickScores[10]}
                            onChange={e => {
                              const v = [...quickScores];
                              v[10] = Math.max(0, Number(e.target.value) || 0);
                              setQuickScores(v);
                            }}
                            className="w-20 h-7 text-xs bg-background border-border text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleSaveQuickScores} className="w-full gap-2" size="sm">
                    <Save className="h-4 w-4" /> Salvar Notas
                  </Button>
                </div>
              )}
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
                          <p className="text-xs text-muted-foreground capitalize">{s.pokemon} · {TYPE_LABELS[s.type] || s.type} · {s.totalScore}pts</p>
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

            {/* DATA TAB */}
            <TabsContent value="data" className="p-4 space-y-4 mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Importar dados</p>
                <p className="text-xs text-muted-foreground">Substitui todos os dados atuais.</p>
                
                <div className="space-y-1.5">
                  <Input
                    placeholder="Cole o link da planilha do Google Sheets"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    className="text-xs h-8"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    A planilha deve estar publicada na web (Arquivo → Publicar na Web)
                  </p>
                  <Button
                    onClick={() => { onImportSheet(sheetUrl); }}
                    disabled={isLoading || !sheetUrl.trim()}
                    variant="outline"
                    className="w-full gap-2"
                    size="sm"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {isLoading ? 'Importando...' : 'Importar Google Sheets'}
                  </Button>
                </div>

                <Button onClick={() => csvInputRef.current?.click()} disabled={isLoading} variant="outline" className="w-full gap-2" size="sm">
                  <FileText className="h-4 w-4" />
                  Importar CSV
                </Button>
                <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFileImport(e, onImportCsv)} />

                <Button onClick={() => jsonInputRef.current?.click()} disabled={isLoading} variant="outline" className="w-full gap-2" size="sm">
                  <FileJson className="h-4 w-4" />
                  Importar JSON
                </Button>
                <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={e => handleFileImport(e, onImportJson)} />
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Button onClick={onReset} variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" size="sm">
                  <RotateCcw className="h-4 w-4" /> Resetar para Demo
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {students.length} alunos · {students[0]?.tasks.length || 0} tarefas
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
