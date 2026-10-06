import { HttpException, type Logger } from '@nestjs/common';
import type { Response } from 'express';

type ErrorEvent = { type: 'error'; status: number; message: string };

/**
 * Trả luồng NDJSON (mỗi dòng một sự kiện JSON) cho tác vụ AI dài, để CMS hiện tiến trình thật.
 * - Lỗi trước sự kiện đầu tiên (400, 404, 503...) -> trả đúng mã HTTP + JSON như endpoint thường.
 * - Lỗi sau khi đã gửi sự kiện -> gửi sự kiện { type: 'error' } rồi đóng.
 * - Client đóng kết nối -> signal bị huỷ; lỗi do huỷ (isAbort) thì chỉ đóng luồng.
 */
export async function streamNdjson<E>(
  res: Response,
  run: (send: (event: E | ErrorEvent) => void, signal: AbortSignal) => Promise<void>,
  options: { logger: Logger; label: string; fallbackMessage: string; isAbort?: (err: unknown) => boolean },
): Promise<void> {
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });
  let started = false;
  const send = (event: E | ErrorEvent) => {
    if (res.writableEnded || abort.signal.aborted) return;
    if (!started) {
      started = true;
      res.status(200);
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no'); // nginx không gom buffer -> tiến trình tới ngay
      res.flushHeaders();
    }
    res.write(`${JSON.stringify(event)}\n`);
  };

  try {
    await run(send, abort.signal);
  } catch (err) {
    if (abort.signal.aborted || options.isAbort?.(err)) return void res.end();
    const status = err instanceof HttpException ? err.getStatus() : 500;
    const body = err instanceof HttpException ? err.getResponse() : null;
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : err instanceof Error && status !== 500
          ? err.message
          : options.fallbackMessage;
    if (status === 500) options.logger.error(`${options.label} lỗi: ${(err as Error).message}`);
    if (!started) return void res.status(status).json({ statusCode: status, message });
    send({ type: 'error', status, message });
  }
  res.end();
}
