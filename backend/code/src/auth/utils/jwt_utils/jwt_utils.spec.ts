import { JwtUtils } from './jwt_utils';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

describe('JwtUtils', () => {
  let jwtUtils: JwtUtils;
  let jwtService: { signAsync: jest.Mock };
  let usersService: { updateUser: jest.Mock };

  beforeEach(() => {
    jwtService = { signAsync: jest.fn() };
    usersService = { updateUser: jest.fn() };
    jwtUtils = new JwtUtils(
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService,
    );
  });

  it('generates an access and refresh token with distinct secrets/expiry', async () => {
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const tokens = await jwtUtils.generateTokens('alice', 'user-1');

    expect(tokens).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { username: 'alice', sub: 'user-1' },
      expect.objectContaining({ expiresIn: '2h' }),
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { username: 'alice', sub: 'user-1' },
      expect.objectContaining({ expiresIn: '7d' }),
    );
  });

  it('hashes and stores the refreshed token via updateUser', async () => {
    await jwtUtils.updateRefreshedHash('user-1', 'some-refresh-token');

    expect(usersService.updateUser).toHaveBeenCalledTimes(1);
    const [userId, data] = usersService.updateUser.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(data.refreshedHash).toEqual(expect.any(String));
    expect(data.refreshedHash).not.toBe('some-refresh-token');
  });
});
