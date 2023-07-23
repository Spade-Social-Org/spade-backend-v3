import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseAppController } from '../../base/BaseAppController';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Request as nestjsRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, VerifyOtpDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { Public } from '~/shared/publicDecorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController extends BaseAppController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @ApiOperation({ summary: 'sign up' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Public()
  @Post('signup')
  async signup(
    @Body() body: SignUpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.signUp(body);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }

  @ApiOperation({ summary: 'verify otp' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Public()
  @Post('otp/verify')
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyOtp(body.otp);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }

  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 200, description: 'Ok.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.signIn(body.email, body.password);
    return this.getHttpResponse().setDataWithKey('data', result).send(req, res);
  }
  //testing
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@nestjsRequest() req: any) {
    return req.user;
  }
}
