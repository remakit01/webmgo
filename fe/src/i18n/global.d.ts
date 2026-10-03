import type { routing } from './routing';
import type messages from '../../messages/vi.json';

// Kiểm tra kiểu: locale hợp lệ và key dịch phải tồn tại trong messages/vi.json
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
