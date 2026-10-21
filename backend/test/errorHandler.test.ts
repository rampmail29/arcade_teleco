import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Response } from 'express';
import { errorHandler, HttpError } from '../src/middleware/errorHandler.js';

function fakeResponse() {
  const calls: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      calls.status = code;
      return res;
    },
    json(body: unknown) {
      calls.body = body;
      return res;
    },
  } as unknown as Response;
  return { res, calls };
}

test('un error inesperado (no HttpError) responde 500 sin filtrar el mensaje original', () => {
  const { res, calls } = fakeResponse();
  const sensitive = new Error('ENOENT: /home/ploonfy/VS Code Projects/arcade_teleco/backend/prisma/dev.db');

  errorHandler(sensitive, {} as never, res, (() => {}) as never);

  assert.equal(calls.status, 500);
  assert.deepEqual(calls.body, { error: 'Error interno' });
});

test('un HttpError sí expone su propio mensaje de validación', () => {
  const { res, calls } = fakeResponse();

  errorHandler(new HttpError(404, 'No existe el juego "x"'), {} as never, res, (() => {}) as never);

  assert.equal(calls.status, 404);
  assert.deepEqual(calls.body, { error: 'No existe el juego "x"' });
});
