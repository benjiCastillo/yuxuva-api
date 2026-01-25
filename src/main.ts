import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppValidationPipe } from './common/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new AppValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
