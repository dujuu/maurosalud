import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Agrega el token a las llamadas a /api y cierra la sesión si el servidor responde 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esLogin = req.url.endsWith('/auth/login');
  const token = auth.token();

  const peticion =
    token && req.url.startsWith('/api') && !esLogin
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !esLogin && token) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
