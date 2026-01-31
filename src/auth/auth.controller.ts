import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshCookieOptions() {
    const sameSite =
      this.config.get<'lax' | 'strict' | 'none'>('auth.cookieSameSite') ??
      'none';

    return {
      httpOnly: true,
      secure: this.config.get<boolean>('auth.cookieSecure') ?? true,
      sameSite,
      domain: this.config.get<string>('auth.cookieDomain') ?? undefined,
      path: this.config.get<string>('auth.refreshCookiePath') ?? '/auth/refresh',
      maxAge:
        (this.config.get<number>('jwt.refreshExpiresIn') ?? 0) * 1000 || 0,
    } as const;
  }

  private getRefreshCookieName() {
    return this.config.get<string>('auth.refreshCookieName') ?? 'refresh_token';
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie(
      this.getRefreshCookieName(),
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('refresh')
  @Public()
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[this.getRefreshCookieName()];
    if (!refreshToken) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }

    const result = await this.authService.refresh(refreshToken);
    res.cookie(
      this.getRefreshCookieName(),
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );

    return {
      accessToken: result.accessToken,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto?: LogoutDto,
  ) {
    const refreshToken =
      req.cookies?.[this.getRefreshCookieName()] ?? dto?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(this.getRefreshCookieName(), this.getRefreshCookieOptions());
    return { success: true };
  }
}
