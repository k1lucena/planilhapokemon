import { useState, useRef, useMemo } from 'react';
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

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, handler: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) { handler(file); e.target.value = ''; }
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
            <TabsTrigger value="data" className="text-xs flex-1">📥 Dados</TabsTrigger>
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

              {selectedStudent && (
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

            {/* DATA TAB */}
            <TabsContent value="data" className="p-4 space-y-4 mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Importar dados</p>
                <div className="space-y-1.5">
                  <Input placeholder="Cole o link da planilha" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="text-xs h-8" />
                  <Button onClick={() => onImportSheet(sheetUrl)} disabled={isLoading || !sheetUrl.trim()} variant="outline" className="w-full gap-2" size="sm">
                    <FileSpreadsheet className="h-4 w-4" /> {isLoading ? 'Importando...' : 'Importar Google Sheets'}
                  </Button>
                </div>
                <Button onClick={() => csvInputRef.current?.click()} disabled={isLoading} variant="outline" className="w-full gap-2" size="sm">
                  <FileText className="h-4 w-4" /> Importar CSV
                </Button>
                <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFileImport(e, onImportCsv)} />
                <Button onClick={() => jsonInputRef.current?.click()} disabled={isLoading} variant="outline" className="w-full gap-2" size="sm">
                  <FileJson className="h-4 w-4" /> Importar JSON
                </Button>
                <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={e => handleFileImport(e, onImportJson)} />
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
