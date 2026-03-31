import { useState, useMemo } from 'react';
import { useStudentData } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Student } from '@/lib/types';
import { generateBattleResults } from '@/lib/battleSystem';
import { Podium } from '@/components/Podium';
import { StudentCard } from '@/components/StudentCard';
import { PokedexModal } from '@/components/PokedexModal';
import { Rankings } from '@/components/Rankings';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const { students, isLoading, lastUpdate, usingMock, refetch } = useStudentData(10000);
  const pokemonNames = useMemo(() => students.map(s => s.pokemon), [students]);
  const { pokemonMap, isLoading: pokemonLoading } = usePokemonData(pokemonNames);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const sorted = useMemo(() => [...students].sort((a, b) => b.totalScore - a.totalScore), [students]);
  const battleStats = useMemo(() => generateBattleResults(students), [students]);

  return (
    <div className="min-h-screen game-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md py-5 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-pixel text-lg md:text-2xl tracking-wider text-primary">
              ⚔️ Pokédex Arena
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Sistema de Batalha e Evolução</p>
          </div>
          <div className="flex items-center gap-3">
            {usingMock && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-bold">
                Demo
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className="gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {pokemonLoading && students.length > 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">
            Carregando sprites...
          </div>
        )}

        {/* Arena / Podium */}
        <Podium students={sorted} pokemonMap={pokemonMap} battleStats={battleStats} onSelect={setSelectedStudent} />

        {/* Cards Grid */}
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

        {/* Rankings */}
        <Rankings students={students} battleStats={battleStats} onSelect={setSelectedStudent} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 text-center py-4 mt-12">
        <p className="font-pixel text-xs text-muted-foreground">Pokédex Arena © {new Date().getFullYear()}</p>
      </footer>

      {/* Modal */}
      <PokedexModal
        student={selectedStudent}
        pokemonData={selectedStudent ? pokemonMap.get(selectedStudent.pokemon) : undefined}
        battleStats={selectedStudent ? battleStats.get(selectedStudent.name) : undefined}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};

export default Index;
