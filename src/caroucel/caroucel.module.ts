import { Module } from '@nestjs/common';
import { CaroucelService } from './caroucel.service';
import { CaroucelController } from './caroucel.controller';

@Module({
  controllers: [CaroucelController],
  providers: [CaroucelService],
})
export class CaroucelModule {}
