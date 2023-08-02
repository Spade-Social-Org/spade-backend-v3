import { config } from 'dotenv';
import * as path from 'path';

export type ProcessEnv = {
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  PORT: number;
  PROJECT_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  INSTANCE_ID: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  MAX_AUTH_FAILURE_BEFORE_BLACKLIST: number;
  CAPTCHA_SECRET: string;
  CAPTCHA_MINIMUM_EXPECTED_SCORE: number;
  FILE_CHUNK_PARTITION_SIZE: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER_NAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONN_POOL_COUNT: number;

  SMTP_HOST: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  RESEND_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  SENTRY_DSN: string;
  SENTRY_ENV: string;
};

config({
  path: path.join(process.cwd(), '.env'),
});

const processEnvObj = process.env as unknown as ProcessEnv;

export default processEnvObj;
