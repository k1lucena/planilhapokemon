import { useState, useEffect, useCallback, useRef } from 'react';
import { Student, STARTER_POKEMON } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Papa from 'papaparse';

function buildSheetCsvUrl(url: string): string | null {
  const trimmed = url.trim();
  if (/\/pub\?.*output=csv/i.test(trimmed) || /\/export\?.*format=csv/i.test(trimmed)) return trimmed;
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch) {
    const gidMatch = trimmed.match(/gid=(\d+)/);
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv${gidMatch ? `&gid=${gidMatch[1]}` : ''}`;
  }
  const normalMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (normalMatch) {
    const gidMatch = trimmed.match(/gid=(\d+)/);
    return `https://docs.google.com/spreadsheets/d/${normalMatch[1]}/pub?output=csv${gidMatch ? `&gid=${gidMatch[1]}` : ''}`;
  }
  return null;
}

function recalcTotal(student: Student): Student {
  return { ...student, totalScore: student.tasks.reduce((sum, t) => sum + t.score, 0) };
}

const POKEMON_TYPE_MAP: Record<string, string> = {
  bulbasaur: 'grass', ivysaur: 'grass', venusaur: 'grass',
  charmander: 'fire', charmeleon: 'fire', charizard: 'fire',
  squirtle: 'water', wartortle: 'water', blastoise: 'water',
};

function inferPokemonType(pokemon: string): string {
  return POKEMON_TYPE_MAP[pokemon.toLowerCase().trim()] || 'fire';
}

