import { useState } from 'react';
import { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface TaskManagerProps {
  students: Student[];
  onAddTask: (taskName: string) => void;
  onRemoveTask: (taskName: string) => void;
  onUpdateScore: (studentName: string, taskName: string, score: number) => void;
}

export function TaskManager({ students, onAddTask, onRemoveTask, onUpdateScore }: TaskManagerProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);

  const taskNames = students[0]?.tasks.map(t => t.name) || [];

  const handleAddTask = () => {
    const trimmed = newTaskName.trim();
    if (!trimmed) return;
    if (taskNames.includes(trimmed)) return;
    onAddTask(trimmed);
    setNewTaskName('');
  };

  return (
    <div className="space-y-4">
      {/* Add new task */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-semibold">Nova Tarefa</Label>
        <div className="flex gap-2">
          <Input
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            placeholder="Nome da tarefa"
            maxLength={50}
            className="bg-muted/50 border-border flex-1"
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
          />
          <Button size="sm" onClick={handleAddTask} disabled={!newTaskName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-semibold">Tarefas Existentes</Label>
        {taskNames.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa</p>
        )}
        {taskNames.map(taskName => (
          <div key={taskName} className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{taskName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTask(taskName)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {editingStudent === taskName ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {students.map(s => {
                  const task = s.tasks.find(t => t.name === taskName);
                  return (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground truncate flex-1">{s.name}</span>
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        value={task?.score ?? 0}
                        onChange={e => onUpdateScore(s.name, taskName, Math.max(0, Number(e.target.value) || 0))}
                        className="w-20 h-7 text-xs bg-background border-border"
                      />
                    </div>
                  );
                })}
                <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => setEditingStudent(null)}>
                  Fechar
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setEditingStudent(taskName)}>
                Editar pontuações
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
