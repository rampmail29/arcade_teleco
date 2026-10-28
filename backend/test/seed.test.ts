import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prisma } from '../src/lib/prisma.js';
import { seedGames, GAME_FIXTURES } from '../prisma/seed.js';

before(async () => {
  await seedGames(prisma);
});

after(async () => {
  await prisma.$disconnect();
});

test('seedGames inserta los 5 juegos esperados', async () => {
  const games = await prisma.game.findMany({ orderBy: { id: 'asc' } });
  assert.equal(games.length, GAME_FIXTURES.length);
  assert.deepEqual(
    games.map((g) => g.id).sort(),
    GAME_FIXTURES.map((g) => g.id).sort(),
  );
});

test('ejecutar prisma/seed.ts directamente (CLI) corre el seed y lo reporta por stdout', () => {
  const stdout = execSync('npx tsx prisma/seed.ts', {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: process.env,
    encoding: 'utf8',
  });
  assert.match(stdout, /Seed listo: 5 juegos\./);
});
