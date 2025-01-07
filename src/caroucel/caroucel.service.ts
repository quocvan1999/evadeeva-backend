import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseType } from 'src/types/response.type';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { PrismaClient } from '@prisma/client';
import { CarouselImageDto } from './dto/caroucel-image.dto';
import { ListType } from 'src/types/list.type';

@Injectable()
export class CaroucelService {
  prisma = new PrismaClient();

  constructor(private readonly googleDriveService: GoogleDriveService) {}

  async createCaroucel(
    body: CreateCaroucelDto,
    file: Express.Multer.File,
  ): Promise<ResponseType<null>> {
    try {
      if (!file) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không thể lấy tập tin',
          type: 'err',
        };
      }

      const upload = await this.googleDriveService.uploadFile(
        file,
        'Caroucel',
        ['image/jpeg', 'image/jpg', 'image/webp'],
        5 * 1024 * 1024,
      );

      if (!upload) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không thể tải tập tin lên',
          type: 'err',
        };
      }

      const createCaroucell = await this.prisma.carouselImages.create({
        data: {
          image_url: `${upload}`,
          title: body.title === '' ? file.originalname : body.title,
          description: body.description === '' ? '' : body.description,
          is_active: `${body.is_active}` === 'true' ? true : false,
        },
      });

      if (!createCaroucell) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Thêm caroucel không thành công',
          type: 'err',
        };
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Thêm caroucel thành công',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllCaroucel(
    isActive: 'All' | 'True' | 'False' = 'All',
    page: number,
    limit: number,
    keyword: string,
  ): Promise<ResponseType<ListType<CarouselImageDto[]>>> {
    try {
      const active =
        isActive === 'True' ? true : isActive === 'False' ? false : undefined;

      const caroucels = await this.prisma.carouselImages.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          is_active: active,
          title: {
            contains: keyword,
          },
        },
      });

      if (!caroucels) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Lấy danh sách caroucel không thành công',
          type: 'err',
        };
      }

      const count = await this.prisma.carouselImages.count({
        where: {
          is_active: active,
          title: {
            contains: keyword,
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách caroucel thành công',
        type: 'res',
        data: {
          data: caroucels,
          page: page,
          limit: limit,
          count: count,
          keyword: keyword,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
