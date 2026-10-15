import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { seedGames, GAME_FIXTURES } from '../prisma/seed.js';

before(async () => {
  await seedGames(prisma);
});

beforeEach(async () => {
  await prisma.score.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

test('GET /api/games devuelve los 5 juegos sembrados', async () => {
  const response = await request(app).get('/api/games');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, GAME_FIXTURES.length);
  assert.deepEqual(
    response.body.map((g: { id: string }) => g.id).sort(),
    GAME_FIXTURES.map((g) => g.id).sort(),
  );
});

test('GET /api/games/:id devuelve un juego existente', async () => {
  const response = await request(app).get('/api/games/trivia');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 'trivia');
  assert.equal(response.body.title, 'Trivia');
});

test('GET /api/games/:id responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/games/no-existe');
  assert.equal(response.status, 404);
  assert.ok(response.body.error);
});
