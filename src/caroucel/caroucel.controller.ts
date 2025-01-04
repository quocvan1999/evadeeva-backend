import {
  Controller,
  Post,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { CaroucelService } from './caroucel.service';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiHeader } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { ResponseType } from 'src/types/response.type';

@Controller('caroucel')
export class CaroucelController {
  constructor(private readonly caroucelService: CaroucelService) {}

  @Post()
  @ApiHeader({ name: 'token', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateCaroucelDto,
    required: true,
  })
  @UseInterceptors(FileInterceptor('file'))
  async createCaroucel(
    @Body() body: CreateCaroucelDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const upload: ResponseType<null> =
        await this.caroucelService.createCaroucel(body, file);

      return res.status(upload.statusCode).json({
        statusCode: upload.statusCode,
        content: {
          message: 'Thêm caroucel thành công',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        content: {
          message: 'Internal Server Error',
          error: error?.message || 'Internal Server Error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
