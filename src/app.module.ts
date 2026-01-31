import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChampionshipsModule } from './championships/championships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttle = configService.get<{ ttl: number; limit: number }>(
          'throttle',
        );
        return {
          throttlers: [
            {
              ttl: throttle?.ttl ?? 60000,
              limit: throttle?.limit ?? 20,
            },
          ],
        };
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ChampionshipsModule,
  ],
})
export class AppModule {}
