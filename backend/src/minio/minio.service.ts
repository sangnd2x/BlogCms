import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;
  private env: string;

  constructor(private configService: ConfigService) {
    this.env = this.configService.get<string>('NODE_ENV') ?? 'development';
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET_NAME') ?? 'blogcms-uploads';

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') ?? 'minio',
      port: parseInt(this.configService.get<string>('MINIO_PORT') ?? '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    await this.createBucketIfNotExists();
  }

  private async createBucketIfNotExists() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');

        // Set bucket policy to allow public read access for uploaded files
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error('Error setting up MinIO bucket:', error);
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

      // Sanitize filename: lowercase, replace spaces with hyphens, remove special chars
      const sanitizedFileName = fileName
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9.-]/g, '') // Remove special characters except dots and hyphens
        .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with single hyphen

      const objectName = `${folder}/${timestamp}-${sanitizedFileName}`;

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file,
        file.length,
        {
          'Content-Type': mimeType,
        },
      );

      // Return the public URL
      return `${this.env === 'development' ? 'http' : 'https'}://${this.configService.get('MINIO_PUBLIC_URL')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new Error('File deletion failed');
    }
  }

  async getFileUrl(
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expirySeconds,
      );
    } catch (error) {
      this.logger.error('Error generating file URL:', error);
      throw new Error('Failed to generate file URL');
    }
  }
}
