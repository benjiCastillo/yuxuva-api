import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: 'USER_DISABLED',
        message: 'User is not active',
      });
    }

    // if (!user.emailVerified) {
    //   throw new UnauthorizedException({
    //     error: 'EMAIL_NOT_VERIFIED',
    //     message: 'Email is not verified',
    //   });
    // }

    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
      roles: user.roles.map((r) => r.role.code),
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.createRefreshSession(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles: payload.roles,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    const [tokenId, secret] = refreshToken.split('.');
    if (!tokenId || !secret) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }

    const session = await this.prisma.refreshSession.findFirst({
      where: {
        tokenId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }

    const match = await bcrypt.compare(secret, session.refreshTokenHash);

    if (!match) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }

    const user = session.user;

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: 'USER_DISABLED',
        message: 'User is not active',
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
      roles: user.roles.map((r) => r.role.code),
    };

    const accessToken = this.jwtService.sign(payload);

    await this.revokeSession(session.id);

    const newRefreshToken = await this.createRefreshSession(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const [tokenId, secret] = refreshToken.split('.');
    if (!tokenId || !secret) {
      return { success: true };
    }

    const session = await this.prisma.refreshSession.findFirst({
      where: {
        tokenId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return { success: true };
    }

    const match = await bcrypt.compare(secret, session.refreshTokenHash);

    if (!match) {
      return { success: true };
    }

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  private async createRefreshSession(userId: string) {
    const tokenId = randomUUID();
    const secret = randomUUID();

    const rawToken = `${tokenId}.${secret}`;
    const hash = await bcrypt.hash(secret, 10);

    const refreshExpiresIn = this.config.getOrThrow<number>(
      'jwt.refreshExpiresIn',
    ); // 7 days

    await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenId,
        refreshTokenHash: hash,
        expiresAt: dayjs().add(refreshExpiresIn, 'second').toDate(),
      },
    });

    return rawToken;
  }

  private async revokeSession(sessionId: string) {
    await this.prisma.refreshSession.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
