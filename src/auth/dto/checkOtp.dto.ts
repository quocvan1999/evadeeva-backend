import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckOtpAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Code không được để trống' })
  @ApiProperty()
  otp: string;
}
