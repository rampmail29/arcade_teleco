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
