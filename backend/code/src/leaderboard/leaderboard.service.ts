import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaderBoardService {
  constructor(private prisma: PrismaService) {}

  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly TTL_MS = 30_000;

  async getLeaderBoard(offset: number, limit: number) {
    const cacheKey = `${offset}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const leaderboard = await this.prisma.match.groupBy({
      skip: offset,
      take: limit,
      by: ['winner_id'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const winnerIds = leaderboard
      .map((entry) => entry.winner_id)
      .filter((id): id is string => id !== null);
    const users = await this.prisma.user.findMany({
      where: { userId: { in: winnerIds } },
      select: {
        Username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        userId: true,
      },
    });
    const usersById = new Map(users.map((user) => [user.userId, user]));

    const data = leaderboard.map((entry) => ({
      ...usersById.get(entry.winner_id),
      wins: entry._count.id,
    }));

    this.cache.set(cacheKey, { data, expiresAt: Date.now() + this.TTL_MS });
    return data;
  }
}
