import processEnvObj from '.';

export default () => ({
  host: processEnvObj.REDIS_HOST,
  port: parseInt(String(processEnvObj.REDIS_PORT || '6379'), 10) || 6379,
});
