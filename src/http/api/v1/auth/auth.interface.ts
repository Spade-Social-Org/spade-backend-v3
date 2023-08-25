interface IUserInfo {
  userId: number;
  name: string;
  email: string;
  verified?: boolean;
}

export interface IUserAuth {
  userInfo: IUserInfo;
  accessToken: string;
}
