import { ApiProperty } from '@nestjs/swagger';
import type { Request } from 'express';
import { Rol } from '../usuarios/rol.enum.js';

/**
 * Datos mínimos del usuario que hace una petición. Los completa `JwtAuthGuard` con lo que hay en la
 * base de datos (no con lo que dice el token) y quedan disponibles en `request.user`.
 */
export class UsuarioAutenticado {
  @ApiProperty({ description: 'Identificador del usuario.', example: 3 })
  id: number;

  @ApiProperty({ enum: Rol, description: 'Rol del usuario según la base de datos.', example: Rol.PACIENTE })
  rol: Rol;

  @ApiProperty({ description: 'Nombre completo.', example: 'Ana Muñoz' })
  nombre: string;
}

/** Contenido (claims) del token JWT que firma `AuthService.login`. */
export interface JwtPayload {
  /** Identificador del usuario (convención `sub` de JWT). */
  sub: number;
  /** Rol al momento de iniciar sesión. Solo informativo: la autorización usa el rol de la base de datos. */
  rol: Rol;
  /** Nombre del usuario al momento de iniciar sesión. */
  nombre: string;
}

/** Solicitud de Express a la que `JwtAuthGuard` le agrega el usuario autenticado. */
export type RequestConUsuario = Request & { user?: UsuarioAutenticado };
