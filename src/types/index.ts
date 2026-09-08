/**
 * types/index.ts
 * Tipos e interfaces compartidos por toda la aplicación.
 */

// ── Games ──
export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

// ── Navigation ──
export type RootStackParamList = {
  Home: undefined;
  Trivia: undefined;
  TriviaGame: undefined;
  TriviaResult: { score: number };
  Memorama: undefined;
  MemoramaGame: undefined;
  MemoramaResult: { score: number };
  Sudoku: undefined;
  SudokuGame: undefined;
  SudokuResult: { score: number };
  Game4: undefined;
  Game4Game: undefined;
  Game4Result: { score: number };
};

// ── Mock Data ──
export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface MemoramaCard {
  id: number;
  pairId: string;
}

export interface RankingEntry {
  user: string;
  score: number;
}

// ── API ──
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}
