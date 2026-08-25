/**
 * mockData.js
 * Responsabilidad (sección 15/23): datos temporales para el Corte 1
 * (preguntas, niveles, tableros, tarjetas, puntajes). Serán reemplazados por
 * datos de API en el Corte 2 (Screen -> gameService -> apiClient -> API).
 */
export const mockTriviaQuestions = [
  { id: 1, question: '¿Capital de Colombia?', options: ['Bogotá', 'Medellín', 'Cali'], answer: 'Bogotá' },
];

export const mockMemoramaCards = [
  { id: 1, pairId: 'a' },
  { id: 2, pairId: 'a' },
];

export const mockSudokuBoard = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

export const mockRanking = [
  { user: 'estudiante1@uts.edu.co', score: 850 },
];
