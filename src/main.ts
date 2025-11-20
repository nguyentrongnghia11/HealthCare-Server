import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Lightweight auth header logger to help debug route-specific 401s
  app.use((req, _res, next) => {
    try {
      // Log only a short prefix of the token to avoid sensitive full-token logs
      const auth = req.headers?.authorization;
      if (auth) {
        console.log('Incoming Authorization header (prefix):', auth.slice(0, 30));
      } else {
        console.log('Incoming request without Authorization header:', req.method, req.url);
      }
    } catch (err) {
      // ignore logging errors
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
      return new BadRequestException(errors);
    },
    }),
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap();