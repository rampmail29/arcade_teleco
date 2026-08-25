/**
 * apiClient
 * Responsabilidad (sección 11): cliente HTTP común, preparado en el Corte 1
 * SIN backend real todavía. En el Corte 2, los services (gameService,
 * userService, rankingService, scoreService) consumirán este cliente en vez
 * de que cada uno cree su propio fetch.
 *
 *   gameService / userService / rankingService
 *              |
 *              v
 *          apiClient
 *              |
 *              v
 *            HTTP
 *              |
 *              v
 *           API REST
 *
 * NO crear un fetch independiente por grupo/juego (regla sección 11/18).
 */
import { ENV } from '../config/environment';

async function request(path, options = {}) {
  const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error de API: ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
