/**
 * environment.js
 * Responsabilidad (sección 13): centralizar configuración del entorno.
 * NO escribir URLs de backend directamente en componentes.
 */
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
};
