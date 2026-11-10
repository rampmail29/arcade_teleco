/**
 * Parámetros de Buscaminas. Ajustar el tamaño de la grilla o la cantidad de
 * minas se hace aquí, sin tocar el motor.
 */

export const GAME_ID = 'buscaminas';

export const GRID = {
  rows: 8,
  cols: 8,
  mines: 10,
};

export const SCORE = {
  winBonus: 50, // puntos extra al revelar todas las celdas seguras
};
