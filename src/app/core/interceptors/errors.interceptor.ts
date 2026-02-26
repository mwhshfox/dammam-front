

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';



export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // امسح التوكن - سجل خروج - اعمل redirect
        authService.logout(); // افترض إنها بتشيل التوكن وتروح للـ login
      }

      // تقدر تضيف هندلة لأكواد تانية زي 403, 500, ...الخ
      return throwError(() => error);
    })
  );
};



