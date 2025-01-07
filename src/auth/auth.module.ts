import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtCustomModule } from 'src/jwt/jwt.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [JwtCustomModule],
})
export class AuthModule {}
