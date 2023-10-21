import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';

import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { BaseAppException } from '~/http/exceptions/BaseAppException';
import { NotFoundAppException } from '~/http/exceptions/NotFoundAppException';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { AppLogger } from '~/shared/AppLogger';

import { fileUpload, generatePaginationMeta } from '~/utils/general';

import { FileModel } from '~/database/models/FileModel';
import {
  BookmarkEnum,
  FileEntityType,
  FileType,
  LikeEnum,
} from '~/constant/ModelEnums';
import { PostModel } from '~/database/models/PostModel';
import { UserService } from '../user/user.service';
import { MatchModel } from '~/database/models/MatchModel';
import { FeedModel } from '~/database/models/feedModel';
import dataSource from '~/database/connections/default';
import { createPostDto } from './post.dto';
import { IBookmark, ILike, PaginationData } from '~/constant/interface';
import { PostLikeModel } from '~/database/models/PostLikeModel';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PostBookmarkModel } from '~/database/models/PostBookmarkModel';

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

    @InjectRepository(PostLikeModel)
    private postLikeRepository: Repository<PostLikeModel>,
    @InjectRepository(PostBookmarkModel)
    private postBookmarkRepository: Repository<PostBookmarkModel>,

    @InjectRepository(FileModel)
    private fileRepository: Repository<FileModel>,
    private userService: UserService,
  ) {}
  async create(
    createPayload: createPostDto,
    _files: Array<Express.Multer.File>,
    userID: number,
  ): Promise<PostModel> {
    try {
      //find the user
      const { files, gallery, ...payload } = createPayload;
      const user = await this.userService.findOneById(userID);
      if (!user) {
        throw new NotFoundAppException(ResponseMessage.USER_NOT_FOUND);
      }
      payload.user = user;
      if (payload.is_story) {
        payload.is_story = true;
      }

      //create the post
      const post = await this.postRepository.save(payload);
      //upload the file
      if (_files.length) {
        await this.addImages(post, _files);
      } else if (gallery.length) {
        await this.addImages(post, [], gallery);
      }

      //add it to  feed of all  the users matchers
      //TODO: MOVE THIS TO A QUEUE  TO BE PROCESSED BY A SEPERATE THREAD/PROCESS
      await this.createFeed(post.id, userID, payload.is_story);
      return (await this.findOne(post.id)) as PostModel;
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async findOne(id: number): Promise<PostModel | null> {
    try {
      //find the user
      const query = `select 
    files.file_path as  gallery,
    post.description ,
   post.id,
   post.created_at,
   post.is_story
    
  from 
     posts post 
    left join files files on files.post_id = post.id  and files."entityType" = 'post' 
     
    
  where 
    post.id = $1
   `;
      return await dataSource.manager.query(query, [id]);
      // return await this.postRepository.findOne({
      //   relations: ['files'],
      //   select: ['id', 'description', 'is_story', 'files.file_path'],
      //   where: { id: id },
      // });
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async createFeed(
    postId: number,
    userId: number,
    isStory: boolean,
  ): Promise<void> {
    //  find all users that have matched with this user
    const matches = await this.matchRepository.find({
      where: [{ user_id_1: userId }, { user_id_2: userId }],
    });
    const feedPayload = matches.map((match) => ({
      post_id: postId,
      posted_by: userId,
      user_id: match.user_id_1 === userId ? match.user_id_2 : match.user_id_1,
    }));
    if (isStory) {
      feedPayload.push({
        post_id: postId,
        posted_by: userId,
        user_id: userId,
      });
    }
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
    post: PostModel,
    files?: Array<Express.Multer.File>,
    fileArray?: string[],
  ): Promise<void> {
    try {
      let gallery: string[] = [];
      if (fileArray?.length) {
        gallery = fileArray;
      } else if (files?.length) {
        gallery = await fileUpload(files);
      } else {
        return;
      }

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
  async getUserFeeds(
    userId: number,
    isStory = false,
    page?: number,
    pageSize?: number,
  ): Promise<{ feeds: FeedModel[]; meta: PaginationData }> {
    const _page = page && Number(page) > 0 ? Number(page) : 1;
    const take = pageSize && Number(pageSize) > 0 ? Number(pageSize) : 15;
    const skip = (_page - 1) * take;
    let story = false;
    let query = `select 
    files.file_path as  gallery,
    post.description ,
    post.id,
    post.created_at,
    poster."name" as poster_name ,
    poster.id as poster_id,
    posterFiles.file_url as poster_image,
    (
      select count(plikes.id) from post_likes plikes where plikes.post_id = post.id and plikes.unlike is false
    ) as number_of_likes,
    CASE WHEN COALESCE((SELECT COUNT(pb.id) from post_bookmarks pb where pb.post_id = post.id and pb.user_id =${userId} and pb.bookmark is true LIMIT 1), 0) = 1 THEN 'true' ELSE 'false' END AS bookmarked,
    CASE WHEN COALESCE((SELECT COUNT(plikes.id) from post_likes plikes where plikes.post_id = post.id and plikes.user_id =${userId} and plikes.unlike is false LIMIT 1), 0) = 1 THEN 'true' ELSE 'false' END AS liked_post
  from 
    feeds feed 
    inner join users poster on poster.id = feed.posted_by 
    inner join posts post on post.id = feed.post_id
    
    left join files files on files.post_id = post.id  and files."entityType" = 'post' 
    left join files posterFiles on posterFiles.user_id  = feed.posted_by  and posterFiles."entityType" = 'user' 
    
  where 
    feed.user_id = $1
   `;
    let totalQuery = `select 

    count(*) as total
   
 from 
   feeds feed 
 
   inner join posts post on post.id = feed.post_id

   
 where 
   feed.user_id = $1
  `;
    if (isStory) {
      console.log(isStory);
      story = true;
      query = query.concat(`
      and 
      post.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'`);
      totalQuery = totalQuery.concat(`
      and 
      post.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'`);
    }
    query = query.concat(`and 
    post.is_story = ${story}
    order by feed.created_at desc
    limit  $2
    offset  $3
   `);
    totalQuery = totalQuery.concat(`and 
    post.is_story = ${story}
    `);
    try {
      const [feeds, count] = await Promise.all([
        dataSource.manager.query(query, [userId, take, skip]),
        dataSource.manager.query(totalQuery, [userId]),
      ]);
      const total = Number(count[0].total);

      return {
        feeds,
        meta: generatePaginationMeta(take, _page, total, 'post/user/feeds'),
      };
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  //
  async likePost(data: ILike): Promise<void> {
    try {
      const likeData: any = {
        post_id: data.postId,
        user_id: data.userId,
      };
      likeData['unlike'] =
        data.action.toLowerCase() == LikeEnum.UNLIKE ? true : false;
      await this.postLikeRepository
        .createQueryBuilder()
        .insert()
        .into(PostLikeModel)
        .values(likeData as QueryDeepPartialEntity<PostLikeModel>)
        .orUpdate(Object.keys(likeData), ['post_id', 'user_id'])
        .execute();
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async bookmarkPost(data: IBookmark): Promise<void> {
    try {
      const bookmarkData: any = {
        post_id: data.postId,
        user_id: data.userId,
      };
      bookmarkData['bookmark'] =
        data.action.toLowerCase() == BookmarkEnum.SAVE ? true : false;
      await this.postBookmarkRepository
        .createQueryBuilder()
        .insert()
        .into(PostBookmarkModel)
        .values(bookmarkData as QueryDeepPartialEntity<PostBookmarkModel>)
        .orUpdate(Object.keys(bookmarkData), ['post_id', 'user_id'])
        .execute();
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async getBookmarkPost(userId: number): Promise<PostBookmarkModel[] | null> {
    try {
      return await this.postBookmarkRepository.find({
        where: { bookmark: true, user_id: userId },
        relations: { post: { files: true } },
      });
    } catch (error) {
      this.appLogger.logError(error);
      if (error instanceof BaseAppException) {
        throw error;
      }
      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
}
