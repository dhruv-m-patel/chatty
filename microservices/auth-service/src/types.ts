export interface LoginRequest {
  username: string;
  password: string;
}

export interface StandardLoginToken {
  access_token: string; // eslint-disable-line
  refresh_token: string; // eslint-disable-line
  expires_at: number; // eslint-disable-line
  refresh_expires_at: number; // eslint-disable-line
  token_type: string; // eslint-disable-line
  // id: string;
  // lastLoggedIn: number;
  // migrated: boolean;
  // name: string;
  // email: string;
}
