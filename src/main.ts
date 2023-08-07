import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import * as Sentry from '@sentry/node';
import { isConnected } from './database/connections/default';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { Response } from 'express';
import appConfig from './config/envs/app.config';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SocketIOAdapter } from './http/api/v1/gateway/websocketAdapter';

async function bootstrap() {
  //Get app instance
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    bufferLogs: true,
  });

  //Register loggers
  const logger = app.get(Logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useLogger(logger);
  app.flushLogs();
  const adapter = new SocketIOAdapter(app);
  app.useWebSocketAdapter(adapter);

  //Get app config
  const appConfigEnv = appConfig();

  //Ensure database is connected before starting the app
  logger.log('Connecting to database ...');
  await isConnected();
  logger.log('Connected to database');

  //Ensable cors
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    methods: '*',
    exposedHeaders: [],
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //TODO: Incrase paylaod size here default payload sizse is 5mb
  const config = new DocumentBuilder()
    .setTitle('Spade')
    .setDescription('Spade')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        schema: 'Bearer',
        bearerFormat: 'JWT',
      } as SecuritySchemeObject,
      'Bearer',
    )
    .setExternalDoc('Postman Collection', '/docs-json')
    .setBasePath('/api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none', // Set the initial expand level of the documentation (none, list, full)
      filter: true, // Enable filtering of API endpoints
      showRequestDuration: true, // Show the duration of API requests
      operationsSorter: 'alpha', // Sort the API endpoints alphabetically
      tagsSorter: 'alpha', // Sort the tags alphabetically
      validatorUrl: null, // Disable the default schema validator URL
      plugins: [require.resolve('./plugins/swagger-download.plugin.js')],
    },
  });

  app.getHttpAdapter().get('/', (req, res) => {
    const response = res as unknown as Response;
    return response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is up and running',
    });
  });

  const envsToReportOn = ['staging', 'production'];
  if (envsToReportOn.includes(appConfigEnv.NODE_ENV)) {
    Sentry.init({
      dsn: appConfigEnv.SENTRY_DSN,
      environment: appConfigEnv.SENTRY_ENV,
    });
  }

  const server = await app.listen(appConfigEnv.PORT, '0.0.0.0');
  if (server && server.listening) {
    console.log('App listened succesfully');
    console.log('Server opened connection on ====> ', server.address());
  } else {
    console.log('Could not start application');
  }
}

bootstrap();
