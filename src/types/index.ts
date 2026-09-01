/**
 * types/index.ts
 * Tipos e interfaces compartidos por toda la aplicación.
 */
import type { User as FirebaseUser } from 'firebase/auth';

// ── Auth ──
export interface AuthContextType {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

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

export type AuthStackParamList = {
  Login: undefined;
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
