import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { seedGames } from '../prisma/seed.js';
import { startTestJwksServer, type TestJwksServer } from './helpers/jwks.js';

let jwksServer: TestJwksServer;
let anaToken: string;

before(async () => {
  await seedGames(prisma);
  jwksServer = await startTestJwksServer();
  process.env.SUPABASE_URL = jwksServer.url;
  anaToken = await jwksServer.signToken('ana@uts.edu.co');
});

beforeEach(async () => {
  await prisma.userAchievement.deleteMany();
  await prisma.score.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
  await jwksServer.close();
});

test('GET /api/me/achievements sin Authorization responde 401', async () => {
  const response = await request(app).get('/api/me/achievements');
  assert.equal(response.status, 401);
});

test('GET /api/me/achievements de un usuario sin puntajes devuelve []', async () => {
  const response = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test('desbloquea "three_games_100" al llegar a 100+ puntos en 3 juegos distintos', async () => {
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });
  let achievements = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.deepEqual(achievements.body, []); // todavía solo 1 juego

  await request(app).post('/api/games/sudoku/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 120 });
  achievements = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.deepEqual(achievements.body, []); // todavía solo 2 juegos

  await request(app).post('/api/games/memorama/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });
  achievements = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.equal(achievements.status, 200);
  assert.equal(achievements.body.length, 1);
  assert.equal(achievements.body[0].id, 'three_games_100');
  assert.ok(achievements.body[0].title);
  assert.ok(achievements.body[0].unlockedAt);
});

test('no cuenta puntajes menores a 100 para el logro', async () => {
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 99 });
  await request(app).post('/api/games/sudoku/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 99 });
  await request(app).post('/api/games/memorama/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 99 });

  const response = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.deepEqual(response.body, []);
});

test('un logro ya desbloqueado no se duplica ni rompe al seguir jugando', async () => {
  await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });
  await request(app).post('/api/games/sudoku/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });
  await request(app).post('/api/games/memorama/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 100 });

  // Sigue jugando después de desbloquearlo — no debe tirar error ni duplicar.
  const extra = await request(app).post('/api/games/trivia/scores').set('Authorization', `Bearer ${anaToken}`).send({ score: 200 });
  assert.equal(extra.status, 200);

  const response = await request(app).get('/api/me/achievements').set('Authorization', `Bearer ${anaToken}`);
  assert.equal(response.body.length, 1);

  const rows = await prisma.userAchievement.count({ where: { achievement: 'three_games_100' } });
  assert.equal(rows, 1);
});
