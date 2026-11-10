import { prisma } from '../lib/prisma.js';
import { ACHIEVEMENTS } from '../achievements/definitions.js';

/** Revisa los logros que el usuario todavía no tiene y desbloquea los que ya cumple. */
export async function unlockNewAchievements(userId: string): Promise<void> {
  const already = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievement: true },
  });
  const alreadyIds = new Set(already.map((row) => row.achievement));

  for (const definition of ACHIEVEMENTS) {
    if (alreadyIds.has(definition.id)) continue;
    if (await definition.isUnlockedFor(userId)) {
      await prisma.userAchievement.create({ data: { userId, achievement: definition.id } });
    }
  }
}

export interface AchievementSummaryDTO {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

/** Logros ya desbloqueados por el dueño de ese email. [] si nunca jugó (no existe el User). */
export async function getAchievementsForEmail(email: string): Promise<AchievementSummaryDTO[]> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return [];

  const rows = await prisma.userAchievement.findMany({
    where: { userId: user.id },
    orderBy: { unlockedAt: 'asc' },
  });
  const definitionById = new Map(ACHIEVEMENTS.map((definition) => [definition.id, definition]));

  return rows.map((row) => {
    const definition = definitionById.get(row.achievement);
    return {
      id: row.achievement,
      title: definition?.title ?? row.achievement,
      description: definition?.description ?? '',
      unlockedAt: row.unlockedAt.toISOString(),
    };
  });
}
