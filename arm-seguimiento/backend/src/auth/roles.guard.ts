import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Rol } from '../usuarios/rol.enum.js';
import { ROLES_KEY } from './decorators.js';
import type { RequestConUsuario } from './usuario-autenticado.js';

/**
 * Guardia global de roles. Corre después de `JwtAuthGuard` y aplica lo que declara `@Roles()`
 * en la ruta o en el controlador. Si la ruta no declara roles, deja pasar a cualquier usuario autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * @param context Contexto de la petición en curso.
   * @returns `true` si la ruta no exige roles o el usuario tiene alguno de los permitidos.
   * @throws ForbiddenException Si el rol del usuario no está entre los permitidos.
   */
  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requeridos || requeridos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<RequestConUsuario>();
    if (!user || !requeridos.includes(user.rol)) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return true;
  }
}
