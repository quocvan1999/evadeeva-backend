import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResponseType } from 'src/types/response.type';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CustomJwtService } from 'src/jwt/jwt.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  prisma = new PrismaClient();

  constructor(
    private readonly configService: ConfigService,
    private readonly customJwtService: CustomJwtService,
  ) {}

  async login(
    body: LoginAuthDto,
    res: Response,
  ): Promise<ResponseType<{ token: string }>> {
    try {
      const { email, password } = body;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Người dùng không tồn tại.',
          type: 'err',
        };
      }

      const checkPass = await bcrypt.compareSync(password, checkUser.password);

      if (!checkPass) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Mật khẩu không chính xác.',
          type: 'err',
        };
      }

      const checkRole = await this.prisma.roles.findUnique({
        where: {
          id: checkUser.role_id,
        },
      });

      if (!checkRole) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Role không chính xác.',
          type: 'err',
        };
      }

      const payload = {
        id: checkUser.id,
        role: checkRole.name,
      };

      const accessToken = this.customJwtService.generateToken(
        payload,
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      );

      const refreshToken = this.customJwtService.generateToken(
        payload,
        this.configService.get<string>('JWT_REFRES_TOKEN_EXPIRES_IN'),
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Đăng nhập thành công.',
        type: 'res',
        data: { token: accessToken },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
