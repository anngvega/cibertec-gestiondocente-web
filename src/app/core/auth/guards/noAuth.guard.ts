import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router: Router = inject(Router);
  return inject(AuthService).check().pipe(
    switchMap((authenticated) => {
      if (authenticated) {
        return of(router.parseUrl('/dashboard'));
      }
      return of(true);
    }),
  );
};
