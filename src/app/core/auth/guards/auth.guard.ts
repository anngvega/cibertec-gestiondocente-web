import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router: Router = inject(Router);
  const authService = inject(AuthService);

  if (state.url.includes('/auth/login')) {
    return of(true);
  }

  return authService.check().pipe(
    switchMap((authenticated) => {
      if (!authenticated) {
        return of(router.parseUrl('/auth/login'));
      }
      return of(true);
    }),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};
