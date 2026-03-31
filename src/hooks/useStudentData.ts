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

function inferPokemonType(pokemon: string): string {
  const starter = STARTER_POKEMON.find(s => s.name.toLowerCase() === pokemon.toLowerCase());
  return starter?.type || 'normal';
}

function findHeaderAndSlice(text: string): string {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    if (/nome/i.test(lines[i])) {
      return lines.slice(i).join('\n');
    }
  }
  return text;
}

const SKIP_PATTERNS = ['total', 'soma', 'matricula', 'evoluc', 'evoluç', 'média', 'media', 'resultado'];
const NOTA_PATTERNS = ['nota'];
const TASK_KEYWORDS = ['tarefa', 'task', 'atividade', 'projeto'];

function isSkipColumn(name: string): boolean {
  const l = name.toLowerCase().trim();
  return SKIP_PATTERNS.some(p => l.includes(p));
}

function isNotaColumn(name: string): boolean {
  const l = name.toLowerCase().trim();
  return NOTA_PATTERNS.some(p => l.includes(p));
}

function isTaskColumn(name: string): boolean {
  const l = name.toLowerCase().trim();
  return TASK_KEYWORDS.some(k => l.includes(k));
}

/** Extract nota1/2/3 from nota columns found in the data */
function extractNotas(notaKeys: string[], row: any): { nota1: number; nota2: number; nota3: number } {
  const notas = notaKeys.map(k => Number(row[k]) || 0);
  return {
    nota1: notas[0] || 0,
    nota2: notas[1] || 0,
    nota3: notas[2] || 0,
  };
}

