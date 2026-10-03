import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('database.url'),
        max: config.get<number>('database.poolMax', 10),
        // Kết nối rảnh quá 30s thì trả lại cho Postgres
        idleTimeoutMillis: 30_000,
        // Pool cạn kết nối -> báo lỗi sau 5s thay vì treo request
        connectionTimeoutMillis: 5_000,
        statement_timeout: config.get<number>('database.statementTimeoutMs', 15_000),
        idle_in_transaction_session_timeout: config.get<number>('database.idleInTransactionTimeoutMs', 30_000),
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
