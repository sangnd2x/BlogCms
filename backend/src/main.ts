import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set global API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((origin) =>
      origin.trim(),
    ) || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3100'],
    credentials: true,
  });

  console.log('API Prefix:', process.env.API_PREFIX || 'api/v1');
  console.log('CORS Origins:', process.env.CORS_ORIGINS);

  // Serve uploaded files statically
  const publicPath = join(__dirname, '..', 'public');

  app.use(
    '/public',
    express.static(publicPath, {
      setHeaders: (res, path) => {
        // Set proper content type based on file extension
        if (path.endsWith('.mp4')) {
          res.setHeader('Content-Type', 'video/mp4');
        } else if (path.endsWith('.webm')) {
          res.setHeader('Content-Type', 'video/webm');
        } else if (path.endsWith('.ogg')) {
          res.setHeader('Content-Type', 'video/ogg');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }

        // Enable range requests for video seeking
        res.setHeader('Accept-Ranges', 'bytes');

        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Throw error if non-whitelisted properties exist
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
