import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaroucelModule } from './caroucel/caroucel.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    CaroucelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
