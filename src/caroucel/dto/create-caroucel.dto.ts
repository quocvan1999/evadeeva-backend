import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCaroucelDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: '' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: '' })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ required: true, enum: [true, false], default: true })
  is_active: boolean;
}
