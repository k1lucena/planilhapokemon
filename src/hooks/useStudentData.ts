import { useState, useEffect, useCallback, useRef } from 'react';
import { Student } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

const SHEET_ID = '1Ym7XwuWa-Wm7zsbEsiKcQ6A3cvv9Z3UPby0O405k16g';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function recalcTotal(student: Student): Student {
  return { ...student, totalScore: student.tasks.reduce((sum, t) => sum + t.score, 0) };
}

function parseSheetData(text: string): Student[] {
  try {
    const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows;
    const cols = data.table.cols;
    if (!rows || rows.length === 0) return [];

    const headers: string[] = cols.map((col: any) => (col.label || '').toString().toLowerCase().trim());
    const nameIdx = headers.findIndex((h: string) => h.includes('nome') || h.includes('aluno') || h.includes('name'));
    const pokemonIdx = headers.findIndex((h: string) => h.includes('pokémon') || h.includes('pokemon'));
    const typeIdx = headers.findIndex((h: string) => h.includes('tipo') || h.includes('type'));
    if (nameIdx === -1 || pokemonIdx === -1) return [];

    const taskIndices: number[] = [];
    const totalIdx = headers.findIndex((h: string) => h.includes('total'));
    for (let i = 0; i < headers.length; i++) {
      if (i !== nameIdx && i !== pokemonIdx && i !== typeIdx && i !== totalIdx) {
        if (headers[i] && (headers[i].includes('tarefa') || headers[i].includes('task') || /^\d+$/.test(headers[i]))) {
          taskIndices.push(i);
        }
      }
    }
    if (taskIndices.length === 0) {
      for (let i = Math.max(nameIdx, pokemonIdx, typeIdx) + 1; i < headers.length; i++) {
        if (i !== totalIdx) taskIndices.push(i);
      }
    }

    return rows
      .filter((row: any) => row.c && row.c[nameIdx]?.v)
      .map((row: any) => {
        const tasks = taskIndices.map((idx, i) => ({
          name: headers[idx] || `Tarefa ${i + 1}`,
          score: Number(row.c[idx]?.v) || 0,
        }));
        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        return {
          name: String(row.c[nameIdx]?.v || ''),
          pokemon: String(row.c[pokemonIdx]?.v || '').toLowerCase().trim(),
          type: typeIdx >= 0 ? String(row.c[typeIdx]?.v || 'normal').toLowerCase().trim() : 'normal',
          tasks,
          totalScore,
        };
      });
  } catch {
    return [];
  }
}

function parseCsvData(text: string): Student[] {
  try {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (!result.data || result.data.length === 0) return [];
    
    const headers = result.meta.fields?.map(f => f.toLowerCase().trim()) || [];
    const nameKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase();
      return l.includes('nome') || l.includes('aluno') || l.includes('name');
    });
    const pokemonKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase();
      return l.includes('pokémon') || l.includes('pokemon');
    });
    const typeKey = result.meta.fields?.find(f => {
      const l = f.toLowerCase();
      return l.includes('tipo') || l.includes('type');
    });

    if (!nameKey || !pokemonKey) return [];

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
        const totalScore = tasks.reduce((sum, t) => sum + t.score, 0);
        return {
          name: String(row[nameKey]),
          pokemon: String(row[pokemonKey] || '').toLowerCase().trim(),
          type: typeKey ? String(row[typeKey] || 'normal').toLowerCase().trim() : 'normal',
          tasks,
          totalScore,
        };
      });
  } catch {
    return [];
  }
}

function parseJsonData(text: string): Student[] {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    return data
      .filter((d: any) => d.name && d.pokemon)
      .map((d: any) => {
        const tasks = Array.isArray(d.tasks) ? d.tasks.map((t: any) => ({
          name: String(t.name || ''),
          score: Number(t.score) || 0,
        })) : [];
        return {
          name: String(d.name),
          pokemon: String(d.pokemon).toLowerCase().trim(),
          type: String(d.type || 'normal').toLowerCase().trim(),
          tasks,
          totalScore: tasks.reduce((sum: number, t: any) => sum + t.score, 0),
        };
      });
  } catch {
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

  // Keep ref in sync
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // Initial fetch
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
      // Empty DB — seed with mock data
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
      tasks: s.tasks,
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
    const row = { name: student.name, pokemon: student.pokemon, type: student.type, tasks, total_score: totalScore };
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
      tasks: updated.tasks,
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
      const res = await fetch(SHEET_URL, { cache: 'no-store' });
      const text = await res.text();
      const parsed = parseSheetData(text);
      if (parsed.length > 0) {
        // Clear existing and insert new
        await supabase.from('students').delete().neq('name', '');
        await upsertStudents(parsed);
      }
    } catch {
      console.warn('Falha ao importar do Sheets');
    }
    setIsLoading(false);
  }, []);

  const importFromCsv = useCallback(async (file: File) => {
    setIsLoading(true);
    const text = await file.text();
    const parsed = parseCsvData(text);
    if (parsed.length > 0) {
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
    }
    setIsLoading(false);
  }, []);

  const importFromJson = useCallback(async (file: File) => {
    setIsLoading(true);
    const text = await file.text();
    const parsed = parseJsonData(text);
    if (parsed.length > 0) {
      await supabase.from('students').delete().neq('name', '');
      await upsertStudents(parsed);
    }
    setIsLoading(false);
  }, []);

  const resetToMock = useCallback(async () => {
    setIsLoading(true);
    await supabase.from('students').delete().neq('name', '');
    await upsertStudents(MOCK_STUDENTS);
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
