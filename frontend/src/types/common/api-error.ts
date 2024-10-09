export default interface ApiError {
  data: {
    error: string;
    errorCode?: string;
  };
}
