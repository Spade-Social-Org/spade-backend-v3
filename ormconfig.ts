import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { pathFromSrc } from './src/utils/general';
import dbConfig from './src/config/envs/database.config';

dotenv.config();

const defaultConfiguration = dbConfig();
const defaultDataSourceOptions: DataSourceOptions = {
  applicationName: 'Spade',
  name: 'default',
  type: 'postgres',
  ...defaultConfiguration,
  synchronize: true,
  logging: ['error', 'warn', 'log'],
  logger: 'file',
  entities: [pathFromSrc('database/models/*.{js,ts}')],
  migrations: [pathFromSrc('database/migrations/*.{js,ts}')],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  useUTC: true,
  connectTimeoutMS: 10000,
  dropSchema: false,
  migrationsTransactionMode: 'all',
  metadataTableName: 'typeorm_metadata',
  maxQueryExecutionTime: 15000,
  installExtensions: true,
  logNotifications: true,
  ssl: false,
  extra: {
    max: defaultConfiguration.maxPoolConnCount,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  cache: {
    type: 'database',
    tableName: 'typeorm_cache_table',
  },
};
export default defaultDataSourceOptions;
