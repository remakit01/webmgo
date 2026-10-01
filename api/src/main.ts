import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Cookie parser — phải đứng trước guards
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown fields
      forbidNonWhitelisted: true, // throw on unknown fields
      transform: true,           // auto-transform to DTO types
    }),
  );

  // CORS — cho phép fe và cms gửi cookie
  app.enableCors({
    origin: [
      config.get<string>('feUrl', 'http://localhost:3000'),
      config.get<string>('cmsUrl', 'http://localhost:3001'),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Swagger — chỉ bật ở dev
  if (config.get('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Remak API')
      .setDescription('Backend API cho website MGO Remak')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger: http://localhost:4000/docs');
  }

  const port = config.get<number>('port', 4000);
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}`);
}

await bootstrap();
