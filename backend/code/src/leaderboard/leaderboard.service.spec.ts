import { LeaderBoardService } from './leaderboard.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('LeaderBoardService', () => {
  let service: LeaderBoardService;
  let prisma: {
    match: { groupBy: jest.Mock };
    user: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      match: { groupBy: jest.fn() },
      user: { findMany: jest.fn() },
    };
    service = new LeaderBoardService(prisma as unknown as PrismaService);
  });

  it('merges match win counts with user profiles', async () => {
    prisma.match.groupBy.mockResolvedValue([
      { winner_id: 'u1', _count: { id: 5 } },
      { winner_id: 'u2', _count: { id: 3 } },
    ]);
    prisma.user.findMany.mockResolvedValue([
      { userId: 'u1', Username: 'alice', firstName: 'A', lastName: 'L', avatar: null },
      { userId: 'u2', Username: 'bob', firstName: 'B', lastName: 'O', avatar: null },
    ]);

    const result = await service.getLeaderBoard(0, 10);

    expect(result).toEqual([
      { userId: 'u1', Username: 'alice', firstName: 'A', lastName: 'L', avatar: null, wins: 5 },
      { userId: 'u2', Username: 'bob', firstName: 'B', lastName: 'O', avatar: null, wins: 3 },
    ]);
    expect(prisma.match.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10, by: ['winner_id'] }),
    );
  });

  it('filters out null winner ids before querying users', async () => {
    prisma.match.groupBy.mockResolvedValue([
      { winner_id: null, _count: { id: 1 } },
      { winner_id: 'u1', _count: { id: 2 } },
    ]);
    prisma.user.findMany.mockResolvedValue([]);

    await service.getLeaderBoard(0, 10);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: { in: ['u1'] } } }),
    );
  });

  it('serves cached results on repeated calls with the same offset/limit', async () => {
    prisma.match.groupBy.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    await service.getLeaderBoard(0, 10);
    await service.getLeaderBoard(0, 10);

    expect(prisma.match.groupBy).toHaveBeenCalledTimes(1);
  });

  it('queries again for a different offset/limit', async () => {
    prisma.match.groupBy.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    await service.getLeaderBoard(0, 10);
    await service.getLeaderBoard(10, 10);

    expect(prisma.match.groupBy).toHaveBeenCalledTimes(2);
  });
});
