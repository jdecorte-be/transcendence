import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Redirect,
  Res,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { FtOauthGuard } from './guards/ft.guard';
import { GithubOauthGuard } from './guards/github.guard';
import { GetCurrentUser } from './decorator/get_current_user.decorator';
import { Tokens } from './types';
import { Response, CookieOptions, Request } from 'express';
import { RtGuard } from './guards/rt.guard';
import { ApiCookieAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { TfaValidateDto } from './dto/tfa-validta.dto';

const cookieDomain = process.env.COOKIE_DOMAIN;
const forcedSecureCookie =
  (process.env.COOKIE_SECURE || '').toLowerCase() === 'true';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getBaseCookieOptions(req: Request): CookieOptions {
    const isSecureCookie =
      forcedSecureCookie ||
      req.secure ||
      (req.headers['x-forwarded-proto'] || '')
        .toString()
        .split(',')[0]
        .trim()
        .toLowerCase() === 'https' ||
      (process.env.FRONT_URL || '').startsWith('https://');
    const sameSite: CookieOptions['sameSite'] = isSecureCookie ? 'none' : 'lax';

    return {
      httpOnly: true,
      sameSite,
      secure: isSecureCookie,
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  @Post('signup')
  async signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthDto,
  ) {
    const tokens: Tokens = await this.authService.login(dto);
    const baseCookieOptions = this.getBaseCookieOptions(req);
    res.cookie('X-Access-Token', tokens.access_token, baseCookieOptions);
    res.cookie('X-Refresh-Token', tokens.refresh_token, {
      ...baseCookieOptions,
      path: '/auth',
    });
  }

  @Get('login/42')
  @UseGuards(FtOauthGuard)
  ftAuth() {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('login/42/return')
  @UseGuards(FtOauthGuard)
  login42Return() {
    return;
  }

  @Get('login/github')
  @UseGuards(GithubOauthGuard)
  githubAuth() {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('login/github/return')
  @UseGuards(GithubOauthGuard)
  githubAuthReturn() {
    return;
  }

  @Get('logout')
  @ApiCookieAuth('X-Refresh-Token')
  @UseGuards(RtGuard)
  @Redirect(process.env.FRONT_URL ? process.env.FRONT_URL : '/')
  async logout(
    @GetCurrentUser('userId') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    const baseCookieOptions = this.getBaseCookieOptions(req);
    res.clearCookie('X-Access-Token', baseCookieOptions);
    res.clearCookie('X-Refresh-Token', {
      ...baseCookieOptions,
      path: '/auth',
    });
    return { message: 'ok' };
  }

  @Get('refresh')
  @ApiCookieAuth('X-Refresh-Token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('userId') userId: string,
  ) {
    const tokens: Tokens = await this.authService.refresh(refreshToken, userId);

    const baseCookieOptions = this.getBaseCookieOptions(req);
    res.cookie('X-Access-Token', tokens.access_token, baseCookieOptions);
    res.cookie('X-Refresh-Token', tokens.refresh_token, {
      ...baseCookieOptions,
      path: '/auth',
    });

    return { message: 'ok' };
  }

  @Post('validate2fa')
  async validate2fa(
    @Body() tfaValidation: TfaValidateDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.validateTwoFactorAuth(
      tfaValidation.otp,
      tfaValidation.tfaToken,
    );
    if (!data.isValid) {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid token' });
      return;
    }
    const tokens = data.tokens;
    const baseCookieOptions = this.getBaseCookieOptions(req);
    res.cookie('X-Access-Token', tokens.access_token, baseCookieOptions);
    res.cookie('X-Refresh-Token', tokens.refresh_token, {
      ...baseCookieOptions,
      path: '/auth',
    });
  }

  @Get('validatToken/:token')
  async validatToken(@Param('token') token: string) {
    return this.authService.checkToken(token);
  }
}
