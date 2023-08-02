import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';

import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { BaseAppException } from '~/http/exceptions/BaseAppException';
import { NotFoundAppException } from '~/http/exceptions/NotFoundAppException';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { AppLogger } from '~/shared/AppLogger';

import { fileUpload } from '~/utils/general';

import { FileModel } from '~/database/models/FileModel';
import { FileEntityType, FileType } from '~/constant/ModelEnums';
import { PostModel } from '~/database/models/PostModel';
import { UserService } from '../user/user.service';
import { MatchModel } from '~/database/models/MatchModel';
import { FeedModel } from '~/database/models/feedModel';
import dataSource from '~/database/connections/default';
import { createPostDto } from './post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly appLogger: AppLogger,
    @InjectRepository(PostModel)
    private postRepository: Repository<PostModel>,
    @InjectRepository(MatchModel)
    private matchRepository: Repository<MatchModel>,
    @InjectRepository(FeedModel)
    private feedRepository: Repository<FeedModel>,

    @InjectRepository(FileModel)
    private fileRepository: Repository<FileModel>,
    private userService: UserService,
  ) {}
  async create(
    createPayload: createPostDto,
    _files: Array<Express.Multer.File>,
    userID: number,
  ): Promise<void> {
    try {
      //find the user
      const { files, ...payload } = createPayload;
      const user = await this.userService.findOneById(userID);
      if (!user) {
        throw new BadRequestAppException(ResponseMessage.USER_NOT_FOUND);
      }
      payload.user = user;
      if (payload.is_story) {
        payload.is_story = true;
      }

      //create the post
      const post = await this.postRepository.save(payload);
      //upload the file
      await this.addImages(_files, post);

      //add it to  feed of all  the users matchers
      //TODO: MOVE THIS TO A QUEUE  TO BE PROCESSED BY A SEPERATE THREAD/PROCESS
      await this.createFeed(post.id, userID);
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async createFeed(postId: number, userId: number): Promise<void> {
    //  find all users that have matched with this user
    const matches = await this.matchRepository.find({
      where: [{ user_id_1: userId }, { user_id_2: userId }],
    });
    const feedPayload = matches.map((match) => ({
      post_id: postId,
      posted_by: userId,
      user_id: match.user_id_1 === userId ? match.user_id_2 : match.user_id_1,
    }));
    //loop through them and prepare the feed payload {post_id:postId,posted_by:userId,user_id:match.id}
    // save the feed for all the matches
    await this.feedRepository
      .createQueryBuilder()
      .insert()
      .into(FeedModel)
      .values(feedPayload)
      .execute();
  }
  //addImages
  async addImages(
    files: Array<Express.Multer.File>,
    post: PostModel,
  ): Promise<void> {
    try {
      const gallery = await fileUpload(files);
      const _file = new FileModel();
      _file.file_path = gallery;
      _file.post = post;
      _file.entityType = FileEntityType.POST;
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
  async getUserFeeds(userId: number, isStory = false): Promise<FeedModel[]> {
    //TODO: PAGINATION
    const query = `select 
    files.file_path as  gallery,
    post.description ,
    poster."name" as poster_name ,
    posterFiles.file_url as poster_image
    
  from 
    feeds feed 
    inner join users poster on poster.id = feed.posted_by 
    inner join posts post on post.id = feed.post_id
    left join files files on files.post_id = post.id  and files."entityType" = 'post' 
    left join files posterFiles on posterFiles.user_id  = feed.posted_by  and posterFiles."entityType" = 'user' 
    
  where 
    feed.user_id = $1
   `;
    if (isStory) {
      query.concat(`and 
      post.is_story = true
      and 
      post.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'`);
    }
    query.concat(`order by feed.created_at `);
    try {
      const feeds = await dataSource.manager.query(query, [userId]);

      return feeds;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
}
