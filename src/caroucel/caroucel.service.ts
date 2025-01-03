import { Injectable } from '@nestjs/common';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { UpdateCaroucelDto } from './dto/update-caroucel.dto';

@Injectable()
export class CaroucelService {
  create(createCaroucelDto: CreateCaroucelDto) {
    return 'This action adds a new caroucel';
  }

  findAll() {
    return `This action returns all caroucel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caroucel`;
  }

  update(id: number, updateCaroucelDto: UpdateCaroucelDto) {
    return `This action updates a #${id} caroucel`;
  }

  remove(id: number) {
    return `This action removes a #${id} caroucel`;
  }
}
