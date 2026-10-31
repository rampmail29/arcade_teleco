import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { seedGames, GAME_FIXTURES } from '../prisma/seed.js';
import { startTestJwksServer, type TestJwksServer } from './helpers/jwks.js';

let jwksServer: TestJwksServer;
let anaToken: string;
let beaToken: string;

before(async () => {
  await seedGames(prisma);
  jwksServer = await startTestJwksServer();
  process.env.SUPABASE_URL = jwksServer.url;
  anaToken = await jwksServer.signToken('ana@uts.edu.co');
  beaToken = await jwksServer.signToken('bea@uts.edu.co');
});

beforeEach(async () => {
  // UserAchievement referencia a User con ON DELETE RESTRICT: hay que
  // limpiarla primero o el deleteMany de user falla si quedó algún logro
  // desbloqueado de otro archivo de test que comparte el mismo test.db.
  await prisma.userAchievement.deleteMany();
  await prisma.score.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
  await jwksServer.close();
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

test('POST /api/games/:id/scores sin Authorization responde 401', async () => {
  const response = await request(app).post('/api/games/trivia/scores').send({ score: 100 });
  assert.equal(response.status, 401);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores con token inválido responde 401', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', 'Bearer esto-no-es-un-jwt-valido')
    .send({ score: 100 });
  assert.equal(response.status, 401);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores guarda un puntaje nuevo y lo marca como récord', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 100 });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: true });
});

test('POST /api/games/:id/scores no marca récord si el puntaje es menor al guardado', async () => {
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 50 });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 100, isNewRecord: false });
});

test('POST /api/games/:id/scores trata el mismo correo en mayúsculas/minúsculas como el mismo usuario', async () => {
  const mixedCaseToken = await jwksServer.signToken('Ana@UTS.edu.co');
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${mixedCaseToken}`).send({ score: 70 });
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 90 });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { bestScore: 90, isNewRecord: true });

  const usersCount = await prisma.user.count({ where: { email: 'ana@uts.edu.co' } });
  assert.equal(usersCount, 1);
});

test('POST /api/games/:id/scores responde 400 si score es decimal o negativo', async () => {
  const decimal = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 10.5 });
  assert.equal(decimal.status, 400);

  const negativo = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: -5 });
  assert.equal(negativo.status, 400);
});

test('POST /api/games/:id/scores responde 400 si score excede el máximo de un INT de 32 bits', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 2147483648 });
  assert.equal(response.status, 400);
  assert.ok(response.body.error);

  const history = await request(app).get('/api/games/trivia/history');
  assert.equal(history.status, 200);
  assert.equal(history.body.length, 0);
});

test('POST /api/games/:id/scores responde 400 con body vacío', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({});
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 400 (no 500) con JSON mal formado', async () => {
  const response = await request(app)
    .post('/api/games/trivia/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .set('Content-Type', 'application/json')
    .send('{esto no es json');
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('POST /api/games/:id/scores responde 404 si el juego no existe', async () => {
  const response = await request(app)
    .post('/api/games/no-existe/scores')
    .set('Authorization', `Bearer ${anaToken}`)
    .send({ score: 10 });
  assert.equal(response.status, 404);
});

test('GET /api/games/:id/history devuelve las partidas más recientes primero', async () => {
  await request(app).post('/api/games/memorama/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 10 });
  await request(app).post('/api/games/memorama/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 20 });

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
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 30 });
  await request(app).post('/api/games/sudoku/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 90 });
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${beaToken}`).send({ score: 50 });

  const response = await request(app).get('/api/rankings');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    { user: 'ana@uts.edu.co', score: 90 },
    { user: 'bea@uts.edu.co', score: 50 },
  ]);
});

test('GET /api/rankings?gameId= filtra por juego', async () => {
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 30 });
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${beaToken}`).send({ score: 50 });
  await request(app).post('/api/games/sudoku/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 999 });

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
