import {
  Controller,
  Post,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { CaroucelService } from './caroucel.service';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { ResponseType } from 'src/types/response.type';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/role.decorator';
import { CarouselImageDto } from './dto/caroucel-image.dto';
import { ListType } from 'src/types/list.type';

@Controller('caroucel')
export class CaroucelController {
  constructor(private readonly caroucelService: CaroucelService) {}

  @Get()
  @ApiQuery({
    name: 'is_active',
    enum: ['All', 'True', 'False'],
    required: true,
    description: 'Chọn các giá trị (All, True, False)',
    example: 'All',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  async getAllCaroucel(
    @Query('is_active') isActive: 'All' | 'True' | 'False' = 'All',
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('keyword') keyword: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const formatPage = page ? Number(page) : 1;
      const formatSize = limit ? Number(limit) : 10;

      const caroucels: ResponseType<ListType<CarouselImageDto[]>> =
        await this.caroucelService.getAllCaroucel(
          isActive,
          formatPage,
          formatSize,
          keyword,
        );

      switch (caroucels.type) {
        case 'res':
          return res.status(caroucels.statusCode).json({
            statusCode: caroucels.statusCode,
            content: {
              message: caroucels.message,
              data: caroucels.data.data,
              page: caroucels.data.page,
              limit: caroucels.data.limit,
              count: caroucels.data.count,
              keyword: caroucels.data.keyword,
            },
            timestamp: new Date().toISOString(),
          });
        case 'err':
          return res.status(caroucels.statusCode).json({
            statusCode: caroucels.statusCode,
            content: {
              error: caroucels.message,
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
          message: 'Internal Server Error',
          error: error?.message || 'Internal Server Error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Post()
  @ApiHeader({ name: 'token', required: true })
  @UseGuards(AuthGuard)
  @Roles('Admin')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    type: CreateCaroucelDto,
    required: true,
  })
  async createCaroucel(
    @Body() body: CreateCaroucelDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const upload: ResponseType<null> =
        await this.caroucelService.createCaroucel(body, file);

      switch (upload.type) {
        case 'res':
          return res.status(upload.statusCode).json({
            statusCode: upload.statusCode,
            content: {
              message: upload.message,
            },
            timestamp: new Date().toISOString(),
          });
        case 'err':
          return res.status(upload.statusCode).json({
            statusCode: upload.statusCode,
            content: {
              error: upload.message,
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
          message: 'Internal Server Error',
          error: error?.message || 'Internal Server Error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
