import type { Game } from '../types';

export const games: Game[] = [
  { id: 'trivia', title: 'Trivia', description: 'Preguntas y respuestas', icon: 'trivia', route: 'Trivia' },
  { id: 'memorama', title: 'Memorama', description: 'Encuentra las parejas', icon: 'memorama', route: 'Memorama' },
  { id: 'sudoku', title: 'Sudoku', description: 'Completa la cuadrícula', icon: 'sudoku', route: 'Sudoku' },
  { id: 'game4', title: 'Juego 4', description: 'Cuarto juego demostrativo', icon: 'game4', route: 'Game4' },
];
