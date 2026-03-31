import { Student, TYPE_COLORS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  students: Student[];
  onSelect: (student: Student) => void;
}

export function Rankings({ students, onSelect }: Props) {
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  // Group by type
  const byType = new Map<string, Student[]>();
  students.forEach(s => {
    const list = byType.get(s.type) || [];
    list.push(s);
    byType.set(s.type, list);
  });
  // Sort each group
  byType.forEach((list) => list.sort((a, b) => b.totalScore - a.totalScore));
  const types = [...byType.keys()].sort();

  return (
    <section className="mt-12">
      <h2 className="font-pixel text-center text-xl md:text-2xl text-primary mb-6 tracking-wider">
        📊 RANKINGS
      </h2>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-center mb-4">
          <TabsTrigger value="general">Ranking Geral</TabsTrigger>
          <TabsTrigger value="type">Por Tipo</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Pokémon</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s, i) => {
                  const typeClass = TYPE_COLORS[s.type] || 'type-normal';
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
                  return (
                    <TableRow
                      key={s.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelect(s)}
                    >
                      <TableCell className="font-bold">{medal}</TableCell>
                      <TableCell className="font-semibold">{s.name}</TableCell>
                      <TableCell className="capitalize">{s.pokemon}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${typeClass}`}>
                          {s.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-pixel text-sm">{s.totalScore}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="type">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {types.map(type => {
              const typeClass = TYPE_COLORS[type] || 'type-normal';
              const list = byType.get(type)!;
              return (
                <div key={type} className="rounded-lg border bg-card overflow-hidden">
                  <div className={`${typeClass} px-4 py-2 text-center font-bold capitalize`}>
                    {type}
                  </div>
                  <Table>
                    <TableBody>
                      {list.map((s, i) => (
                        <TableRow
                          key={s.name}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => onSelect(s)}
                        >
                          <TableCell className="font-bold w-8">{i + 1}</TableCell>
                          <TableCell className="font-semibold">{s.name}</TableCell>
                          <TableCell className="text-right font-pixel text-sm">{s.totalScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
