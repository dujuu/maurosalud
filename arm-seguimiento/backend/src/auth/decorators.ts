import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Rol } from '../usuarios/rol.enum.js';
import type { RequestConUsuario } from './usuario-autenticado.js';

/** Clave de metadatos que marca una ruta como pública. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Clave de metadatos con los roles permitidos en una ruta. */
export const ROLES_KEY = 'roles';

/**
 * Marca una ruta (o un controlador completo) como accesible sin token.
 * Por defecto todas las rutas exigen sesión; hoy solo el inicio de sesión es público.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Restringe una ruta (o un controlador) a uno o más roles.
 * Sin este decorador basta con tener una sesión válida.
 *
 * @param roles Roles que pueden usar la ruta.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Entrega al método del controlador el usuario autenticado de la petición.
 * El dato viene del token validado y de la base de datos, nunca de la URL ni del cuerpo,
 * por lo que el cliente no puede hacerse pasar por otra persona.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<RequestConUsuario>().user;
});
