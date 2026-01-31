import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppValidationPipe } from './common/validation.pipe';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get<string>('cors.origin'),
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new AppValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
