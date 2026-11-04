import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import type { Rol } from './models';

/** Solo deja pasar al rol indicado; el resto vuelve a su propia pantalla o al login. */
export const rolGuard =
  (rol: Rol): CanActivateFn =>
  async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const usuario = await auth.verificar(); // el rol lo confirma el servidor, no el navegador
    if (!usuario) return router.createUrlTree(['/login']);
    return usuario.rol === rol ? true : router.createUrlTree([auth.rutaInicio(usuario.rol)]);
  };

/** Si ya hay sesión, /login redirige a la pantalla del rol. */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuario();
  return usuario ? router.createUrlTree([auth.rutaInicio(usuario.rol)]) : true;
};
