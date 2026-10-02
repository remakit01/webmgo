import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);

  constructor(private readonly config: ConfigService) {}

  /** Báo FE xoá cache ISR theo tag. Lỗi chỉ log, không làm hỏng request của CMS. */
  async trigger(...tags: string[]) {
    const feUrl = this.config.get<string>('feUrl');
    const secret = this.config.get<string>('revalidateSecret');
    if (!secret) {
      this.logger.warn('REVALIDATE_SECRET_TOKEN chưa cấu hình — bỏ qua revalidate');
      return;
    }
    try {
      const res = await fetch(`${feUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) this.logger.warn(`Revalidate ${tags.join(',')} -> HTTP ${res.status}`);
    } catch (err) {
      this.logger.warn(`Revalidate thất bại: ${(err as Error).message}`);
    }
  }
}
