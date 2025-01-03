import { Module } from '@nestjs/common';
import { CaroucelService } from './caroucel.service';
import { CaroucelController } from './caroucel.controller';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';

@Module({
  controllers: [CaroucelController],
  providers: [CaroucelService],
  imports: [GoogleDriveModule],
})
export class CaroucelModule {}
