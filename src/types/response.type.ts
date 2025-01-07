export type ResponseType<T> = {
  statusCode: number;
  type: 'err' | 'res';
  message: string;
  data?: T;
};
