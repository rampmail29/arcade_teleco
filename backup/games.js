/**
 * games.js
 * Responsabilidad (sección 15/16): catálogo central de juegos.
 * El Game Hub (GameGrid) debe consumir este catálogo; NO codificar cinco
 * botones independientes manualmente, o la cantidad de botones según la cantidad de juegos que salgan.
 */
export const games = [
  { id: 'trivia', title: 'Trivia', description: 'Preguntas y respuestas', icon: 'trivia', route: 'Trivia' },
  { id: 'memorama', title: 'Memorama', description: 'Encuentra las parejas', icon: 'memorama', route: 'Memorama' },
  { id: 'sudoku', title: 'Sudoku', description: 'Completa la cuadrícula', icon: 'sudoku', route: 'Sudoku' },
  { id: 'game4', title: 'Juego 4', description: 'Cuarto juego demostrativo', icon: 'game4', route: 'Game4' },
  //...y así sucesivamente
];
