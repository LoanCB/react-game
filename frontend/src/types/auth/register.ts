export interface RegisterCredentials {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

export interface CreatedUser extends RegisterCredentials {
  id: string;
}
