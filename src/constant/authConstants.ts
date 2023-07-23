import processEnvObj from '~/config/envs';

export const jwtConstants = {
  secret: processEnvObj.JWT_SECRET,
  expiresIn: processEnvObj.JWT_EXPIRES_IN,
};
