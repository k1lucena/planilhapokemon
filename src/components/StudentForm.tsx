import { useState } from 'react';
import { Student, TYPE_COLORS } from '@/lib/types';
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

const TYPES = Object.keys(TYPE_COLORS);

export function StudentForm({ onSubmit, onCancel, initial, existingNames = [] }: StudentFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [pokemon, setPokemon] = useState(initial?.pokemon || '');
  const [type, setType] = useState(initial?.type || 'normal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPokemon = pokemon.trim().toLowerCase();

    if (!trimmedName) { setError('Nome é obrigatório'); return; }
    if (!trimmedPokemon) { setError('Pokémon é obrigatório'); return; }
    if (trimmedName.length > 100) { setError('Nome muito longo'); return; }
    
    const isDuplicate = existingNames
      .filter(n => n !== initial?.name)
      .some(n => n.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) { setError('Já existe um aluno com este nome'); return; }

    onSubmit({ name: trimmedName, pokemon: trimmedPokemon, type });
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
        <Label htmlFor="pokemon" className="text-foreground">Pokémon</Label>
        <Input
          id="pokemon"
          value={pokemon}
          onChange={e => { setPokemon(e.target.value); setError(''); }}
          placeholder="Ex: charmander"
          maxLength={50}
          className="bg-muted/50 border-border"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Tipo</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(t => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">{initial ? 'Salvar' : 'Adicionar'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
      </div>
    </form>
  );
}
