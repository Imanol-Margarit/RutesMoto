import { HttpInterceptorFn } from '@angular/common/http';

export const requestInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { Accept: 'application/json' } }));
