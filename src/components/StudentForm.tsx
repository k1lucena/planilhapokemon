import { useState } from 'react';
import { Student, STARTER_POKEMON, TYPE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentFormProps {
  onSubmit: (student: { name: string; pokemon: string; type: string }) => void;
  onCancel: () => void;
  initial?: Student;
  existingNames?: string[];
}

export function StudentForm({ onSubmit, onCancel, initial, existingNames = [] }: StudentFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [pokemon, setPokemon] = useState(initial?.pokemon || '');
  const [error, setError] = useState('');

  const selectedStarter = STARTER_POKEMON.find(p => p.name === pokemon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) { setError('Nome é obrigatório'); return; }
    if (!pokemon) { setError('Pokémon é obrigatório'); return; }
    if (trimmedName.length > 100) { setError('Nome muito longo'); return; }
    
    const isDuplicate = existingNames
      .filter(n => n !== initial?.name)
      .some(n => n.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) { setError('Já existe um aluno com este nome'); return; }

    const starter = STARTER_POKEMON.find(p => p.name === pokemon);
    onSubmit({ name: trimmedName, pokemon, type: starter?.type || 'normal' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Nome do Aluno</Label>
        <Input
          id="name"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="Ex: João Silva"
          maxLength={100}
          className="bg-muted/50 border-border"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Pokémon Inicial</Label>
        <Select value={pokemon} onValueChange={v => { setPokemon(v); setError(''); }}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Escolha um Pokémon" />
          </SelectTrigger>
          <SelectContent>
            {STARTER_POKEMON.map(p => (
              <SelectItem key={p.name} value={p.name} className="capitalize">
                {p.label} ({TYPE_LABELS[p.type]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedStarter && (
          <p className="text-xs text-muted-foreground">
            Tipo: <span className="font-semibold">{TYPE_LABELS[selectedStarter.type]}</span>
          </p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">{initial ? 'Salvar' : 'Adicionar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
      </div>
    </form>
  );
}
