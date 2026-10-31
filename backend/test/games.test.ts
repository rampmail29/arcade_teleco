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

test('GET /api/games devuelve los juegos sembrados', async () => {
  const response = await request(app).get('/api/games');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, GAME_FIXTURES.length);
  assert.deepEqual(
    response.body.map((g: { id: string }) => g.id).sort(),
    GAME_FIXTURES.map((g) => g.id).sort(),
  );
});

test('GET /api/games incluye triki, racing y buscaminas (ya mergeados/en PR en el frontend, les faltaba el seed)', async () => {
  const response = await request(app).get('/api/games');
  const ids = response.body.map((g: { id: string }) => g.id);
  assert.ok(ids.includes('triki'), 'falta "triki" en el seed');
  assert.ok(ids.includes('racing'), 'falta "racing" en el seed');
  assert.ok(ids.includes('buscaminas'), 'falta "buscaminas" en el seed');
});

test('POST /api/games/racing/scores ya no responde 404 (racingService.ts lo llama en producción)', async () => {
  const response = await request(app)
    .post('/api/games/racing/scores')
    .send({ score: 42, email: 'piloto@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 42, isNewRecord: true });
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

test('POST /api/games/:id/scores guarda un puntaje nuevo y lo marca como récord', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 100, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: true });
});

test('POST /api/games/:id/scores no marca récord si el puntaje es menor al guardado', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 100, email: 'ana@uts.edu.co' });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 50, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: false });
});

test('POST /api/games/:id/scores trata el mismo correo en mayúsculas/minúsculas como el mismo usuario', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 70, email: 'Ana@UTS.edu.co' });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 90, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 90, isNewRecord: true });

  const usersCount = await prisma.user.count({ where: { email: 'ana@uts.edu.co' } });
  assert.equal(usersCount, 1);
});

test('POST /api/games/:id/scores responde 400 si score es decimal o negativo', async () => {
  const decimal = await request(app).post('/api/games/trivia/scores').send({ score: 10.5, email: 'ana@uts.edu.co' });
  assert.equal(decimal.status, 400);

  const negativo = await request(app).post('/api/games/trivia/scores').send({ score: -5, email: 'ana@uts.edu.co' });
  assert.equal(negativo.status, 400);
});

test('POST /api/games/:id/scores responde 400 si score excede el máximo de un INT de 32 bits', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .send({ score: 2147483648, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 400);
  assert.ok(response.body.error);

  const history = await request(app).get('/api/games/trivia/history');
  assert.equal(history.status, 200);
  assert.equal(history.body.length, 0);
});

test('POST /api/games/:id/scores responde 400 si el email no es válido', async () => {
  const response = await request(app).post('/api/games/trivia/scores').send({ score: 10, email: 'no-es-correo' });
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 400 con body vacío', async () => {
  const response = await request(app).post('/api/games/trivia/scores').send({});
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 400 (no 500) sin body ni Content-Type', async () => {
  const response = await request(app).post('/api/games/trivia/scores');
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 400 (no 500) con JSON mal formado', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Content-Type', 'application/json')
    .send('{esto no es json');
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 404 si el juego no existe', async () => {
  const response = await request(app)
    .post('/api/games/no-existe/scores')
    .send({ score: 10, email: 'ana@uts.edu.co' });
  assert.equal(response.status, 404);
});

test('GET /api/games/:id/history devuelve las partidas más recientes primero', async () => {
  await request(app).post('/api/games/memorama/scores').send({ score: 10, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/memorama/scores').send({ score: 20, email: 'ana@uts.edu.co' });

  const response = await request(app).get('/api/games/memorama/history');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 2);
  assert.equal(response.body[0].value, 20);
  assert.equal(response.body[1].value, 10);
  assert.equal(response.body[0].email, 'ana@uts.edu.co');
});

test('GET /api/games/:id/history con limit inválido cae al default de 20', async () => {
  const response = await request(app).get('/api/games/memorama/history').query({ limit: 'abc' });
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /api/games/:id/history responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/games/no-existe/history');
  assert.equal(response.status, 404);
});

test('GET /api/rankings sin gameId devuelve el mejor puntaje de cada usuario entre todos sus juegos', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 30, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/sudoku/scores').send({ score: 90, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/trivia/scores').send({ score: 50, email: 'bea@uts.edu.co' });

  const response = await request(app).get('/api/rankings');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    { user: 'ana@uts.edu.co', score: 90 },
    { user: 'bea@uts.edu.co', score: 50 },
  ]);
});

test('GET /api/rankings?gameId= filtra por juego', async () => {
  await request(app).post('/api/games/trivia/scores').send({ score: 30, email: 'ana@uts.edu.co' });
  await request(app).post('/api/games/trivia/scores').send({ score: 50, email: 'bea@uts.edu.co' });
  await request(app).post('/api/games/sudoku/scores').send({ score: 999, email: 'ana@uts.edu.co' });

  const response = await request(app).get('/api/rankings').query({ gameId: 'trivia' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    { user: 'bea@uts.edu.co', score: 50 },
    { user: 'ana@uts.edu.co', score: 30 },
  ]);
});

test('GET /api/rankings?gameId= responde 404 si el juego no existe', async () => {
  const response = await request(app).get('/api/rankings').query({ gameId: 'no-existe' });
  assert.equal(response.status, 404);
});

test('GET /api/rankings devuelve [] si no hay puntajes guardados', async () => {
  const response = await request(app).get('/api/rankings');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});
