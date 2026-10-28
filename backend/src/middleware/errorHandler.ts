import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function statusOf(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  // express.json() reporta JSON mal formado como SyntaxError con status/statusCode 400.
  const candidate = err as { status?: unknown; statusCode?: unknown };
  const reported = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode;
  if (typeof reported === 'number' && reported >= 400 && reported < 500) return reported;
  return 500;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = statusOf(err);
  if (status === 500) {
    console.error(err);
  }
  // Para 500 nunca se devuelve err.message al cliente: puede incluir rutas de archivo
  // o detalles internos de Prisma. Para 4xx sí, porque son mensajes de validación propios.
  const message = status === 500 ? 'Error interno' : err instanceof Error ? err.message : 'Solicitud inválida';
  res.status(status).json({ error: message });
};
