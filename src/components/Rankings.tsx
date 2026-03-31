import { Student, TYPE_COLORS, TYPE_LABELS } from '@/lib/types';
import { PlayerBattleStats, getStatusEmoji } from '@/lib/battleSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  students: Student[];
  battleStats: Map<string, PlayerBattleStats>;
  onSelect: (student: Student) => void;
}

export function Rankings({ students, battleStats, onSelect }: Props) {
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  const sortedByWins = [...students].sort((a, b) => {
    const sa = battleStats.get(a.name);
    const sb = battleStats.get(b.name);
    return (sb?.wins || 0) - (sa?.wins || 0);
  });

  const byType = new Map<string, Student[]>();
  students.forEach(s => {
    const list = byType.get(s.type) || [];
    list.push(s);
    byType.set(s.type, list);
  });
  byType.forEach((list) => list.sort((a, b) => b.totalScore - a.totalScore));
  const types = [...byType.keys()].sort();

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section className="mt-12">
      <h2 className="font-pixel text-center text-lg md:text-2xl text-primary mb-2 tracking-wider">
        📊 CLASSIFICAÇÃO
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-6">Classificações e confrontos</p>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-center mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="type">Por Tipo</TabsTrigger>
          <TabsTrigger value="battles">Batalhas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-2">
            {sorted.map((s, i) => {
              const typeClass = TYPE_COLORS[s.type] || 'type-normal';
              const stats = battleStats.get(s.name);
              const typeLabel = TYPE_LABELS[s.type] || s.type;
              return (
                <div
                  key={s.name}
                  className="glass-card rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => onSelect(s)}
                >
                  <span className="font-bold text-lg w-8 text-center">
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${typeClass}`}>
                      {typeLabel}
                    </span>
                  </div>
                  {stats && (
                    <span className="text-xs text-muted-foreground">
                      {getStatusEmoji(stats.status)}
                    </span>
                  )}
                  <span className="font-pixel text-sm text-primary">{s.totalScore}</span>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="type">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {types.map(type => {
              const typeClass = TYPE_COLORS[type] || 'type-normal';
              const typeLabel = TYPE_LABELS[type] || type;
              const list = byType.get(type)!;
              return (
                <div key={type} className="glass-card rounded-xl overflow-hidden">
                  <div className={`${typeClass} px-4 py-2 text-center font-bold text-sm`}>
                    {typeLabel}
                  </div>
                  <div className="p-2 space-y-1">
                    {list.map((s, i) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onSelect(s)}
                      >
                        <span className="text-sm">
                          <span className="font-bold mr-2">{i + 1}.</span>
                          {s.name}
                        </span>
                        <span className="font-pixel text-xs text-primary">{s.totalScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="battles">
          <div className="space-y-2">
            {sortedByWins.map((s, i) => {
              const stats = battleStats.get(s.name);
              const typeClass = TYPE_COLORS[s.type] || 'type-normal';
              const typeLabel = TYPE_LABELS[s.type] || s.type;
              if (!stats) return null;
              return (
                <div
                  key={s.name}
                  className="glass-card rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => onSelect(s)}
                >
                  <span className="font-bold text-lg w-8 text-center">
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${typeClass}`}>
                      {typeLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{stats.wins}V</p>
                    <p className="text-xs text-red-400">{stats.losses}D</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
