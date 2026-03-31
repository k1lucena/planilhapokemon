import { useState, useMemo } from 'react';
import { useStudentData } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Student } from '@/lib/types';
import { RefreshCw } from 'lucide-react';
import { Podium } from '@/components/Podium';
import { StudentCard } from '@/components/StudentCard';
import { PokedexModal } from '@/components/PokedexModal';
import { Rankings } from '@/components/Rankings';
import { AdminPanel } from '@/components/AdminPanel';
import { EvolutionAnimation } from '@/components/EvolutionAnimation';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { PokeballIcon } from '@/components/PokeballIcon';

const Index = () => {
  const {
    students, isLoading, lastUpdate,
    addStudent, removeStudent, updateStudent,
    addTask, removeTask, updateTaskScore,
    importFromSheet, importFromCsv, importFromJson,
    refreshFromSheet,
    resetToMock, evolutionEvent, clearEvolutionEvent,
  } = useStudentData();

  const pokemonNames = useMemo(() => students.map(s => s.pokemon), [students]);
  const { pokemonMap, isLoading: pokemonLoading } = usePokemonData(pokemonNames);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const sorted = useMemo(() => [...students].sort((a, b) => b.totalScore - a.totalScore), [students]);

  return (
    <div className="min-h-screen game-bg">
      <header className="sticky top-0 z-50 py-4 px-4 shadow-lg border-b border-border/50" style={{ background: 'linear-gradient(180deg, hsl(230 15% 10%) 0%, hsl(230 15% 8% / 0.95) 100%)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PokeballIcon size={32} className="animate-float" />
            <h1 className="font-pixel text-xs md:text-sm tracking-wider text-foreground">
              Pokédex Acadêmica
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <Button variant="outline" size="sm" onClick={refreshFromSheet} disabled={isLoading} className="gap-1">
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAdminOpen(true)} className="gap-1">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Gerenciar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {(isLoading || pokemonLoading) && students.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">
            Carregando dados...
          </div>
        )}

        <Podium students={sorted} pokemonMap={pokemonMap} onSelect={setSelectedStudent} />

        <section>
          <h2 className="text-center text-lg md:text-xl font-bold text-foreground mb-1">
            Treinadores
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">Acompanhe o progresso de cada aluno</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map(student => (
              <StudentCard
                key={student.name}
                student={student}
                pokemonData={pokemonMap.get(student.pokemon)}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        </section>

        <Rankings students={students} onSelect={setSelectedStudent} />
      </main>

      <footer className="border-t border-border bg-card/50 text-center py-4 mt-12">
        <p className="text-xs text-muted-foreground">Pokédex Acadêmica © {new Date().getFullYear()}</p>
      </footer>

      <PokedexModal
        student={selectedStudent}
        pokemonData={selectedStudent ? pokemonMap.get(selectedStudent.pokemon) : undefined}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        students={students}
        onAddStudent={addStudent}
        onRemoveStudent={removeStudent}
        onUpdateStudent={updateStudent}
        onAddTask={addTask}
        onRemoveTask={removeTask}
        onUpdateScore={updateTaskScore}
        onImportSheet={importFromSheet}
        onImportCsv={importFromCsv}
        onImportJson={importFromJson}
        onReset={resetToMock}
        isLoading={isLoading}
      />

      {evolutionEvent && (
        <EvolutionAnimation event={evolutionEvent} onComplete={clearEvolutionEvent} />
      )}
    </div>
  );
};

export default Index;
