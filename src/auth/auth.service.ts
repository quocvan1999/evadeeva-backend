import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResponseType } from 'src/types/response.type';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CustomJwtService } from 'src/jwt/jwt.service';
import { Response } from 'express';
import { ForgotSendMailAuthDto } from './dto/forgot-send-mail.dto';
import { generateCode, getFutureTime, isDateValid } from 'src/utils/utils';
import { EmailService } from 'src/email/email.service';
import { CheckAccountAuthDto } from './dto/check-account.dot';
import { CheckOtpAuthDto } from './dto/checkOtp.dto';
import { ForgotPasswordAuthDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  prisma = new PrismaClient();

  constructor(
    private readonly configService: ConfigService,
    private readonly customJwtService: CustomJwtService,
    private readonly emailService: EmailService,
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

  async refreshToken(token: string): Promise<ResponseType<{ token: string }>> {
    try {
      if (!token) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Không tìm thấy token.',
          type: 'err',
        };
      }

      const checkToken = this.customJwtService.verifyToken(token);

      if (!checkToken) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Token không hợp lệ.',
          type: 'err',
        };
      }

      const { id } = checkToken;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          id,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Người dùng không tồn tại.',
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

      const newAccessToken = this.customJwtService.generateToken(
        payload,
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Tạo mới accessToken thành công.',
        type: 'res',
        data: { token: newAccessToken },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async forgotSendMail(
    body: ForgotSendMailAuthDto,
  ): Promise<ResponseType<{ code: number }>> {
    try {
      const { email } = body;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Người dùng không tồn tại.',
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
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Role không chính xác.',
          type: 'err',
        };
      }

      const code: number = generateCode();

      const saveCode = await this.prisma.passwordResetCodes.upsert({
        where: {
          user_id: checkUser.id,
        },
        create: {
          user_id: checkUser.id,
          code: bcrypt.hashSync(code.toString(), 10),
          expiration: getFutureTime(1),
        },
        update: {
          code: bcrypt.hashSync(code.toString(), 10),
          expiration: getFutureTime(1),
        },
      });

      if (!saveCode) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Thêm mã xác thực không thành công.',
          type: 'err',
        };
      }

      this.emailService.sendMail(
        checkUser.email,
        'Mã xác thực',
        code.toString(),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy mã xác thực thành công, kiểm tra email để nhận mã.',
        type: 'res',
        data: { code: code },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async checkAcc(body: CheckAccountAuthDto): Promise<ResponseType<null>> {
    try {
      const { email } = body;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Người dùng không tồn tại.',
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
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Role không chính xác.',
          type: 'err',
        };
      }

      if (checkRole.name !== 'Admin') {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Tài khoản không có quyền truy cập.',
          type: 'err',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Tài khoản có quyền truy cập.',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async checkOtp(body: CheckOtpAuthDto): Promise<ResponseType<null>> {
    try {
      const { email, otp } = body;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Người dùng không tồn tại.',
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
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Role không chính xác.',
          type: 'err',
        };
      }

      const checkCode = await this.prisma.passwordResetCodes.findUnique({
        where: {
          user_id: checkUser.id,
        },
      });

      if (!checkCode) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'OTP không tồn tại.',
          type: 'err',
        };
      }

      const checkExpirationCode = isDateValid(checkCode.expiration);

      if (!checkExpirationCode) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'OTP đã hết hạn.',
          type: 'err',
        };
      }

      const checkOtp = await bcrypt.compareSync(otp, checkCode.code);

      if (!checkOtp) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'OTP không chính xác.',
          type: 'err',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Xác thực OTP thành công',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fotgotPassword(
    body: ForgotPasswordAuthDto,
  ): Promise<ResponseType<null>> {
    try {
      const { email, password } = body;

      const checkUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!checkUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Người dùng không tồn tại.',
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
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Role không chính xác.',
          type: 'err',
        };
      }

      const newPassword = await bcrypt.hashSync(password, 10);

      const update = await this.prisma.users.update({
        where: {
          id: checkUser.id,
        },
        data: {
          password: newPassword,
        },
      });

      if (!update) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật mật khẩu không thành công.',
          type: 'err',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật mật khẩu thành công.',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
