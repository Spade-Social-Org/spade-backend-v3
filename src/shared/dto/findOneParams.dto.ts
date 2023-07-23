import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneParams {
  @IsNotEmpty()
  @IsString()
  id: string;
}
