import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import {
  ErrorLogConfig,
  RequestLogConfig,
  ResponseLogConfig,
} from 'axios-logger/lib/common/types';
import * as AxiosLogger from 'axios-logger';
import { AppLogger } from '~/shared/AppLogger';

@Injectable()
export class AxiosService {
  constructor(private readonly log: AppLogger) {}

  createAxiosInstance({
    baseURL,
    headers,
    fallbackURL,
    timeout = 30000,
  }: {
    baseURL?: string;
    headers?: Record<string, string>;
    fallbackURL: string;
    timeout?: number;
  }): AxiosInstance {
    if (!baseURL) {
      this.log.logInfo(
        `Base URL not specified. Using fallback: ${fallbackURL}`,
      );
    }
    const instance = axios.create({
      baseURL: baseURL || fallbackURL,
      headers,
      timeout,
    });

    this.registerInterceptors(instance);

    return instance;
  }

  private registerInterceptors(instance: AxiosInstance) {
    const axiosLoggerRequestConfig: RequestLogConfig = {
      dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT',
      params: true,
      headers: true,
      data: true,
      method: true,
      url: true,
    };

    const axiosLoggerResponseConfig: ResponseLogConfig | ErrorLogConfig = {
      data: true,
      status: true,
      statusText: true,
    };
    // Add request interceptors
    instance.interceptors.request.use(
      (request) => {
        AxiosLogger.requestLogger(request, axiosLoggerRequestConfig);
        return request;
      },
      (err) => AxiosLogger.errorLogger(err, axiosLoggerResponseConfig),
    );

    // Add response interceptors
    instance.interceptors.response.use(
      (r) => AxiosLogger.responseLogger(r, axiosLoggerRequestConfig),
      (e) => AxiosLogger.errorLogger(e, axiosLoggerResponseConfig),
    );
  }
}
