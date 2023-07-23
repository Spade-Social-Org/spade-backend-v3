import processEnvObj from '.';

export default () => ({
  host: processEnvObj.DB_HOST,
  port: parseInt(String(processEnvObj.DB_PORT || '5432'), 10) || 5432,
  username: processEnvObj.DB_USER_NAME,
  password: processEnvObj.DB_PASSWORD,
  database: processEnvObj.DB_NAME,
  maxPoolConnCount:
    parseInt(String(processEnvObj.DB_CONN_POOL_COUNT), 10) || 10,
});
