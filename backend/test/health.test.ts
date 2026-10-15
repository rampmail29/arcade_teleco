import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('GET /api/health responde 200 con status ok', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('responde con cabeceras CORS para que el target web de Expo pueda consumir la API', async () => {
  const response = await request(app).get('/api/health').set('Origin', 'http://localhost:8081');
  assert.equal(response.headers['access-control-allow-origin'], '*');
});
