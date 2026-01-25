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
import { Prisma } from '../../generated/prisma/client';

type RefreshSessionWithUser = Prisma.RefreshSessionGetPayload<{
  include: {
    user: {
      include: {
        roles: {
          include: { role: true };
        };
      };
    };
  };
}>;

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

    // ❌ Usuario no existe o no es local
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }

    // ❌ Password incorrecto
    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }

    // ❌ Usuario inactivo
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: 'USER_DISABLED',
        message: 'User is not active',
      });
    }

    // ❌ Email no verificado (si decides exigirlo)
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

    // 🔁 Refresh token (persistido)
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
    // 1️⃣ Buscar sesiones activas
    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
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

    // 2️⃣ Comparar hash (NO existe búsqueda directa)
    const session = await this.findMatchingSession(dto.refreshToken, sessions);

    if (!session) {
      throw new UnauthorizedException({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired',
      });
    }

    const user = session.user;

    // 3️⃣ Validaciones de seguridad
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: 'USER_DISABLED',
        message: 'User is not active',
      });
    }

    // 4️⃣ Payload JWT
    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
      roles: user.roles.map((r) => r.role.code),
    };

    // 5️⃣ Nuevo access token
    const accessToken = this.jwtService.sign(payload);

    // 6️⃣ (Opcional) rotar refresh token
    await this.revokeSession(session.id);

    const newRefreshToken = await this.createRefreshSession(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async createRefreshSession(userId: string) {
    const rawToken = randomUUID();
    const hash = await bcrypt.hash(rawToken, 10);
    const refreshExpiresIn = this.config.getOrThrow<number>(
      'jwt.refreshExpiresIn',
    ); // 7 days

    await this.prisma.refreshSession.create({
      data: {
        userId,
        refreshTokenHash: hash,
        expiresAt: dayjs().add(refreshExpiresIn, 'second').toDate(),
      },
    });

    return rawToken;
  }

  private async findMatchingSession(
    token: string,
    sessions: RefreshSessionWithUser[],
  ): Promise<RefreshSessionWithUser | null> {
    for (const session of sessions) {
      const match = await bcrypt.compare(token, session.refreshTokenHash);

      if (match) {
        return session;
      }
    }
    return null;
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