function parseCsvData(text: string): Student[] {
  try {
    const cleanText = findHeaderAndSlice(text);
    const result = Papa.parse(cleanText, { header: true, skipEmptyLines: true });
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
      toast.error('Coluna "NOME" não encontrada no CSV.');
      return [];
    }

    // Find nota columns (Nota 1, Nota 2, Nota 3)
    const notaKeys = (result.meta.fields || [])
      .filter(f => isNotaColumn(f) && !isSkipColumn(f))
      .sort();
    console.log('[CSV] Colunas de nota:', notaKeys);

    const skipKeys = new Set([nameKey, pokemonKey, typeKey].filter(Boolean) as string[]);
    for (const f of (result.meta.fields || [])) {
      if (isSkipColumn(f) || isNotaColumn(f)) skipKeys.add(f);
    }

    let taskKeys = (result.meta.fields || []).filter(f => {
      if (skipKeys.has(f)) return false;
      return isTaskColumn(f);
    });
    if (taskKeys.length === 0) {
      taskKeys = (result.meta.fields || []).filter(f => !skipKeys.has(f) && f.trim() !== '');
    }

    console.log('[CSV] Colunas de tarefa:', taskKeys);

    return (result.data as any[])
      .filter(row => row[nameKey] && String(row[nameKey]).trim() !== '')
      .map(row => {
        const tasks = taskKeys.map((k, i) => ({
          name: k.trim() || `Atividade ${String(i + 1).padStart(2, '0')}`,
          score: Number(row[k]) || 0,
        }));
        const pokemon = pokemonKey ? String(row[pokemonKey] || 'bulbasaur').toLowerCase().trim() : 'bulbasaur';
        const type = typeKey ? String(row[typeKey] || '').toLowerCase().trim() : inferPokemonType(pokemon);
        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        const notas = notaKeys.length > 0 ? extractNotas(notaKeys, row) : { nota1: 0, nota2: 0, nota3: 0 };
        return {
          name: String(row[nameKey]).trim(),
          pokemon,
          type: type || inferPokemonType(pokemon),
          tasks,
          totalScore,
          ...notas,
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

    const headers: string[] = cols.map((col: any) => (col.label || '').toString().toLowerCase().trim());
    const nameIdx = headers.findIndex((h: string) => h.includes('nome') || h.includes('aluno'));
    const pokemonIdx = headers.findIndex((h: string) => h.includes('pokémon') || h.includes('pokemon'));
    const typeIdx = headers.findIndex((h: string) => h.includes('tipo') || h.includes('type'));
    if (nameIdx === -1) return [];

    // Find nota column indices
    const notaIndices: number[] = [];
    const skipIndices = new Set([nameIdx, pokemonIdx, typeIdx].filter(i => i >= 0));
    for (let i = 0; i < headers.length; i++) {
      if (isNotaColumn(headers[i]) && !isSkipColumn(headers[i])) {
        notaIndices.push(i);
        skipIndices.add(i);
      } else if (isSkipColumn(headers[i])) {
        skipIndices.add(i);
      }
    }

    const taskIndices: number[] = [];
    for (let i = 0; i < headers.length; i++) {
      if (skipIndices.has(i)) continue;
      if (headers[i] && isTaskColumn(headers[i])) taskIndices.push(i);
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
        const notaValues = notaIndices.map(idx => Number(row.c[idx]?.v) || 0);
        return {
          name: String(row.c[nameIdx]?.v || ''),
          pokemon,
          type: type || inferPokemonType(pokemon),
          tasks,
          totalScore,
          nota1: notaValues[0] || 0,
          nota2: notaValues[1] || 0,
          nota3: notaValues[2] || 0,
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
          score: Number(t.score || t.pontos || t.nota || 0),
        })) : [];
        return {
          name, pokemon, type, tasks,
          totalScore: tasks.reduce((sum: number, t: any) => sum + t.score, 0),
          nota1: Number(d.nota1 || 0),
          nota2: Number(d.nota2 || 0),
          nota3: Number(d.nota3 || 0),
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
  const [evolutionEvent, setEvolutionEvent] = useState<EvolutionEvent | null>(null);
  const studentsRef = useRef<Student[]>([]);

  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { fetchStudents(); }, []);

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
      if (newStage > oldStage) {
        setEvolutionEvent({ studentName, pokemon: student.pokemon, oldStage, newStage });
      }
    }
  }, []);

  const importFromSheet = useCallback(async (sheetUrl: string) => {
    setIsLoading(true);
    try {
      const csvUrl = buildSheetCsvUrl(sheetUrl);
      if (!csvUrl) {
        toast.error('URL inválida.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem(SHEET_URL_KEY, sheetUrl);
      const { data: fnData, error: fnError } = await supabase.functions.invoke('import-sheet', { body: { url: csvUrl } });
      if (fnError) throw new Error(fnError.message);
      const text = typeof fnData === 'string' ? fnData : JSON.stringify(fnData);
      const parsed = parseCsvData(text);
      if (parsed.length === 0) {
        toast.error('Nenhum aluno encontrado. Verifique se a planilha está publicada na web e possui uma coluna "NOME".');
        setIsLoading(false);
        return;
      }
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados!`);
    } catch (e: any) {
      toast.error(`Falha ao importar: ${e.message || 'erro desconhecido'}`);
    }
    setIsLoading(false);
  }, []);

  const refreshFromSheet = useCallback(async () => {
    const savedUrl = localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL;
    await importFromSheet(savedUrl);
  }, [importFromSheet]);

  const importFromCsv = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCsvData(text);
      if (parsed.length === 0) { toast.error('CSV não reconhecido.'); setIsLoading(false); return; }
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados!`);
    } catch (e: any) { toast.error(`Falha: ${e.message}`); }
    setIsLoading(false);
  }, []);

  const importFromJson = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseJsonData(text);
      if (parsed.length === 0) { toast.error('JSON não reconhecido.'); setIsLoading(false); return; }
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
      toast.success(`${parsed.length} alunos importados!`);
    } catch (e: any) { toast.error(`Falha: ${e.message}`); }
    setIsLoading(false);
  }, []);

  const resetToMock = useCallback(async () => {
    setIsLoading(true);
    await supabase.from('students').delete().neq('name', '');
    await upsertStudents(MOCK_STUDENTS);
    toast.success('Dados resetados!');
    setIsLoading(false);
  }, []);

  const clearEvolutionEvent = useCallback(() => setEvolutionEvent(null), []);

  return {
    students, isLoading, lastUpdate,
    addStudent, removeStudent, updateStudent, updateNotas,
    addTask, removeTask, updateTaskScore,
    importFromSheet, importFromCsv, importFromJson,
    refreshFromSheet, resetToMock,
    evolutionEvent, clearEvolutionEvent,
  };
}
