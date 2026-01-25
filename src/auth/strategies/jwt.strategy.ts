import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email?: string | null;
  tokenVersion: number;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId, tokenVersion } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        error: 'INVALID_TOKEN',
        message: 'User not found',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: 'USER_DISABLED',
        message: 'User is not active',
      });
    }

    // 🔥 Revocación global
    if (user.tokenVersion !== tokenVersion) {
      throw new UnauthorizedException({
        error: 'TOKEN_REVOKED',
        message: 'Token has been revoked',
      });
    }

    // 👇 Esto se inyecta en request.user
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.code),
    };
  }
}
