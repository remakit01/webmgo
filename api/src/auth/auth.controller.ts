import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập — hỗ trợ username hoặc email' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const credential = dto.identifier || dto.username || dto.email;
    return this.authService.login(credential, dto.password, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Cấp lại access token từ refresh_token cookie' })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req.cookies?.refresh_token, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Đăng xuất — xóa cookies và revoke refresh token trong Redis' })
  logout(@CurrentUser() user: { id: string }, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user.id, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thông tin user hiện tại từ JWT payload' })
  me(@CurrentUser() user: unknown) {
    return user;
  }
}
