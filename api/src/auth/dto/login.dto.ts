import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin hoặc admin@remak.vn', 
    description: 'Tên đăng nhập (username) hoặc địa chỉ Email',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập hoặc Email không hợp lệ' })
  identifier?: string;

  @ApiProperty({ example: 'admin@remak.vn', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'Admin@123456' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;
}
