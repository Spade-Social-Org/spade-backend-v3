import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class dateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  date_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  user_date_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  user_id: number;
}
