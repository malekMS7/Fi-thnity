import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import { SessionService } from './session.service';

/** Remplace ProtectedRoute : redirige vers /connexion si le visiteur n'est pas connecté. */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (session.user()) return true;
  return new RedirectCommand(router.parseUrl('/connexion'), {
    state: { from: state.url },
    replaceUrl: true,
  });
};
