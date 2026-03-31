import { useState, useMemo } from 'react';
import { useStudentData } from '@/hooks/useStudentData';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Student } from '@/lib/types';
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

  return (
    <div className="min-h-screen pokeball-bg">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-pixel text-xl md:text-3xl tracking-wider">Pokédex Escolar</h1>
            <p className="text-sm opacity-80 mt-1">Sistema de Pontuação com Evolução Pokémon</p>
          </div>
          <div className="flex items-center gap-3">
            {usingMock && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-bold">
                Dados de exemplo
              </span>
            )}
            <span className="text-xs opacity-70">
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <Button
              variant="secondary"
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
        {/* Loading */}
        {pokemonLoading && students.length > 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm animate-pulse">
            Carregando sprites dos Pokémons...
          </div>
        )}

        {/* Podium */}
        <Podium students={sorted} pokemonMap={pokemonMap} onSelect={setSelectedStudent} />

        {/* Cards Grid */}
        <section>
          <h2 className="font-pixel text-center text-xl md:text-2xl text-primary mb-6 tracking-wider">
            ⚡ TODOS OS TREINADORES
          </h2>
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

        {/* Rankings */}
        <Rankings students={students} onSelect={setSelectedStudent} />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground text-center py-4 mt-12">
        <p className="font-pixel text-xs opacity-70">Pokédex Escolar © {new Date().getFullYear()}</p>
      </footer>

      {/* Modal */}
      <PokedexModal
        student={selectedStudent}
        pokemonData={selectedStudent ? pokemonMap.get(selectedStudent.pokemon) : undefined}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};

export default Index;
