import { PartialType } from '@nestjs/swagger';
import { CreateCaroucelDto } from './create-caroucel.dto';

export class UpdateCaroucelDto extends PartialType(CreateCaroucelDto) {}
