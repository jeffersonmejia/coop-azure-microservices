import { HttpInterceptorFn } from '@angular/common/http';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';

const API_TIMEOUT_MS = 10000;

export const apiTimeoutInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    timeout({ each: API_TIMEOUT_MS }),
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        return throwError(() => new Error('La solicitud tardó demasiado. Intenta nuevamente.'));
      }
      return throwError(() => error);
    }),
  );
