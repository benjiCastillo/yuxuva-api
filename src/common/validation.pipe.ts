import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const fields: Record<string, string[]> = {};

        errors.forEach((error) => {
          if (error.constraints) {
            fields[error.property] = Object.values(error.constraints);
          }
        });

        return new BadRequestException({
          statusCode: 400,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fields,
        });
      },
    });
  }
}
