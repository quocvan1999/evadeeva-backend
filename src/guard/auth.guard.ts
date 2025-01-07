import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['token'] as string;

    if (!token) {
      throw new UnauthorizedException(
        'Vui lòng đăng nhập để truy cập tài nguyên này',
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        role: string;
        iat: number;
        exp: number;
      };

      const allowedRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );

      if (!allowedRoles) {
        request['user'] = decoded;
        return true;
      }

      if (allowedRoles.includes(decoded.role) === false) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập tài nguyên này',
        );
      }

      request['user'] = decoded;
      return true;
    } catch (err) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }
  }
}
