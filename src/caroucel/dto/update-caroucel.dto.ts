import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCaroucelDto } from './create-caroucel.dto';
import { Transform } from 'class-transformer';

export class UpdateCaroucelDto extends OmitType(CreateCaroucelDto, [
  'file',
  'is_active',
] as const) {
  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  newFile?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ required: false, enum: [true, false], default: true })
  is_active?: boolean;
}
