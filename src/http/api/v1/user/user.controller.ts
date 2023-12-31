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
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Request as nestjsRequest,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response, Request, Express, query } from 'express';
import { Multer } from 'multer';
import { DiscoverDto, UpdateUserProfileDto, addImageDto } from './user.dto';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { Public } from '~/shared/publicDecorator';
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
    @Body() body: addImageDto,
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
    const result = await this.userService.addImages(userId, files, body);

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
      body.type,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: ' users matches' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('matches')
  async getUserMatches(@nestjsRequest() req: any, @Res() res: Response) {
    const userId = req.user.userId;
    const result = await this.userService.getMatches(userId);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: ' user profile' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('profile/:id')
  async getUserProfile(
    @Param('id') id: number,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const result = await this.userService.getUserProfile(id);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @Public()
  @ApiOperation({ summary: ' suggest username' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('username/:email')
  async suggestUserName(
    @Param('email') email: string,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const result = await this.userService.suggestUserName(email);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  //suggestUserName
  @ApiOperation({ summary: ' like users ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('like/:id')
  async likeUser(
    @Param('id') id: number,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    const result = await this.userService.likeUser(userId, id);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: 'get matches current location ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Public()
  @Get('current-location')
  async getMatchesCurrentLocation(
    @Query() query: { latitude: number; longitude: number },
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const result = await this.userService.showMatchesInCurrentLocation(
      query.latitude,
      query.longitude,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
}
