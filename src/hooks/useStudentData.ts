import { useState, useEffect, useCallback, useRef } from 'react';
import { Student, STARTER_POKEMON } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Papa from 'papaparse';

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function recalcTotal(student: Student): Student {
  return { ...student, totalScore: student.tasks.reduce((sum, t) => sum + t.score, 0) };
}

function inferPokemonType(pokemon: string): string {
  const starter = STARTER_POKEMON.find(s => s.name.toLowerCase() === pokemon.toLowerCase());
  return starter?.type || 'normal';
}

function parseSheetData(text: string): Student[] {
  try {
    const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows;
    const cols = data.table.cols;
    if (!rows || rows.length === 0) return [];

    const headers: string[] = cols.map((col: any) => (col.label || '').toString().toLowerCase().trim());
    console.log('[Sheets] Colunas detectadas:', headers);

    const nameIdx = headers.findIndex((h: string) =>
      h.includes('nome') || h.includes('aluno') || h.includes('name') || h.includes('estudante')
    );
    const pokemonIdx = headers.findIndex((h: string) =>
      h.includes('pokémon') || h.includes('pokemon')
    );
    const typeIdx = headers.findIndex((h: string) =>
      h.includes('tipo') || h.includes('type')
    );
    if (nameIdx === -1) return [];

    const taskIndices: number[] = [];
    const totalIdx = headers.findIndex((h: string) => h.includes('total'));
    const skipIndices = new Set([nameIdx, pokemonIdx, typeIdx, totalIdx].filter(i => i >= 0));

    for (let i = 0; i < headers.length; i++) {
      if (skipIndices.has(i)) continue;
      if (headers[i] && (headers[i].includes('tarefa') || headers[i].includes('task') || /^\d+$/.test(headers[i]))) {
        taskIndices.push(i);
      }
    }
    if (taskIndices.length === 0) {
      for (let i = 0; i < headers.length; i++) {
        if (!skipIndices.has(i) && headers[i]) taskIndices.push(i);
      }
    }

    return rows
      .filter((row: any) => row.c && row.c[nameIdx]?.v)
      .map((row: any) => {
        const tasks = taskIndices.map((idx, i) => ({
          name: headers[idx] || `Tarefa ${i + 1}`,
          score: Number(row.c[idx]?.v) || 0,
        }));
        const pokemon = pokemonIdx >= 0 ? String(row.c[pokemonIdx]?.v || 'bulbasaur').toLowerCase().trim() : 'bulbasaur';
        const type = typeIdx >= 0 ? String(row.c[typeIdx]?.v || '').toLowerCase().trim() : inferPokemonType(pokemon);
        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        return { name: String(row.c[nameIdx]?.v || ''), pokemon, type: type || inferPokemonType(pokemon), tasks, totalScore };
      });
  } catch (e) {
    console.error('[Sheets] Erro ao parsear:', e);
    return [];
  }
}

function parseCsvData(text: string): Student[] {
  try {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (!result.data || result.data.length === 0) return [];
    
    console.log('[CSV] Colunas detectadas:', result.meta.fields);

    const nameKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase().trim();
      return l.includes('nome') || l.includes('aluno') || l.includes('name') || l.includes('estudante');
    });
    const pokemonKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase().trim();
      return l.includes('pokémon') || l.includes('pokemon');
    });
    const typeKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase().trim();
      return l.includes('tipo') || l.includes('type');
    });

    if (!nameKey) {
      console.error('[CSV] Coluna de nome não encontrada. Colunas:', result.meta.fields);
      return [];
    }

    const skipKeys = new Set([nameKey, pokemonKey, typeKey].filter(Boolean) as string[]);
    const totalKey = result.meta.fields?.find(f => f.toLowerCase().includes('total'));
    if (totalKey) skipKeys.add(totalKey);

    const taskKeys = (result.meta.fields || []).filter(f => !skipKeys.has(f));

    return (result.data as any[])
      .filter(row => row[nameKey])
      .map(row => {
        const tasks = taskKeys.map(k => ({
          name: k,
          score: Number(row[k]) || 0,
        }));
        const pokemon = pokemonKey ? String(row[pokemonKey] || 'bulbasaur').toLowerCase().trim() : 'bulbasaur';
        const type = typeKey ? String(row[typeKey] || '').toLowerCase().trim() : inferPokemonType(pokemon);
        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        return {
          name: String(row[nameKey]),
          pokemon,
          type: type || inferPokemonType(pokemon),
          tasks,
          totalScore,
        };
      });
  } catch (e) {
    console.error('[CSV] Erro ao parsear:', e);
    return [];
  }
}

