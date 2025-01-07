export type ListType<T> = {
  data: T;
  page: number;
  limit: number;
  count: number;
  keyword?: string;
};
