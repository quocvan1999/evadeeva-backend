import { ApiProperty } from '@nestjs/swagger';

// DTO cho upload 1 hình ảnh
export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

// DTO cho upload nhiều hình ảnh
export class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
