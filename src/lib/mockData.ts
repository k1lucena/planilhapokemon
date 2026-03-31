import { Student } from './types';

const T = (s: number) => s;

const TASK_NAMES = [
  'Atividade 01 - Apresentação',
  'Atividade 02 - Estudos de Casos',
  'Atividade 03 - Desenho (Duplas)',
  'Atividade 04 - Indent. de Probl.',
  'Atividade 05 - Entrevistas',
  'Atividade 06 - Personas',
  'Atividade 07 - Protótipos',
  'Atividade 08 - Desafio Cabide',
  'Atividade 09 - Tela App',
  'Atividade 10 - Questionário UEQ',
  'Projeto Final',
];

function mkTasks(scores: number[]) {
  return scores.map((s, i) => ({ name: TASK_NAMES[i], score: s }));
}

function mkStudent(name: string, pokemon: string, type: string, scores: number[]): Student {
  const tasks = mkTasks(scores);
  return { name, pokemon, type, tasks, totalScore: scores.reduce((a, b) => a + b, 0) };
}

export const MOCK_STUDENTS: Student[] = [
  mkStudent('MIGUEL',           'charizard',  'fire',  [0, 10, 5, 10, 10, 15, 40, 20, 40, 20, 100]),
  mkStudent('HELLEN',           'blastoise',  'water', [5, 10, 5, 10, 10, 15, 40, 20, 30, 20, 70]),
  mkStudent('CHICO',            'wartortle',   'water', [5, 5, 5, 5, 5, 5, 15, 10, 20, 20, 100]),
  mkStudent('LORENA',           'venusaur',   'grass', [5, 10, 5, 10, 10, 15, 30, 20, 30, 20, 90]),
  mkStudent('ADONES',           'venusaur',   'grass', [5, 10, 5, 10, 10, 15, 30, 20, 25, 20, 100]),
  mkStudent('CARLOS',           'venusaur',   'grass', [5, 10, 5, 10, 10, 10, 40, 20, 25, 20, 70]),
  mkStudent('GABRIEL MACHADO',  'venusaur',   'grass', [5, 10, 5, 10, 10, 15, 30, 20, 30, 16, 70]),
  mkStudent('MATHEUS',          'charizard',  'fire',  [5, 10, 5, 10, 10, 10, 30, 20, 40, 20, 70]),
  mkStudent('PREFEITO',         'charmander', 'fire',  [5, 10, 5, 0, 0, 10, 10, 10, 10, 20, 10]),
  mkStudent('GDIAS',            'charizard',  'fire',  [5, 10, 5, 10, 10, 15, 30, 20, 40, 20, 80]),
  mkStudent('BAGGIO',           'charmeleon', 'fire',  [5, 10, 5, 10, 10, 10, 20, 20, 30, 20, 50]),
  mkStudent('EVANDERSON',       'blastoise',  'water', [5, 10, 5, 10, 10, 5, 40, 20, 30, 18, 95]),
  mkStudent('YURI',             'charizard',  'fire',  [5, 10, 5, 10, 10, 15, 30, 20, 30, 20, 90]),
  mkStudent('K1',               'charmander', 'water', [5, 10, 5, 10, 10, 15, 30, 20, 30, 20, 95]),
  mkStudent('BOLA',             'ivysaur',    'grass', [5, 10, 5, 10, 10, 5, 30, 20, 20, 20, 35]),
  mkStudent('HELENA',           'venusaur',   'grass', [5, 10, 5, 10, 10, 10, 40, 20, 30, 20, 70]),
  mkStudent('KAIOBA',           'bulbasaur',  'grass', [5, 10, 5, 0, 0, 0, 15, 20, 0, 20, 10]),
  mkStudent('GALVAO',           'blastoise',  'water', [0, 10, 0, 10, 10, 10, 20, 20, 30, 20, 90]),
  mkStudent('GABRIEL DA TRUFA', 'squirtle',   'water', [5, 10, 5, 0, 10, 0, 10, 10, 10, 10, 20]),
  mkStudent('JONATHA',          'blastoise',  'water', [5, 10, 5, 10, 10, 15, 50, 20, 30, 20, 70]),
];