function parseJsonData(text: string): Student[] {
  try {
    let data = JSON.parse(text);

    // Accept root object with array inside
    if (!Array.isArray(data)) {
      const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
      if (arrayKey) {
        data = data[arrayKey];
      } else {
        return [];
      }
    }

    return data
      .filter((d: any) => d.name || d.nome)
      .map((d: any) => {
        const name = String(d.name || d.nome || '');
        const pokemon = String(d.pokemon || d.pokémon || d.Pokemon || 'bulbasaur').toLowerCase().trim();
        const type = String(d.type || d.tipo || '').toLowerCase().trim() || inferPokemonType(pokemon);
        const rawTasks = d.tasks || d.tarefas;
        const tasks = Array.isArray(rawTasks) ? rawTasks.map((t: any) => ({
          name: String(t.name || t.nome || ''),
          score: Number(t.score || t.pontos || t.nota || 0),
        })) : [];
        return {
          name,
          pokemon,
          type,
          tasks,
          totalScore: tasks.reduce((sum: number, t: any) => sum + t.score, 0),
        };
      });
  } catch (e) {
    console.error('[JSON] Erro ao parsear:', e);
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
}

function dbToStudent(row: DbStudent): Student {
  return {
    name: row.name,
    pokemon: row.pokemon,
    type: row.type,
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
    totalScore: row.total_score,
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

export function useStudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [evolutionEvent, setEvolutionEvent] = useState<EvolutionEvent | null>(null);
  const studentsRef = useRef<Student[]>([]);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.error('Error fetching students:', error);
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
    }));
    const { error } = await supabase.from('students').upsert(rows, { onConflict: 'name' });
    if (error) console.error('Upsert error:', error);
    else {
      setStudents(list);
      setLastUpdate(new Date());
    }
  };

  const addStudent = useCallback(async (student: Omit<Student, 'tasks' | 'totalScore'> & { tasks?: Student['tasks'] }) => {
    const current = studentsRef.current;
    if (current.some(s => s.name.toLowerCase() === student.name.toLowerCase())) return;
    const tasks = student.tasks || current[0]?.tasks.map(t => ({ name: t.name, score: 0 })) || [];
    const totalScore = tasks.reduce((s, t) => s + t.score, 0);
    const row = { name: student.name, pokemon: student.pokemon, type: student.type, tasks: tasks as any, total_score: totalScore };
    const { error } = await supabase.from('students').insert(row);
    if (!error) {
      const newStudent: Student = { ...student, tasks, totalScore };
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

      if (newStage > oldStage) {
        setEvolutionEvent({
          studentName,
          pokemon: student.pokemon,
          oldStage,
          newStage,
        });
      }
    }
  }, []);

  const importFromSheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('import-sheet', {
        body: { url: SHEET_URL },
      });

      if (fnError) throw new Error(fnError.message || 'Erro na edge function');

      // fnData is the raw text from the sheet
      const text = typeof fnData === 'string' ? fnData : JSON.stringify(fnData);
      const parsed = parseSheetData(text);

      if (parsed.length === 0) {
        toast.error('Formato não reconhecido. Verifique as colunas da planilha.');
        setIsLoading(false);
        return;
      }

      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados do Google Sheets!`);
    } catch (e: any) {
      console.error('Falha ao importar do Sheets:', e);
      toast.error(`Falha ao importar do Google Sheets: ${e.message || 'erro desconhecido'}`);
    }
    setIsLoading(false);
  }, []);

  const importFromCsv = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCsvData(text);
      if (parsed.length === 0) {
        toast.error('Formato CSV não reconhecido. Verifique se há uma coluna "Nome" ou "Aluno".');
        setIsLoading(false);
        return;
      }
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados do CSV!`);
    } catch (e: any) {
      console.error('Falha ao importar CSV:', e);
      toast.error(`Falha ao importar CSV: ${e.message || 'erro desconhecido'}`);
    }
    setIsLoading(false);
  }, []);

  const importFromJson = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseJsonData(text);
      if (parsed.length === 0) {
        toast.error('Formato JSON não reconhecido. Verifique a estrutura do arquivo.');
        setIsLoading(false);
        return;
      }
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados do JSON!`);
    } catch (e: any) {
      console.error('Falha ao importar JSON:', e);
      toast.error(`Falha ao importar JSON: ${e.message || 'erro desconhecido'}`);
    }
    setIsLoading(false);
  }, []);

  const resetToMock = useCallback(async () => {
    setIsLoading(true);
    await supabase.from('students').delete().neq('name', '');
    await upsertStudents(MOCK_STUDENTS);
    toast.success('Dados restaurados para demonstração!');
    setIsLoading(false);
  }, []);

  const clearEvolutionEvent = useCallback(() => {
    setEvolutionEvent(null);
  }, []);

  return {
    students,
    isLoading,
    lastUpdate,
    addStudent,
    removeStudent,
    updateStudent,
    addTask,
    removeTask,
    updateTaskScore,
    importFromSheet,
    importFromCsv,
    importFromJson,
    resetToMock,
    evolutionEvent,
    clearEvolutionEvent,
  };
}
