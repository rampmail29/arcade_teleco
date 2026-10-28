import type { TriviaQuestion, MemoramaCard, RankingEntry } from '../types';

export const mockTriviaQuestions: TriviaQuestion[] = [
  { id: 1, question: '¿Capital de Colombia?', options: ['Bogotá', 'Medellín', 'Cali'], answer: 'Bogotá' },
];

export const mockMemoramaCards: MemoramaCard[] = [
  { id: 1, pairId: 'a' },
  { id: 2, pairId: 'a' },
];

export const mockSudokuBoard: number[][] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

export const mockRanking: RankingEntry[] = [
  { user: 'estudiante1@uts.edu.co', score: 850 },
];

// Mejor puntaje inicial de Robot Run (Corte 1). scoreService lo usa como
// valor de partida hasta que exista un récord guardado en el dispositivo.
export const mockRobotRunBestScore = 0;
