export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type QueryParamsValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamsValue>;