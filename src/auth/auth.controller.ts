import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Response } from 'express';
import { ResponseType } from 'src/types/response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginAuthDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const sigin: ResponseType<{ token: string }> =
        await this.authService.login(body, res);

      switch (sigin.type) {
        case 'res':
          return res.status(sigin.statusCode).json({
            statusCode: sigin.statusCode,
            content: {
              message: sigin.message,
              token: sigin.data.token,
            },
            timestamp: new Date().toISOString(),
          });
        case 'err':
          return res.status(sigin.statusCode).json({
            statusCode: sigin.statusCode,
            content: {
              error: sigin.message,
            },
            timestamp: new Date().toISOString(),
          });
        default:
          break;
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        content: {
          error: error?.message || 'Internal Server Error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
