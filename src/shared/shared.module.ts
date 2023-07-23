import { Global, Module } from '@nestjs/common';
import { AppLogger } from './AppLogger';
import { HttpResponse } from './HttpResponse';
import { AxiosService } from './service/axios.service';

import { EventBusService } from './service/eventBus.service';

import { EmailService } from './service/email.service';

const providers = [
  HttpResponse,
  AppLogger,
  AxiosService,

  EventBusService,

  EmailService,
];
@Module({
  providers: providers,
  exports: providers,
})
@Global()
export class SharedModule {}
