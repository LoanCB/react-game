export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginToken {
  token: string;
  error?: string;
  errorCode?: string;
}
