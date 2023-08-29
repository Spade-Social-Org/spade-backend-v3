import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  isBoolean,
} from 'class-validator';

export class createPostDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  is_story: boolean;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  files: Array<Express.Multer.File>;

  @IsOptional()
  user: any;
}