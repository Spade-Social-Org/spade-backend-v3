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
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Request as nestjsRequest,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response, Request, Express } from 'express';
import { Multer } from 'multer';
import { DiscoverDto, UpdateUserProfileDto } from './user.dto';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
@ApiBearerAuth('Bearer')
@ApiTags('User')
@Controller('api/v1/users')
export class UserController extends BaseAppController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @ApiOperation({ summary: 'update profile' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('profile/update')
  async updateProfile(
    @Body() body: UpdateUserProfileDto,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const result = await this.userService.updateUserProfile(body, userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'add user  images' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UseInterceptors(FilesInterceptor('files'))
  @Post('image')
  async addImages(
    @Body() body: any,
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
    const result = await this.userService.addImages(files, userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: 'Discover users' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('discover')
  async getUserFeeds(
    @Body() body: DiscoverDto,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const result = await this.userService.discovery(
      userId,
      body.longitude,
      body.latitude,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: 'get matches current location ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('current-location')
  async getMatchesCurrentLocation(
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const result = await this.userService.showMatchesInCurrentLocation(userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
}
