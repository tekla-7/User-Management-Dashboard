import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isLoggedIn = authService.isAuthenticated();
  if (!isLoggedIn) {
    return true;
  } else {
    router.navigate(['/users']);
    return false;
  }};
