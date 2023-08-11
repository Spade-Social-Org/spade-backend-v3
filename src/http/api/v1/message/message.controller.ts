import {
  Controller,
  Get,
  Param,
  Res,
  Request as nestjsRequest,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response, Request, Express } from 'express';
import { BaseAppController } from '../../base/BaseAppController';
import { MessageService } from './message.service';

@ApiBearerAuth('Bearer')
@ApiTags('Message')
@Controller('api/v1/messages')
export class MessageController extends BaseAppController {
  constructor(private readonly messageService: MessageService) {
    super();
  }
  @ApiOperation({ summary: ' like users ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('/:userId')
  async likeUser(
    @Param() userId: number,
    @nestjsRequest() req: any,
    @Res() res: Response,
  ) {
    const result = await this.messageService.getConversation(
      req.user.userId,
      userId,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
}
