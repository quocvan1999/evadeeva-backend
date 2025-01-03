export type ResponseSuccessType<T> = {
  statusCode: number;
  content: {
    message: string;
    data?: T;
  };
  timestamp: Date;
};

export type ResponseErrorType<T> = {
  statusCode: number;
  content: {
    message: string;
    error: T;
  };
  timestamp: Date;
};

export type ResponseType<T> = {
  statusCode: number;
  data: T;
};
