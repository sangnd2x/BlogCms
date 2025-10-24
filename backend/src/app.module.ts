import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CategoryModule } from './category/category.module';
import { MediaModule } from './media/media.module';
import { CommentModule } from './comment/comment.module';
import { HealthModule } from './health/health.module';
import { MinioModule } from './minio/minio.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UserModule,
    BlogModule,
    CategoryModule,
    MediaModule,
    CommentModule,
    HealthModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
