import {
  Controller,
  Get,
  Param,
  Patch,
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
import { NotificationService } from './notification.service';

@ApiBearerAuth('Bearer')
@ApiTags('Notifications')
@Controller('api/v1/notifications')
export class NotificationController extends BaseAppController {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }
  @ApiOperation({ summary: ' get notification for  a user ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Get('/')
  async getNotifications(@nestjsRequest() req: any, @Res() res: Response) {
    const result = await this.notificationService.getNotifications(
      req.user.userId,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  @ApiOperation({ summary: ' update notification for  a user ' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Patch('/:id')
  async updateNotification(
    @nestjsRequest() req: any,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    const result = await this.notificationService.updateNotification(
      req.user.userId,
      id,
    );
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
}
