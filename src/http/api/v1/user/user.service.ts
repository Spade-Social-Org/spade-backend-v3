import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { UserModel } from '~/database/models/UserModel';
import { AddressModel } from '~/database/models/addressModel';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { BaseAppException } from '~/http/exceptions/BaseAppException';
import { NotFoundAppException } from '~/http/exceptions/NotFoundAppException';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { AppLogger } from '~/shared/AppLogger';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserProfileDto,
  addAddressDto,
} from './user.dto';
import { GenerateOTP, fileUpload } from '~/utils/general';
import { assign } from 'lodash';
import { ProfileModel } from '~/database/models/ProfileModel';
import { FileModel } from '~/database/models/FileModel';
import { FileEntityType, FileType } from '~/constant/ModelEnums';

@Injectable()
export class UserService {
  constructor(
    private readonly appLogger: AppLogger,
    @InjectRepository(UserModel)
    private usersRepository: Repository<UserModel>,
    @InjectRepository(AddressModel)
    private addressRepository: Repository<AddressModel>,
    @InjectRepository(ProfileModel)
    private profileRepository: Repository<ProfileModel>,
    @InjectRepository(FileModel)
    private fileRepository: Repository<FileModel>,
  ) {}
  async createUser(payload: CreateUserDto): Promise<UserModel> {
    try {
      return await this.usersRepository.save(payload);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async addAddress(payload: addAddressDto): Promise<void> {
    try {
      console.log({ payload });
      await this.addressRepository.save(payload as unknown as AddressModel);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }

  async findOneByEmail(email: string): Promise<UserModel | null> {
    try {
      if (!email) throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);
      const user = this.usersRepository.findOne({ where: { email } });
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      return user;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async findOneById(id: number): Promise<UserModel | null> {
    try {
      if (!id) throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);
      const user = this.usersRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      return user;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async findOneByOtp(otp: string): Promise<UserModel | null> {
    try {
      const user = this.usersRepository.findOne({
        select: ['id'],
        where: { otp },
      });

      return user;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async updateUser(payload: UpdateUserDto, id: number): Promise<void> {
    try {
      let user = await this.findOneById(id);

      user = assign(user, { ...payload });

      await this.usersRepository.save(user);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async updateUserProfile(
    payload: UpdateUserProfileDto,
    id: number,
  ): Promise<void> {
    try {
      const user = await this.findOneById(id);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      let profile: ProfileModel;
      if (!user?.profile) {
        profile = await this.profileRepository.save(payload);
      } else {
        const _profile = assign(user.profile, { ...payload });
        profile = await this.profileRepository.save(_profile);
      }
      user.profile = profile;

      await this.usersRepository.save(user);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  //addImages
  async addImages(
    files: Array<Express.Multer.File>,
    id: number,
  ): Promise<void> {
    try {
      const user = await this.findOneById(id);
      if (!user) throw new NotFoundAppException(ResponseMessage.NOT_FOUND);
      const gallery = await fileUpload(files);
      const _file = new FileModel();
      _file.file_path = gallery;
      _file.user = user;
      _file.entityType = FileEntityType.USER;
      _file.file_type = FileType.IMAGE;
      await this.fileRepository.save(_file);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async generateUserOtp(): Promise<string> {
    const otp = GenerateOTP();
    const isExist = await this.findOneByOtp(otp);
    if (isExist) {
      this.generateUserOtp();
    }
    return otp;
  }
}
