import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly expectedStatementTimeoutMs: number;
  private readonly expectedIdleInTxTimeoutMs: number;

  constructor(config: ConfigService) {
    const statementTimeoutMs = config.get<number>('database.statementTimeoutMs', 15_000);
    const idleInTxTimeoutMs = config.get<number>('database.idleInTransactionTimeoutMs', 30_000);
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('database.url'),
        max: config.get<number>('database.poolMax', 10),
        // Kết nối rảnh quá 30s thì trả lại cho Postgres
        idleTimeoutMillis: 30_000,
        // Pool cạn kết nối -> báo lỗi sau 5s thay vì treo request
        connectionTimeoutMillis: 5_000,
        statement_timeout: statementTimeoutMs,
        idle_in_transaction_session_timeout: idleInTxTimeoutMs,
      }),
    });
    this.expectedStatementTimeoutMs = statementTimeoutMs;
    this.expectedIdleInTxTimeoutMs = idleInTxTimeoutMs;
  }

  async onModuleInit() {
    await this.$connect();
    await this.verifySessionTimeouts();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Đọc lại timeout trên chính một kết nối của pool (không phải phiên psql) để chắc cấu hình có hiệu lực.
   * Sai lệch chỉ cảnh báo, không chặn khởi động.
   */
  private async verifySessionTimeouts() {
    try {
      const [row] = await this.$queryRaw<{ statement_timeout: string; idle_in_tx: string }[]>`
        SELECT current_setting('statement_timeout') AS statement_timeout,
               current_setting('idle_in_transaction_session_timeout') AS idle_in_tx`;
      const ok =
        toMs(row.statement_timeout) === this.expectedStatementTimeoutMs &&
        toMs(row.idle_in_tx) === this.expectedIdleInTxTimeoutMs;
      const msg = `Postgres session: statement_timeout=${row.statement_timeout}, idle_in_transaction_session_timeout=${row.idle_in_tx}`;
      if (ok) this.logger.log(msg);
      else this.logger.warn(`${msg} — KHÔNG khớp cấu hình (${this.expectedStatementTimeoutMs}ms / ${this.expectedIdleInTxTimeoutMs}ms)`);
    } catch (err) {
      this.logger.warn(`Không kiểm tra được timeout của Postgres: ${(err as Error).message}`);
    }
  }
}

/** "15s" / "30000ms" / "1min" / "0" (current_setting trả kèm đơn vị) -> mili giây */
function toMs(value: string): number {
  const m = /^(\d+)\s*(ms|s|min|h)?$/.exec(value.trim());
  if (!m) return NaN;
  const n = Number(m[1]);
  return n * ({ ms: 1, s: 1000, min: 60_000, h: 3_600_000 }[m[2] ?? 'ms'] ?? 1);
}
