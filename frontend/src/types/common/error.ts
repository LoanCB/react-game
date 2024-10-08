interface ApiErrorObject {
  error: string;
  errorCode: string;
}

export interface ApiError {
  data: ApiErrorObject;
}
