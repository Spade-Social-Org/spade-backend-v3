import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import {
  BodyTypeEnum,
  EthnicityEnum,
  GenderPreferenceEnum,
  RelationshipTypeEnum,
  ReligionEnum,
} from '~/constant/ModelEnums';
import { UserModel } from '~/database/models/UserModel';
export class CreateUserDto {
  email: string;

  password: string;

  name: string;

  phone_number: string;
  otp?: string;
}

export class UpdateUserDto {
  email?: string;

  password?: string;

  name?: string;

  phone_number?: string;
  otp?: string;
  otp_verified?: boolean;
}
export class UpdateUserProfileDto {
  @ApiProperty({ enum: GenderPreferenceEnum })
  @IsString()
  gender: GenderPreferenceEnum;

  @ApiProperty({ enum: RelationshipTypeEnum })
  @IsString()
  relationship_type: RelationshipTypeEnum;

  @ApiProperty()
  @IsInt()
  min_age: number;

  @ApiProperty()
  @IsInt()
  max_age: number;

  @ApiProperty()
  @IsArray()
  hobbies: string[];

  @ApiProperty()
  @IsInt()
  radius: number;

  @ApiProperty({ enum: GenderPreferenceEnum })
  @IsString()
  gender_preference: GenderPreferenceEnum;

  @ApiProperty({ enum: ReligionEnum })
  @IsString()
  religion: ReligionEnum;

  @ApiProperty({ enum: BodyTypeEnum })
  @IsString()
  body_type: BodyTypeEnum;

  @ApiProperty()
  @IsInt()
  height: number;

  @ApiProperty({ enum: EthnicityEnum })
  @IsString()
  ethnicity: EthnicityEnum;

  @ApiProperty()
  @IsNumber()
  longitude: number;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsDateString()
  dob: Date;
}
export class DiscoverDto {
  @ApiProperty()
  @IsNumber()
  longitude: number;

  @ApiProperty()
  @IsNumber()
  latitude: number;
}
export class addAddressDto {
  country: string;

  city: string;

  state: string;

  postal_code: string;
  user: UserModel;
}
