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
import dataSource from '~/database/connections/default';
import { LikeCacheModel } from '~/database/models/LikeCacheModel';
import { MatchModel } from '~/database/models/MatchModel';

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
    @InjectRepository(LikeCacheModel)
    private likeRepository: Repository<LikeCacheModel>,
    @InjectRepository(MatchModel)
    private matchRepository: Repository<MatchModel>,
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
  ): Promise<UserModel> {
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

      return await this.usersRepository.save(user);
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
  async discovery(
    userId: number,
    longitude: number,
    latitude: number,
  ): Promise<any> {
    try {
      const user = await this.updateUserProfile(
        { latitude, longitude } as UpdateUserProfileDto,
        userId,
      );
      const minAge = user.profile.min_age;
      const maxAge = user.profile.max_age;
      // const genderPreference = user.profile.gender_preference.join(', ');
      const query = `SELECT 
      *, 
      EXTRACT(
        YEAR 
        FROM 
          AGE(CURRENT_DATE, profile.dob)
      ) as age, 
      (
        6371 * acos(
          cos(
            radians($2)
          ) * cos(
            radians(profile.latitude)
          ) * cos(
            radians(profile.longitude) - radians($3)
          ) + sin(
            radians($2)
          ) * sin(
            radians($3)
          )
        )
      ) AS distance 
    FROM 
      profiles profile 
      inner join users users on users.profile_id = profile.id 
    where 
      EXTRACT(
        YEAR 
        FROM 
          AGE(CURRENT_DATE, profile.dob)
      ) BETWEEN ${minAge} 
      AND ${maxAge} 
     
      and users.id not in ($1) 
    ORDER BY 
      distance;
    `;
      const profiles = await dataSource.manager.query(query, [
        userId,
        latitude,
        longitude,
      ]);

      return profiles;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async showMatchesInCurrentLocation(
    latitude?: number,
    longitude?: number,
  ): Promise<any> {
    try {
      console.log({ longitude, latitude });
      if (!latitude && !longitude)
        throw new BadRequestAppException(ResponseMessage.BAD_REQUEST);
      const query = `select 
      profile.longitude ,
      profile.longitude ,
      userFiles.file_path as  gallery,
      users.id as user_id
    from 
    users users  
      
      inner join profiles profile on profile.id = users.profile_id 
      left join files userFiles on userFiles.user_id  = users.id  and userFiles."entityType" = 'user'
    where 
    (
      6371 * acos(
        cos(
          radians($1)
        ) * cos(
          radians(profile.latitude)
        ) * cos(
          radians(profile.longitude) - radians($2)
        ) + sin(
          radians($1)
        ) * sin(
          radians($2)
        )
      )
    ) > 50
    `;
      // if (latitude && longitude) {
      //   queryVariable = [userId, latitude, longitude];

      //   query = query.concat(`

      // and profile.latitude  = $2
      // and profile.longitude  = $3`);
      // }
      const users = await dataSource.manager.query(query, [
        latitude,
        longitude,
      ]);

      return users;
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async getMatches(userId: number) {
    try {
      const query = `
      SELECT 
          u.id AS user_id,
          u."name",
          userFiles.file_url as image,
          userFiles.file_path as gallery
          
      FROM matches m
      INNER JOIN users u ON
          CASE
              WHEN m.user_id_1 = $1 THEN u.id = m.user_id_2
              ELSE u.id = m.user_id_1
          END
      LEFT JOIN files userFiles ON userFiles.user_id = u.id AND userFiles."entityType" = 'user'
      WHERE m.user_id_1 = $1 OR m.user_id_2 = $1;
      `;
      const users = await dataSource.manager.query(query, [userId]);

      return users;
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async likeUser(
    likerId: number,
    likeeId: number,
  ): Promise<{ match: boolean }> {
    try {
      const [liker, likee, hasLikeLikedLiker] = await Promise.all([
        this.findOneById(likerId),
        this.findOneById(likeeId),
        this.likeRepository.findOne({
          where: { user_liker: likeeId, user_likee: likerId },
        }),
      ]);

      const newLike = new LikeCacheModel();
      newLike.liker = liker as UserModel;
      newLike.likee = likee as UserModel;

      if (hasLikeLikedLiker) {
        const matchUsers = new MatchModel();
        matchUsers.user1 = liker as UserModel;
        matchUsers.user2 = likee as UserModel;
        await Promise.all([
          this.likeRepository.save(newLike),
          this.matchRepository.save(matchUsers),
        ]);
        return { match: true };
      } else {
        await this.likeRepository.save(newLike);
        return { match: false };
      }
    } catch (error) {
      console.error(error);
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
}

// SELECT *,
//        (6371 * acos(cos(radians(:provided_latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:provided_longitude)) + sin(radians(:provided_latitude)) * sin(radians(latitude)))) AS distance
// FROM users
// ORDER BY distance;
