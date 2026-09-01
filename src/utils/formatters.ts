export function formatScore(score: number): string {
  return score.toLocaleString('es-CO');
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CO');
}
