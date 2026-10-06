export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  feUrl: process.env.FE_URL ?? 'http://localhost:3000',
  cmsUrl: process.env.CMS_URL ?? 'http://localhost:3001',
  database: {
    url: process.env.DATABASE_URL,
    // Pool kết nối mỗi instance API; tổng mọi instance phải < max_connections của Postgres (mặc định 100)
    poolMax: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    // Query treo quá lâu -> Postgres tự huỷ, không giữ kết nối/khoá mãi
    statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS ?? '15000', 10),
    // Transaction mở mà không làm gì (quên commit) -> Postgres tự cắt, nhả khoá
    idleInTransactionTimeoutMs: parseInt(process.env.DB_IDLE_IN_TX_TIMEOUT_MS ?? '30000', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    publicUrl: process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET ?? 'remak-mgo-assets',
  },
  revalidateSecret: process.env.REVALIDATE_SECRET_TOKEN,
  // Dịch tự động bằng Gemini (CMS). Thiếu key -> tính năng tắt, API trả 503.
  translation: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    // Ghim phiên bản cụ thể (không dùng alias *-latest) để chất lượng dịch ổn định, chủ động khi nâng cấp
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    // Model dự phòng khi model chính quá tải (503/429); để trống để tắt
    geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.1-flash-lite',
    timeoutMs: parseInt(process.env.TRANSLATE_TIMEOUT_MS ?? '30000', 10),
    // Embedding cho kho "Kiến thức AI" (tìm theo ngữ nghĩa); lỗi -> tự tìm theo từ khoá
    geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
  },
});
