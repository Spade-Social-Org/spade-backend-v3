import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseAppController } from '../../base/BaseAppController';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Request as nestjsRequest,
} from '@nestjs/common';

import { Response, Request, Express } from 'express';
import { Multer } from 'multer';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { PostService } from './post.service';
import { createPostDto } from './post.dto';

@ApiTags('Post')
@ApiBearerAuth('Bearer')
@Controller('api/v1/posts')
export class PostController extends BaseAppController {
  constructor(private readonly postService: PostService) {
    super();
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'create post' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UseInterceptors(FilesInterceptor('files'))
  @Post('')
  async create(
    @Body() body: createPostDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })

        .build({
          exceptionFactory: () =>
            new BadRequestAppException(ResponseMessage.BAD_REQUEST),
        }),
    )
    files: Array<Express.Multer.File>,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    console.log(body, files, userId);
    const result = await this.postService.create(body, files, userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }

  @ApiOperation({ summary: 'like a post' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Patch('like/:id')
  async likePost(
    @Param('id') id: number,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const result = await this.postService.likePost(id, userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }

  @ApiOperation({ summary: 'Get user  feeds' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('user/feeds')
  async getUserFeeds(
    @nestjsRequest() req: any,
    @Res() res: Response,
    @Query('is_story') is_story: boolean,
    @Query() queryOptions: { page: number; pageSize: number },
  ) {
    const userId = req.user.userId;

    const result = await this.postService.getUserFeeds(
      userId,
      is_story,
      queryOptions.page,
      queryOptions.pageSize,
    );
    return this.getHttpResponse().sendResponseBody(res, {
      data: result.feeds,
      meta: result.meta,
    });
  }
}
