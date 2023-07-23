interface IUserInfo {
  userId: number;
  name: string;
  email: string;
}

export interface IUserAuth {
  userInfo: IUserInfo;
  accessToken: string;
}
