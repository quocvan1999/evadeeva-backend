import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['token'] as string;

    if (!token) {
      throw new UnauthorizedException(
        'Vui lòng đăng nhập để truy cập tài nguyên này',
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request['user'] = decoded;
      return true;
    } catch (err) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }
  }
}
