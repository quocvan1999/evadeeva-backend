import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseType } from 'src/types/response.type';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { PrismaClient } from '@prisma/client';

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
        throw new Error('Không thể lấy tập tin');
      }

      const upload = await this.googleDriveService.uploadFile(
        file,
        'Caroucel',
        ['image/jpeg', 'image/jpg', 'image/webp'],
        5 * 1024 * 1024,
      );

      if (!upload) {
        throw new Error('Không thể tải tập tin lên');
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
        throw new Error('Thêm caroucel không thành công');
      }

      return {
        statusCode: 201,
        message: 'CREATE',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
