import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtUtils } from './utils/jwt_utils/jwt_utils';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtUtils: { generateTokens: jest.Mock; updateRefreshedHash: jest.Mock };
  let usersService: { getUserByEmail: jest.Mock; getUserById: jest.Mock };
  let prisma: { user: { findMany: jest.Mock } };

  beforeEach(() => {
    jwtUtils = {
      generateTokens: jest.fn().mockResolvedValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
      updateRefreshedHash: jest.fn().mockResolvedValue(undefined),
    };
    usersService = { getUserByEmail: jest.fn(), getUserById: jest.fn() };
    prisma = { user: { findMany: jest.fn() } };

    authService = new AuthService(
      jwtUtils as unknown as JwtUtils,
      usersService as unknown as UsersService,
      prisma as unknown as PrismaService,
    );

    jest.clearAllMocks();
    jwtUtils.generateTokens.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    jwtUtils.updateRefreshedHash.mockResolvedValue(undefined);
  });

  describe('login', () => {
    it('throws when no user matches the email', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'pw' }),
      ).rejects.toThrow(HttpException);
    });

    it('throws when the password does not match', async () => {
      usersService.getUserByEmail.mockResolvedValue({
        userId: 'user-1',
        email: 'alice@example.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'alice@example.com', password: 'wrong' }),
      ).rejects.toThrow(HttpException);
    });

    it('returns tokens and refreshes the stored hash on success', async () => {
      usersService.getUserByEmail.mockResolvedValue({
        userId: 'user-1',
        email: 'alice@example.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const tokens = await authService.login({
        email: 'alice@example.com',
        password: 'correct',
      });

      expect(tokens).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
      expect(jwtUtils.generateTokens).toHaveBeenCalledWith(
        'alice@example.com',
        'user-1',
      );
      expect(jwtUtils.updateRefreshedHash).toHaveBeenCalledWith(
        'user-1',
        'refresh-token',
      );
    });
  });

  describe('loginAsRandomUser', () => {
    it('throws when there are no eligible users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await expect(authService.loginAsRandomUser()).rejects.toThrow(
        HttpException,
      );
    });

    it('issues tokens for one of the eligible users', async () => {
      prisma.user.findMany.mockResolvedValue([
        { userId: 'user-1', email: 'a@example.com' },
      ]);

      const tokens = await authService.loginAsRandomUser();

      expect(tokens).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
      expect(jwtUtils.generateTokens).toHaveBeenCalledWith(
        'a@example.com',
        'user-1',
      );
    });
  });
});
