import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { IS_PUBLIC_KEY } from './decorators.js';
import type { JwtPayload, RequestConUsuario } from './usuario-autenticado.js';

/**
 * Guardia global de autenticación. Toda ruta exige un token JWT válido, salvo las marcadas con
 * `@Public()`. Corre antes que `RolesGuard`.
 *
 * El token solo identifica al usuario. Después de validar firma y vencimiento, la guardia consulta la
 * base de datos: el usuario debe existir y estar activo, y su rol y nombre se toman de ahí. Por eso un
 * usuario desactivado pierde el acceso en la siguiente petición y un cambio de rol se aplica de
 * inmediato, sin esperar a que el token venza.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {}

  /**
   * @param context Contexto de la petición en curso.
   * @returns `true` si la ruta es pública o si el token es válido y el usuario está activo.
   * @throws UnauthorizedException Si falta el token, no es válido o el usuario no puede ingresar.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublica) return true;

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    // El esquema "Bearer" se acepta sin distinguir mayúsculas, como indica el estándar HTTP.
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    if (tipo?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Debe iniciar sesión');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const usuario = await this.usuarios.findOne({
      where: { id: payload.sub },
      select: { id: true, rol: true, nombre: true, activo: true },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    request.user = { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre };
    return true;
  }
}
