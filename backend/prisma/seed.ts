import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';

export const GAME_FIXTURES = [
  { id: 'trivia', title: 'Trivia', description: 'Preguntas y respuestas' },
  { id: 'memorama', title: 'Memorama', description: 'Encuentra las parejas' },
  { id: 'sudoku', title: 'Sudoku', description: 'Completa la cuadrícula' },
  { id: 'game4', title: 'Juego 4', description: 'Cuarto juego demostrativo' },
  { id: 'robotrun', title: 'Robot Run', description: 'Salta y esquiva obstáculos' },
];

export async function seedGames(prisma: PrismaClient): Promise<void> {
  for (const game of GAME_FIXTURES) {
    await prisma.game.upsert({
      where: { id: game.id },
      create: game,
      update: game,
    });
  }
}

const isMainModule = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const prisma = new PrismaClient();
  seedGames(prisma)
    .then(() => console.log(`Seed listo: ${GAME_FIXTURES.length} juegos.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
