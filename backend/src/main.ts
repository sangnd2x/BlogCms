import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
