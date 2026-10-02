import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

/** Prefix được phép đọc công khai không cần đăng nhập. Thêm prefix khi có module mới phục vụ file public. */
const PUBLIC_PREFIXES = ['banners/'];

/** Prefix chứa file gốc (không công khai), dùng để tạo lại biến thể khi đổi cỡ/chất lượng. */
export const PRIVATE_PREFIX = 'private/';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('minio.bucket', 'remak-mgo-assets');
    this.publicBase = config.get<string>('minio.publicUrl', 'http://localhost:9000').replace(/\/$/, '');
    this.client = new S3Client({
      endpoint: config.get<string>('minio.endpoint'),
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get<string>('minio.accessKey', ''),
        secretAccessKey: config.get<string>('minio.secretKey', ''),
      },
    });
  }

  /**
   * Tạo bucket nếu chưa có. Chỉ các prefix trong PUBLIC_PREFIXES được đọc công khai
   * (ảnh phục vụ trực tiếp cho FE); mọi thứ khác — vd `private/` chứa file gốc — chỉ đọc bằng credentials.
   */
  async onModuleInit() {
    try {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Created bucket "${this.bucket}"`);
      }
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: PUBLIC_PREFIXES.map((p) => `arn:aws:s3:::${this.bucket}/${p}*`),
              },
            ],
          }),
        }),
      );
    } catch (err) {
      this.logger.error(`MinIO init failed: ${(err as Error).message}`);
    }
  }

  async putObject(key: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return this.publicUrl(key);
  }

  /** Xoá toàn bộ object dưới một prefix (vd: banners/<id>/). */
  async deletePrefix(prefix: string) {
    const listed = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix }),
    );
    const objects = (listed.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (!objects.length) return;
    await this.client.send(
      new DeleteObjectsCommand({ Bucket: this.bucket, Delete: { Objects: objects } }),
    );
  }

  publicUrl(key: string) {
    return `${this.publicBase}/${this.bucket}/${key}`;
  }
}
