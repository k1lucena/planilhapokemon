import { useState, useMemo } from 'react';
import { useStudentData } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Student } from '@/lib/types';
import { RefreshCw, Settings } from 'lucide-react';
import { Podium } from '@/components/Podium';
import { StudentCard } from '@/components/StudentCard';
import { PokedexModal } from '@/components/PokedexModal';
import { Rankings } from '@/components/Rankings';
import { AdminPanel } from '@/components/AdminPanel';
import { EvolutionAnimation } from '@/components/EvolutionAnimation';
import { Button } from '@/components/ui/button';
import { PokeballIcon } from '@/components/PokeballIcon';

const Index = () => {
  const {
    students, isLoading, lastUpdate,
    addStudent, removeStudent, updateStudent, updateNotas,
    addTask, removeTask, updateTaskScore,
    refreshFromSheet,
    resetToMock, evolutionQueue, shiftEvolutionQueue, evolveStudent,
  } = useStudentData();

  const pokemonNames = useMemo(() => students.map(s => s.pokemon), [students]);
  const { pokemonMap, isLoading: pokemonLoading } = usePokemonData(pokemonNames);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const sorted = useMemo(() => [...students].sort((a, b) => b.totalScore - a.totalScore), [students]);

  return (
    <div className="min-h-screen game-bg">
      <header className="sticky top-0 z-50 pokedex-frame rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="pokedex-lens animate-pulse-glow" />
            <div className="flex gap-1.5 ml-2">
              <div className="pokedex-led pokedex-led-red" />
              <div className="pokedex-led pokedex-led-yellow" />
              <div className="pokedex-led pokedex-led-green" />
            </div>
            <h1 className="font-pixel text-[10px] md:text-xs tracking-wider text-primary-foreground ml-3">
              Pokédex Acadêmica
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary-foreground/60 hidden sm:inline">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <Button variant="secondary" size="sm" onClick={refreshFromSheet} disabled={isLoading} className="gap-1 h-7 text-xs">
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setAdminOpen(true)} className="gap-1 h-7 text-xs">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Gerenciar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {(isLoading || pokemonLoading) && students.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">Carregando dados...</div>
        )}
        <Podium students={sorted} pokemonMap={pokemonMap} onSelect={setSelectedStudent} />
        <section>
          <h2 className="text-center text-lg md:text-xl font-bold text-foreground mb-1">🎮 Treinadores</h2>
          <p className="text-center text-muted-foreground text-sm mb-6">Acompanhe o progresso de cada aluno</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map(student => (
              <StudentCard key={student.name} student={student} pokemonData={pokemonMap.get(student.pokemon)} onClick={() => setSelectedStudent(student)} />
            ))}
          </div>
        </section>
        <Rankings students={students} onSelect={setSelectedStudent} />
      </main>

      <footer className="border-t border-border bg-card/50 text-center py-4 mt-12">
        <div className="flex items-center justify-center gap-2">
          <PokeballIcon size={16} />
          <p className="text-xs text-muted-foreground">Pokédex Acadêmica © {new Date().getFullYear()}</p>
        </div>
      </footer>

      <PokedexModal student={selectedStudent} pokemonData={selectedStudent ? pokemonMap.get(selectedStudent.pokemon) : undefined} open={!!selectedStudent} onClose={() => setSelectedStudent(null)} />

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
        onReset={resetToMock}
        onEvolveStudent={(name) => { setAdminOpen(false); evolveStudent(name); }}
        isLoading={isLoading}
      />

      {evolutionQueue.length > 0 && <EvolutionAnimation event={evolutionQueue[0]} onComplete={shiftEvolutionQueue} />}
    </div>
  );
};

export default Index;
