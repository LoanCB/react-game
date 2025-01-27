export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface CreatedUser extends RegisterCredentials {
  id: string;
}

export interface VerifyCredentials {
  email: string;
  id: string;
}
