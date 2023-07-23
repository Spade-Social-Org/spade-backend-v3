import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NotAuthorizedAppException } from '~/http/exceptions/NotAuthorizedAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { JwtService } from '@nestjs/jwt';
import { IUserAuth } from './auth.interface';
import { GenerateOTP, hashTextComparer, hasher } from '~/utils/general';
import { SignUpDto } from './auth.dto';
import { BadRequestAppException } from '~/http/exceptions/BadRequestAppException';
import { EmailService } from '~/shared/service/email.service';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { AppLogger } from '~/shared/AppLogger';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private readonly appLogger: AppLogger,
  ) {}
  async signUp(payload: SignUpDto): Promise<void> {
    try {
      const user = await this.userService.findOneByEmail(payload.email);
      if (user) {
        throw new BadRequestAppException(ResponseMessage.USER_REGISTERED);
      }

      payload.password = await hasher(payload.password);
      //Generate OTP
      //TODO: improve generation of otp
      const otp = await this.userService.generateUserOtp();
      //create user account
      const newUser = await this.userService.createUser({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        phone_number: payload.phone_number,
        otp,
      });
      //add address
      console.log({ newUser });

      await this.userService.addAddress({
        country: payload.country,
        city: payload.city,
        state: payload.state,
        postal_code: payload.postal_code,
        user: newUser,
      });
      const emailOptions = {
        to: newUser.email,
        subject: 'OTP Verification',
        html: `<h1>${otp}</h1>`,
      };
      await this.emailService.sendEmail(emailOptions);
    } catch (error) {
      this.appLogger.logError(error);

      throw new ServerAppException(ResponseMessage.SERVER_ERROR);
    }
  }
  async verifyOtp(otp: string): Promise<IUserAuth> {
    const user = await this.userService.findOneByOtp(otp);
    if (!user) {
      throw new BadRequestAppException(ResponseMessage.USER_REGISTERED);
    }

    await this.userService.updateUser({ otp_verified: true }, user.id);
    const _payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
    };
    return {
      userInfo: _payload,
      accessToken: await this.jwtService.signAsync(_payload),
    };
  }
  async signIn(email: string, plainPassword: string): Promise<IUserAuth> {
    const user = await this.userService.findOneByEmail(email);
    console.log({ user });
    if (!user) {
      throw new NotAuthorizedAppException(ResponseMessage.USER_UNAUTHORIZED);
    }

    if (!(await hashTextComparer(plainPassword, user.password))) {
      throw new NotAuthorizedAppException(ResponseMessage.USER_UNAUTHORIZED);
    }

    const payload = { userId: user.id, name: user.name, email: user.email };
    return {
      userInfo: payload,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
