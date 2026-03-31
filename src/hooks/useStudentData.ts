import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';

const SHEET_ID = '1Ym7XwuWa-Wm7zsbEsiKcQ6A3cvv9Z3UPby0O405k16g';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function parseSheetData(text: string): Student[] {
  try {
    // Google Sheets returns JSONP-like format: google.visualization.Query.setResponse({...})
    const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows;
    const cols = data.table.cols;

    if (!rows || rows.length === 0) return [];

    // Find column headers
    const headers: string[] = cols.map((col: any) => (col.label || '').toString().toLowerCase().trim());

    // Find key columns
    const nameIdx = headers.findIndex((h: string) => h.includes('nome') || h.includes('aluno') || h.includes('name'));
    const pokemonIdx = headers.findIndex((h: string) => h.includes('pokémon') || h.includes('pokemon'));
    const typeIdx = headers.findIndex((h: string) => h.includes('tipo') || h.includes('type'));

    if (nameIdx === -1 || pokemonIdx === -1) {
      console.warn('Could not find required columns in sheet. Headers:', headers);
      return [];
    }

    // Task columns are everything after type that's not "total"
    const taskIndices: number[] = [];
    const totalIdx = headers.findIndex((h: string) => h.includes('total'));
    
    for (let i = 0; i < headers.length; i++) {
      if (i !== nameIdx && i !== pokemonIdx && i !== typeIdx && i !== totalIdx) {
        if (headers[i] && (headers[i].includes('tarefa') || headers[i].includes('task') || /^\d+$/.test(headers[i]))) {
          taskIndices.push(i);
        }
      }
    }

    // If no specific task columns found, use all numeric columns after type
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
  } catch (e) {
    console.error('Error parsing sheet data:', e);
    return [];
  }
}

export function useStudentData(refreshInterval = 10000) {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [usingMock, setUsingMock] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(SHEET_URL, { cache: 'no-store' });
      const text = await res.text();
      const parsed = parseSheetData(text);
      if (parsed.length > 0) {
        setStudents(parsed);
        setUsingMock(false);
      } else {
        setStudents(MOCK_STUDENTS);
        setUsingMock(true);
      }
    } catch {
      console.warn('Failed to fetch sheet, using mock data');
      setStudents(MOCK_STUDENTS);
      setUsingMock(true);
    }
    setLastUpdate(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { students, isLoading, lastUpdate, usingMock, refetch: fetchData };
}
