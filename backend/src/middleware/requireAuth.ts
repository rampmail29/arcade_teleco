import type { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { HttpError } from './errorHandler.js';

/** Request ya autenticado por requireAuth: trae el email verificado del token. */
export interface AuthedRequest<P = Record<string, string>> extends Request<P> {
  userEmail?: string;
}

// Se resuelve recién en el primer request real (no al importar el módulo),
// para que los tests puedan fijar SUPABASE_URL antes de que esto se use.
let jwks: JWTVerifyGetKey | undefined;
function getJwks(): JWTVerifyGetKey {
  if (!jwks) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Falta SUPABASE_URL en el entorno');
    }
    jwks = createRemoteJWKSet(new URL('/auth/v1/.well-known/jwks.json', supabaseUrl));
  }
  return jwks;
}

/**
 * Exige un token de Supabase válido (Authorization: Bearer <token>) y expone
 * el email verificado en req.userEmail. Se verifica contra el JWKS público
 * del proyecto de Supabase (misma URL que ya usa el frontend) — no requiere
 * ningún secreto compartido con el grupo de Auth.
 */
export async function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new HttpError(401, 'Falta el encabezado Authorization: Bearer <token>'));
    return;
  }
  const token = header.slice('Bearer '.length);
  try {
    const { payload } = await jwtVerify(token, getJwks());
    if (typeof payload.email !== 'string' || !payload.email) {
      next(new HttpError(401, 'El token no trae un email válido'));
      return;
    }
    req.userEmail = payload.email;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Token inválido o expirado'));
  }
}
