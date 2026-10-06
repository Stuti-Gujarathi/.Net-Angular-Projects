import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/** Set on a request when the caller shows the error itself (e.g. inline under a form). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return "Can't reach the AeroTrip API. Make sure the backend is running on http://localhost:5080.";
    return err.error?.detail ?? err.error?.title ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!req.context.get(SKIP_ERROR_TOAST) && err.status !== 401) toast.error(apiErrorMessage(err));
      return throwError(() => err);
    }),
  );
};
