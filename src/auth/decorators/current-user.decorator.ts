import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser as CurrentUserType } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new UnauthorizedException({
        error: 'UNAUTHENTICATED',
        message: 'User is not authenticated',
      });
    }

    return request.user;
  },
);
