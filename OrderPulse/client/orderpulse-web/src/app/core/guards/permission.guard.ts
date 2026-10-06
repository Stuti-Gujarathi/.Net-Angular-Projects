import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = route.data['permission'] as string | undefined;
  const requiredAny = route.data['anyPermission'] as string[] | undefined;

  if (!required && !requiredAny) return true;
  if (required && auth.hasPermission(required)) return true;
  if (requiredAny && auth.hasAnyPermission(requiredAny)) return true;

  router.navigate(['/forbidden']);
  return false;
};
