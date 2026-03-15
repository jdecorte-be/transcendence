import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { JwtUtils } from '../utils/jwt_utils/jwt_utils';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as crypto from 'crypto';
import { Response } from 'express';

const cookieDomain = process.env.COOKIE_DOMAIN;
const isSecureCookie =
  (process.env.COOKIE_SECURE || '').toLowerCase() === 'true' ||
  (process.env.FRONT_URL || '').startsWith('https://');
const baseCookieOptions = {
  httpOnly: true,
  sameSite: isSecureCookie ? 'none' : 'lax',
  secure: isSecureCookie,
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private jwtUtils: JwtUtils,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      passReqToCallback: true,
      scope: ['read:user'],
    });
  }

  async validate(
    req: any,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    cb: (err: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const res: Response = req.res;
    const githubIntraId = `github:${profile.id}`;
    const email = profile.emails?.[0]?.value || null;

    let user = await this.usersService.getUserByIntraId(githubIntraId);
    if (!user && email) {
      user = await this.usersService.getUserByEmail(email);
    }

    if (user) {
      if (user.tfaEnabled) {
        const tfaToken = crypto.randomBytes(20).toString('hex');
        await this.usersService.updateUser(user.userId, { tfaToken });
        res.redirect(process.env.FRONT_URL + '/2fa/validate/' + tfaToken);
        return cb(null, profile);
      }

      const tokenSubject = user.email || user.Username || user.userId;
      const tokens = await this.jwtUtils.generateTokens(
        tokenSubject,
        user.userId,
      );
      await this.jwtUtils.updateRefreshedHash(
        user.userId,
        tokens.refresh_token,
      );

      res.cookie('X-Access-Token', tokens.access_token, baseCookieOptions);
      res.cookie('X-Refresh-Token', tokens.refresh_token, {
        ...baseCookieOptions,
        path: '/auth',
      });
      res.redirect(
        process.env.FRONT_URL ? process.env.FRONT_URL + '/Home' : '/',
      );
      return cb(null, profile);
    }

    const displayName = profile.displayName || profile.username || 'GitHub User';
    const nameParts = displayName.trim().split(' ');
    const firstName = nameParts[0] || 'GitHub';
    const lastName = nameParts.slice(1).join(' ');
    const username = profile.username || `github_${profile.id}`;

    const new_user = await this.usersService.createUser({
      intraId: githubIntraId,
      email: email || undefined,
      firstName,
      lastName,
      Username: username,
    });

    const avatarUrl =
      profile.photos?.[0]?.value ||
      `https://ui-avatars.com/api/?name=${firstName}-${lastName}&background=7940CF&color=fff`;
    const result = await this.cloudinaryService.upload(
      new_user.userId,
      avatarUrl,
    );

    await this.usersService.updateUser(new_user.userId, {
      avatar: `v${result.version}/${result.public_id}.${result.format}`,
    });

    const newTokenSubject =
      new_user.email || new_user.Username || new_user.userId;
    const tokens = await this.jwtUtils.generateTokens(
      newTokenSubject,
      new_user.userId,
    );

    await this.jwtUtils.updateRefreshedHash(
      new_user.userId,
      tokens.refresh_token,
    );

    res.cookie('X-Access-Token', tokens.access_token, baseCookieOptions);
    res.cookie('X-Refresh-Token', tokens.refresh_token, {
      ...baseCookieOptions,
      path: '/auth',
    });
    res.redirect(process.env.FRONT_URL ? process.env.FRONT_URL + '/Home' : '/');
    return cb(null, profile);
  }
}
