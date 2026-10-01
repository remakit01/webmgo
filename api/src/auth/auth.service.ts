import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtPayload } from './strategies/jwt.strategy.js';

const REFRESH_PREFIX = 'refresh:';
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 ngày

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async login(credential: string | undefined, password: string, res: Response) {
    if (!credential) throw new UnauthorizedException('Vui lòng nhập tên đăng nhập hoặc email');
    const user = await this.validateUser(credential, password);
    if (!user) throw new UnauthorizedException('Sai tên đăng nhập, email hoặc mật khẩu');

    const tokens = await this.generateTokens({ 
      sub: user.id, 
      email: user.email, 
      username: user.username || undefined,
      role: user.role 
    });
    this.applyTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return { 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      accessToken: tokens.accessToken 
    };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) throw new UnauthorizedException('Không có refresh token');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const stored = await this.redisService.get(`${REFRESH_PREFIX}${payload.sub}`);
    if (!stored) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');

    const valid = await bcrypt.compare(refreshToken, stored);
    if (!valid) throw new UnauthorizedException('Refresh token không hợp lệ');

    const newAccessToken = this.signAccess({ sub: payload.sub, email: payload.email, role: payload.role });
    this.setCookie(res, ACCESS_COOKIE, newAccessToken, 15 * 60);

    return { ok: true };
  }

  async logout(userId: string, res: Response) {
    await this.redisService.del(`${REFRESH_PREFIX}${userId}`);
    res.clearCookie(ACCESS_COOKIE);
    res.clearCookie(REFRESH_COOKIE);
    return { ok: true };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async generateTokens(payload: JwtPayload) {
    const accessToken = this.signAccess(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn', '30d'),
    });

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.redisService.set(`${REFRESH_PREFIX}${payload.sub}`, hash, 'EX', REFRESH_TTL_SECONDS);

    return { accessToken, refreshToken };
  }

  private signAccess(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpiresIn', '15m'),
    });
  }

  private applyTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    this.setCookie(res, ACCESS_COOKIE, accessToken, 15 * 60);
    this.setCookie(res, REFRESH_COOKIE, refreshToken, REFRESH_TTL_SECONDS);
  }

  private setCookie(res: Response, name: string, value: string, maxAgeSeconds: number) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: this.configService.get('nodeEnv') === 'production',
      sameSite: 'strict',
      maxAge: maxAgeSeconds * 1000,
    });
  }

  private async validateUser(credential: string, password: string) {
    const trimmed = credential.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { username: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
    });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }
}
