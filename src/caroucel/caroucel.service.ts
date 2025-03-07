import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseType } from 'src/types/response.type';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { PrismaClient } from '@prisma/client';
import { CarouselImageDto } from './dto/caroucel-image.dto';
import { ListType } from 'src/types/list.type';
import { UpdateCaroucelDto } from './dto/update-caroucel.dto';

@Injectable()
export class CaroucelService {
  prisma = new PrismaClient();

  constructor(private readonly googleDriveService: GoogleDriveService) {}

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

  async deleteCaroucel(id: number): Promise<ResponseType<null>> {
    try {
      const checkcaroucel = await this.prisma.carouselImages.findUnique({
        where: {
          id,
        },
      });

      if (!checkcaroucel) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Caroucel không tồn tại.',
          type: 'err',
        };
      }

      const googleDriveUrl = checkcaroucel.image_url;

      const romoveCaroucel = await this.prisma.carouselImages.delete({
        where: {
          id,
        },
      });

      if (!romoveCaroucel) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Xoá caroucel không thành công.',
          type: 'err',
        };
      }

      await this.googleDriveService.deleteFileByUrl(googleDriveUrl);

      return {
        statusCode: HttpStatus.OK,
        message: 'Xoá caroucel thành công.',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateCaroucel(
    body: UpdateCaroucelDto,
    file: Express.Multer.File,
    id: number,
  ): Promise<ResponseType<null>> {
    try {
      const checkcaroucel = await this.prisma.carouselImages.findUnique({
        where: {
          id,
        },
      });

      if (!checkcaroucel) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Caroucel không tồn tại.',
          type: 'err',
        };
      }

      let img_url = checkcaroucel.image_url;

      if (file) {
        await this.googleDriveService.deleteFileByUrl(checkcaroucel.image_url);

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

        img_url = upload;
      }

      const updateCaroucell = await this.prisma.carouselImages.update({
        where: {
          id,
        },
        data: {
          image_url: `${img_url}`,
          title: body.title === '' ? checkcaroucel.title : body.title,
          description:
            body.description === ''
              ? checkcaroucel.description
              : body.description,
          is_active: `${body.is_active}` === 'true' ? true : false,
        },
      });

      if (!updateCaroucell) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cập nhật caroucel không thành công',
          type: 'err',
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật caroucel thành công',
        type: 'res',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