function normalizeHeader(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function compactHeader(name: string): string {
  return normalizeHeader(name).replace(/[^a-z0-9]/g, '');
}

function parseNumericValue(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function findHeaderAndSlice(text: string): string {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    if (compactHeader(lines[i]).includes('nome')) {
      return lines.slice(i).join('\n');
    }
  }
  return text;
}

const SKIP_PATTERNS = ['total', 'soma', 'matricula', 'evoluc', 'evoluç', 'média', 'media', 'resultado'];

type NotaFields = { nota1: number; nota2: number; nota3: number };

function getNotaSlot(name: string): 1 | 2 | 3 | null {
  const compact = compactHeader(name);
  if (/^nota0?1$/.test(compact)) return 1;
  if (/^nota0?2$/.test(compact)) return 2;
  if (/^nota0?3$/.test(compact)) return 3;
  return null;
}

function isSkipColumn(name: string): boolean {
  const header = normalizeHeader(name);
  return SKIP_PATTERNS.some(pattern => header.includes(pattern));
}

function isNotaColumn(name: string): boolean {
  return getNotaSlot(name) !== null;
}

function isTaskColumn(name: string): boolean {
  const compact = compactHeader(name);
  return compact.startsWith('atividade') || compact.startsWith('tarefa') || compact.startsWith('task') || compact.startsWith('projeto');
}

function findField(fields: string[], matcher: (compact: string) => boolean): string | undefined {
  return fields.find(field => matcher(compactHeader(field)));
}

function extractNotasFromRow(notaKeys: string[], row: Record<string, unknown>): NotaFields {
  const notas: NotaFields = { nota1: 0, nota2: 0, nota3: 0 };

  for (const key of notaKeys) {
    const slot = getNotaSlot(key);
    if (!slot) continue;
    notas[`nota${slot}`] = parseNumericValue(row[key]);
  }

  return notas;
}

function parseCsvData(text: string): Student[] {
  try {
    const cleanText = findHeaderAndSlice(text);
    const result = Papa.parse(cleanText, { header: true, skipEmptyLines: true });
    const fields = result.meta.fields || [];

    if (!result.data || result.data.length === 0 || fields.length === 0) return [];

    console.log('[CSV] Colunas detectadas:', fields);

    const nameKey = findField(fields, compact => compact === 'nome' || compact.includes('aluno') || compact === 'name' || compact.includes('estudante'));
    const pokemonKey = findField(fields, compact => compact === 'pokemon' || compact === 'apokemon');

    if (!nameKey) {
      toast.error('Coluna "NOME" não encontrada no CSV.');
      return [];
    }

    const notaKeys = fields.filter(isNotaColumn);
    console.log('[CSV] Colunas de nota:', notaKeys);

    const skipKeys = new Set([nameKey, pokemonKey].filter(Boolean) as string[]);
    for (const field of fields) {
      if (isSkipColumn(field) || isNotaColumn(field)) skipKeys.add(field);
    }

    let taskKeys = fields.filter(field => !skipKeys.has(field) && isTaskColumn(field));
    if (taskKeys.length === 0) {
      taskKeys = fields.filter(field => !skipKeys.has(field) && field.trim() !== '');
    }

    console.log('[CSV] Colunas de tarefa:', taskKeys);

    return (result.data as Record<string, unknown>[])
      .filter(row => row[nameKey] && String(row[nameKey]).trim() !== '')
      .map(row => {
        const tasks = taskKeys.map((key, index) => ({
          name: key.trim() || `Atividade ${String(index + 1).padStart(2, '0')}`,
          score: parseNumericValue(row[key]),
        }));
        const pokemon = pokemonKey ? String(row[pokemonKey] || 'bulbasaur').toLowerCase().trim() : 'bulbasaur';
        const type = inferPokemonType(pokemon);

        return {
          name: String(row[nameKey]).trim(),
          pokemon,
          type,
          tasks,
          totalScore: tasks.reduce((sum, task) => sum + task.score, 0),
          ...extractNotasFromRow(notaKeys, row),
        };
      });
  } catch (e) {
    console.error('[CSV] Erro ao parsear:', e);
    return [];
  }
}

function parseSheetData(text: string): Student[] {
  try {
    const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows;
    const cols = data.table.cols;
    if (!rows || rows.length === 0) return [];

    const headers: string[] = cols.map((col: any) => (col.label || '').toString());
    const nameIdx = headers.findIndex(header => {
      const compact = compactHeader(header);
      return compact === 'nome' || compact.includes('aluno');
    });
    const pokemonIdx = headers.findIndex(header => {
      const compact = compactHeader(header);
      return compact === 'pokemon' || compact === 'apokemon';
    });
    if (nameIdx === -1) return [];

    const notaIndices: Array<{ index: number; slot: 1 | 2 | 3 }> = [];
    const skipIndices = new Set([nameIdx, pokemonIdx].filter(index => index >= 0));

    for (let i = 0; i < headers.length; i++) {
      const slot = getNotaSlot(headers[i]);
      if (slot) {
        notaIndices.push({ index: i, slot });
        skipIndices.add(i);
      } else if (isSkipColumn(headers[i])) {
        skipIndices.add(i);
      }
    }

    const taskIndices: number[] = [];
    for (let i = 0; i < headers.length; i++) {
      if (!skipIndices.has(i) && headers[i] && isTaskColumn(headers[i])) taskIndices.push(i);
    }
    if (taskIndices.length === 0) {
      for (let i = 0; i < headers.length; i++) {
        if (!skipIndices.has(i) && headers[i]) taskIndices.push(i);
      }
    }

    return rows
      .filter((row: any) => row.c && row.c[nameIdx]?.v)
      .map((row: any) => {
        const tasks = taskIndices.map((index, taskIndex) => ({
          name: headers[index].trim() || `Tarefa ${taskIndex + 1}`,
          score: parseNumericValue(row.c[index]?.v),
        }));
        const pokemon = pokemonIdx >= 0 ? String(row.c[pokemonIdx]?.v || 'bulbasaur').toLowerCase().trim() : 'bulbasaur';
        const type = inferPokemonType(pokemon);
        const notas: NotaFields = { nota1: 0, nota2: 0, nota3: 0 };

        for (const { index, slot } of notaIndices) {
          notas[`nota${slot}`] = parseNumericValue(row.c[index]?.v);
        }

        return {
          name: String(row.c[nameIdx]?.v || '').trim(),
          pokemon,
          type,
          tasks,
          totalScore: tasks.reduce((sum, task) => sum + task.score, 0),
          ...notas,
        };
      });
  } catch (e) {
    console.error('[Sheets] Erro ao parsear:', e);
    return [];
  }
}

function parseJsonData(text: string): Student[] {
  try {
    let data = JSON.parse(text);
    if (!Array.isArray(data)) {
      const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
      if (arrayKey) data = data[arrayKey];
      else return [];
    }
    return data
      .filter((d: any) => d.name || d.nome)
      .map((d: any) => {
        const name = String(d.name || d.nome || '');
        const pokemon = String(d.pokemon || d.pokémon || 'bulbasaur').toLowerCase().trim();
        const type = String(d.type || d.tipo || '').toLowerCase().trim() || inferPokemonType(pokemon);
        const rawTasks = d.tasks || d.tarefas;
        const tasks = Array.isArray(rawTasks) ? rawTasks.map((t: any) => ({
          name: String(t.name || t.nome || ''),
          score: parseNumericValue(t.score ?? t.pontos ?? t.nota ?? 0),
        })) : [];
        return {
          name,
          pokemon,
          type,
          tasks,
          totalScore: tasks.reduce((sum: number, task: any) => sum + task.score, 0),
          nota1: parseNumericValue(d.nota1 ?? 0),
          nota2: parseNumericValue(d.nota2 ?? 0),
          nota3: parseNumericValue(d.nota3 ?? 0),
        };
      });
  } catch (e) {
    return [];
  }
}

interface DbStudent {
  id: string;
  name: string;
  pokemon: string;
  type: string;
  tasks: any;
  total_score: number;
  nota1?: number;
  nota2?: number;
  nota3?: number;
}

function dbToStudent(row: DbStudent): Student {
  return {
    name: row.name,
    pokemon: row.pokemon,
    type: row.type,
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
    totalScore: row.total_score,
    nota1: Number(row.nota1) || 0,
    nota2: Number(row.nota2) || 0,
    nota3: Number(row.nota3) || 0,
  };
}

export interface EvolutionEvent {
  studentName: string;
  pokemon: string;
  oldStage: number;
  newStage: number;
}

function getStage(score: number): number {
  if (score >= 200) return 2;
  if (score >= 100) return 1;
  return 0;
}

const SHEET_URL_KEY = 'pokedex_sheet_url';
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRKCw_N9_9Im877XLsVAd7FUE-9mDToHqm7u8KoYZQpC71QcPVQeRJqoB3ExHBDhG5UJ_BHYKyusi3b/pubhtml';

export function useStudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [evolutionQueue, setEvolutionQueue] = useState<EvolutionEvent[]>([]);
  const studentsRef = useRef<Student[]>([]);

  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { fetchStudents(); }, []);

  const enqueueEvolutions = useCallback((oldStudents: Student[], newStudents: Student[]) => {
    const events: EvolutionEvent[] = [];
    for (const ns of newStudents) {
      const os = oldStudents.find(s => s.name === ns.name);
      const oldStage = os ? getStage(os.totalScore) : 0;
      const newStage = getStage(ns.totalScore);
      if (newStage > oldStage) {
        events.push({ studentName: ns.name, pokemon: ns.pokemon, oldStage, newStage });
      }
    }
    if (events.length > 0) {
      setEvolutionQueue(prev => [...prev, ...events]);
    }
  }, []);

  const triggerEvolution = useCallback((studentName: string, pokemon: string, oldStage: number, newStage: number) => {
    setEvolutionQueue(prev => [...prev, { studentName, pokemon, oldStage, newStage }]);
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      setStudents(MOCK_STUDENTS);
    } else if (data && data.length > 0) {
      setStudents(data.map(dbToStudent));
    } else {
      await upsertStudents(MOCK_STUDENTS);
    }
    setIsLoading(false);
    setLastUpdate(new Date());
  }, []);

  const upsertStudents = async (list: Student[]) => {
    const rows = list.map(s => ({
      name: s.name,
      pokemon: s.pokemon,
      type: s.type,
      tasks: s.tasks as any,
      total_score: s.totalScore,
      nota1: s.nota1,
      nota2: s.nota2,
      nota3: s.nota3,
    }));
    const { error } = await supabase.from('students').upsert(rows, { onConflict: 'name' });
    if (error) console.error('Upsert error:', error);
    else {
      setStudents(list);
      setLastUpdate(new Date());
    }
  };

  const addStudent = useCallback(async (student: Omit<Student, 'tasks' | 'totalScore' | 'nota1' | 'nota2' | 'nota3'> & { tasks?: Student['tasks'] }) => {
    const current = studentsRef.current;
    if (current.some(s => s.name.toLowerCase() === student.name.toLowerCase())) return;
    const tasks = student.tasks || current[0]?.tasks.map(t => ({ name: t.name, score: 0 })) || [];
    const totalScore = tasks.reduce((s, t) => s + t.score, 0);
    const row = { name: student.name, pokemon: student.pokemon, type: student.type, tasks: tasks as any, total_score: totalScore, nota1: 0, nota2: 0, nota3: 0 };
    const { error } = await supabase.from('students').insert(row);
    if (!error) {
      const newStudent: Student = { ...student, tasks, totalScore, nota1: 0, nota2: 0, nota3: 0 };
      setStudents(prev => [...prev, newStudent]);
      setLastUpdate(new Date());
    }
  }, []);

  const removeStudent = useCallback(async (name: string) => {
    const { error } = await supabase.from('students').delete().eq('name', name);
    if (!error) {
      setStudents(prev => prev.filter(s => s.name !== name));
      setLastUpdate(new Date());
    }
  }, []);

  const updateStudent = useCallback(async (originalName: string, updates: Partial<Pick<Student, 'name' | 'pokemon' | 'type'>>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.pokemon) dbUpdates.pokemon = updates.pokemon;
    if (updates.type) dbUpdates.type = updates.type;
    const { error } = await supabase.from('students').update(dbUpdates).eq('name', originalName);
    if (!error) {
      setStudents(prev => prev.map(s => s.name !== originalName ? s : { ...s, ...updates }));
      setLastUpdate(new Date());
    }
  }, []);

  const updateNotas = useCallback(async (studentName: string, nota1: number, nota2: number, nota3: number) => {
    const { error } = await supabase.from('students').update({ nota1, nota2, nota3 }).eq('name', studentName);
    if (!error) {
      setStudents(prev => prev.map(s => s.name !== studentName ? s : { ...s, nota1, nota2, nota3 }));
      setLastUpdate(new Date());
    }
  }, []);

  const addTask = useCallback(async (taskName: string) => {
    const current = studentsRef.current;
    const updates = current.map(s => {
      if (s.tasks.some(t => t.name === taskName)) return s;
      return recalcTotal({ ...s, tasks: [...s.tasks, { name: taskName, score: 0 }] });
    });
    await upsertStudents(updates);
  }, []);

  const removeTask = useCallback(async (taskName: string) => {
    const current = studentsRef.current;
    const updates = current.map(s => recalcTotal({ ...s, tasks: s.tasks.filter(t => t.name !== taskName) }));
    await upsertStudents(updates);
  }, []);

  const updateTaskScore = useCallback(async (studentName: string, taskName: string, score: number) => {
    const current = studentsRef.current;
    const student = current.find(s => s.name === studentName);
    if (!student) return;

    const oldScore = student.totalScore;
    const updated = recalcTotal({
      ...student,
      tasks: student.tasks.map(t => t.name === taskName ? { ...t, score } : t),
    });
    const newScore = updated.totalScore;
    const oldStage = getStage(oldScore);
    const newStage = getStage(newScore);

    const { error } = await supabase.from('students').update({
      tasks: updated.tasks as any,
      total_score: updated.totalScore,
    }).eq('name', studentName);

    if (!error) {
      setStudents(prev => prev.map(s => s.name === studentName ? updated : s));
      setLastUpdate(new Date());
    }
  }, []);

  const refreshFromSheet = useCallback(async () => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 400));
    await Promise.all([fetchStudents(), minDelay]);
    toast.success('Dados atualizados!');
  }, [fetchStudents]);

  const resetToMock = useCallback(async () => {
    setIsLoading(true);
    await supabase.from('students').delete().neq('name', '');
    await upsertStudents(MOCK_STUDENTS);
    toast.success('Dados resetados!');
    setIsLoading(false);
  }, []);

  const shiftEvolutionQueue = useCallback(() => {
    setEvolutionQueue(prev => prev.slice(1));
  }, []);

  const evolveStudent = useCallback(async (studentName: string) => {
    const current = studentsRef.current;
    const student = current.find(s => s.name === studentName);
    if (!student) return;

    const currentStage = getStage(student.totalScore);
    if (currentStage >= 2) {
      toast.info(`${studentName} já está no estágio máximo!`);
      return;
    }

    const targetScore = currentStage === 0 ? 100 : 200;
    const diff = targetScore - student.totalScore;
    if (diff <= 0) return;

    // Add score to first task (or create one)
    let updatedTasks = [...student.tasks];
    if (updatedTasks.length === 0) {
      updatedTasks = [{ name: 'Evolução Manual', score: diff }];
    } else {
      updatedTasks = updatedTasks.map((t, i) => i === 0 ? { ...t, score: t.score + diff } : t);
    }

    const updated = recalcTotal({ ...student, tasks: updatedTasks });
    const { error } = await supabase.from('students').update({
      tasks: updated.tasks as any,
      total_score: updated.totalScore,
    }).eq('name', studentName);

    if (!error) {
      setStudents(prev => prev.map(s => s.name === studentName ? updated : s));
      setLastUpdate(new Date());
      triggerEvolution(studentName, student.pokemon, currentStage, currentStage + 1);
      toast.success(`${studentName} evoluiu!`);
    }
  }, [triggerEvolution]);

  return {
    students, isLoading, lastUpdate,
    addStudent, removeStudent, updateStudent, updateNotas,
    addTask, removeTask, updateTaskScore,
    refreshFromSheet, resetToMock,
    evolutionQueue, shiftEvolutionQueue, evolveStudent, triggerEvolution,
  };
}
