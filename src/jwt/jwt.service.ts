import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomJwtService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(
    payload: Record<string, any>,
    expiresIn: string | number,
  ): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  extractAndVerifyToken(authorizationHeader: string): any {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Thiếu header Authorization');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Thiếu token');
    }

    try {
      return this.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
