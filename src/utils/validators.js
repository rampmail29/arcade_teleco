/**
 * validators.js
 * Responsabilidad (sección 14): validaciones puras (sin efectos secundarios).
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}
