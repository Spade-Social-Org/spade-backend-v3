import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModel } from '~/database/models/FileModel';
import { PostModel } from '~/database/models/PostModel';
import { FeedModel } from '~/database/models/feedModel';
import { PostService } from './post.service';
import { UserModule } from '../user/user.module';
import { PostController } from './post.controller';
import { MatchModel } from '~/database/models/MatchModel';
import { PostLikeModel } from '~/database/models/PostLikeModel';
import { PostBookmarkModel } from '~/database/models/PostBookmarkModel';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostModel,
      FileModel,
      FeedModel,
      MatchModel,
      PostLikeModel,
      PostBookmarkModel,
    ]),
    UserModule,
  ],
  providers: [PostService],
  exports: [],
  controllers: [PostController],
})
export class PostModule {}
