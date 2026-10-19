/** Forma de todas las respuestas correctas de la API. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

/** Forma de los errores de la API (400, 404, 409...). */
export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ApiFieldError[];
}
