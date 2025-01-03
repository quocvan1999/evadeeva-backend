import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaroucelService } from './caroucel.service';
import { CreateCaroucelDto } from './dto/create-caroucel.dto';
import { UpdateCaroucelDto } from './dto/update-caroucel.dto';

@Controller('caroucel')
export class CaroucelController {
  constructor(private readonly caroucelService: CaroucelService) {}

  @Post()
  create(@Body() createCaroucelDto: CreateCaroucelDto) {
    return this.caroucelService.create(createCaroucelDto);
  }

  @Get()
  findAll() {
    return this.caroucelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caroucelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaroucelDto: UpdateCaroucelDto) {
    return this.caroucelService.update(+id, updateCaroucelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caroucelService.remove(+id);
  }
}
