import { User } from "../user/user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginToken {
  token: string;
  user: Omit<User, "token">;
}

export interface LoginError {
  data: {
    error: string;
    errorCode?: string;
  };
}
