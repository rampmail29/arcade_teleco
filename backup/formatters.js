/**
 * formatters.js
 * Responsabilidad (sección 14): funciones de formato puras.
 * NO convertir utils/ en un cajón de sastre (regla explícita del documento).
 */
export function formatScore(score) {
  return score.toLocaleString('es-CO');
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('es-CO');
}
