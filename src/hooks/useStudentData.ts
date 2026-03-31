import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';

const STORAGE_KEY = 'pokedex-arena-students';
const SHEET_ID = '1Ym7XwuWa-Wm7zsbEsiKcQ6A3cvv9Z3UPby0O405k16g';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function recalcTotal(student: Student): Student {
  return { ...student, totalScore: student.tasks.reduce((sum, t) => sum + t.score, 0) };
}

function loadFromStorage(): Student[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
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

export function useStudentData() {
  const [students, setStudents] = useState<Student[]>(() => {
    const stored = loadFromStorage();
    return stored || MOCK_STUDENTS;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Persist on every change
  useEffect(() => {
    saveToStorage(students);
    setLastUpdate(new Date());
  }, [students]);

  const addStudent = useCallback((student: Omit<Student, 'tasks' | 'totalScore'> & { tasks?: Student['tasks'] }) => {
    setStudents(prev => {
      if (prev.some(s => s.name.toLowerCase() === student.name.toLowerCase())) return prev;
      const tasks = student.tasks || prev[0]?.tasks.map(t => ({ name: t.name, score: 0 })) || [];
      const newStudent: Student = { ...student, tasks, totalScore: tasks.reduce((s, t) => s + t.score, 0) };
      return [...prev, newStudent];
    });
  }, []);

  const removeStudent = useCallback((name: string) => {
    setStudents(prev => prev.filter(s => s.name !== name));
  }, []);

  const updateStudent = useCallback((originalName: string, updates: Partial<Pick<Student, 'name' | 'pokemon' | 'type'>>) => {
    setStudents(prev => prev.map(s => {
      if (s.name !== originalName) return s;
      return { ...s, ...updates };
    }));
  }, []);

  const addTask = useCallback((taskName: string) => {
    setStudents(prev => prev.map(s => {
      if (s.tasks.some(t => t.name === taskName)) return s;
      const updated = { ...s, tasks: [...s.tasks, { name: taskName, score: 0 }] };
      return recalcTotal(updated);
    }));
  }, []);

  const removeTask = useCallback((taskName: string) => {
    setStudents(prev => prev.map(s => {
      const updated = { ...s, tasks: s.tasks.filter(t => t.name !== taskName) };
      return recalcTotal(updated);
    }));
  }, []);

  const updateTaskScore = useCallback((studentName: string, taskName: string, score: number) => {
    setStudents(prev => prev.map(s => {
      if (s.name !== studentName) return s;
      const updated = { ...s, tasks: s.tasks.map(t => t.name === taskName ? { ...t, score } : t) };
      return recalcTotal(updated);
    }));
  }, []);

  const importFromSheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(SHEET_URL, { cache: 'no-store' });
      const text = await res.text();
      const parsed = parseSheetData(text);
      if (parsed.length > 0) {
        setStudents(parsed);
      }
    } catch {
      console.warn('Falha ao importar do Sheets');
    }
    setIsLoading(false);
  }, []);

  const resetToMock = useCallback(() => {
    setStudents(MOCK_STUDENTS);
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
    resetToMock,
  };
}
