import { useState, useMemo } from 'react';
import { useStudentData } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Student } from '@/lib/types';
import { generateBattleResults } from '@/lib/battleSystem';
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
    resetToMock, evolutionEvent, clearEvolutionEvent,
  } = useStudentData();

  const pokemonNames = useMemo(() => students.map(s => s.pokemon), [students]);
  const { pokemonMap, isLoading: pokemonLoading } = usePokemonData(pokemonNames);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const sorted = useMemo(() => [...students].sort((a, b) => b.totalScore - a.totalScore), [students]);
  const battleStats = useMemo(() => generateBattleResults(students), [students]);

  return (
    <div className="min-h-screen game-bg">
      <header className="border-b border-border bg-card/80 backdrop-blur-md py-5 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-pixel text-lg md:text-2xl tracking-wider text-primary">
              ⚔️ Pokédex Arena
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Sistema de Batalha e Evolução</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <Button variant="outline" size="sm" onClick={() => setAdminOpen(true)} className="gap-1">
              <Settings className="h-3 w-3" />
              Gerenciar
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

        <Podium students={sorted} pokemonMap={pokemonMap} battleStats={battleStats} onSelect={setSelectedStudent} />

        <section>
          <h2 className="font-pixel text-center text-lg md:text-xl text-primary mb-2 tracking-wider">
            🎮 JOGADORES
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">Todos os treinadores na arena</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map(student => (
              <StudentCard
                key={student.name}
                student={student}
                pokemonData={pokemonMap.get(student.pokemon)}
                battleStats={battleStats.get(student.name)}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        </section>

        <Rankings students={students} battleStats={battleStats} onSelect={setSelectedStudent} />
      </main>

      <footer className="border-t border-border bg-card/50 text-center py-4 mt-12">
        <p className="font-pixel text-xs text-muted-foreground">Pokédex Arena © {new Date().getFullYear()}</p>
      </footer>

      <PokedexModal
        student={selectedStudent}
        pokemonData={selectedStudent ? pokemonMap.get(selectedStudent.pokemon) : undefined}
        battleStats={selectedStudent ? battleStats.get(selectedStudent.name) : undefined}
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
