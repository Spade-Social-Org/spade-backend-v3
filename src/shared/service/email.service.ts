import nodemailer, { SendMailOptions } from 'nodemailer';
import { compile } from 'handlebars';
import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Resend } from 'resend';
import { MySendMailOptions } from '../interface';
import processEnvObj from '~/config/envs';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { AppLogger } from '../AppLogger';

const resend = new Resend(processEnvObj.RESEND_API_KEY);

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly appLogger: AppLogger) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      auth: {
        user: '',
        pass: '',
      },
      // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false, // do not fail on invalid certs
      },
    });
    // this.transporter = nodemailer.createTransport(
    //   mailgunTransport(mailgunOptions),
    // );
  }

  public async sendEmail(mailOptions: MySendMailOptions): Promise<void> {
    try {
      console.log(mailOptions);
      // const message = {
      //   from: 'Spade <no-reply@hookychat.com>',
      //   to: mailOptions.to,
      //   subject: mailOptions.subject,
      //   html: mailOptions.html,
      // };
      // const f = await this.transporter.sendMail(message);
      // console.log(f);
      const result = await resend.emails.send({
        from: 'Spade <no-reply@hookychat.com>',
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log(result);
    } catch (error) {
      this.appLogger.logError(error);
    }
  }
}
