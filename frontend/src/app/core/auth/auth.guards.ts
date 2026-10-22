import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../toast.service';
import { AuthService } from './auth.service';

/** Signed-in users only; others are sent to the Keycloak login and brought back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  void auth.login(state.url);
  return false;
};

/** Users with the admin role only. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAdmin()) return true;
  if (!auth.isLoggedIn()) {
    void auth.login(state.url);
    return false;
  }
  inject(ToastService).error('That page is for shop admins only.');
  return inject(Router).parseUrl('/');
};
