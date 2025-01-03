import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaroucelModule } from './caroucel/caroucel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CaroucelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
