import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { formatearRut, normalizarRut } from '../common/rut.util.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import type { LoginRespuestaDto } from './auth.respuestas.js';
import type { JwtPayload } from './usuario-autenticado.js';

/** Lógica del inicio de sesión: comprueba las credenciales y entrega el token. */
@Injectable()
export class AuthService {
  /**
   * Hash que se usa para comparar cuando el RUT no existe. Así la respuesta tarda lo mismo con un RUT
   * registrado que con uno que no lo está, y el tiempo no sirve para averiguar qué usuarios existen.
   */
  private readonly hashFalso = bcrypt.hashSync('sin-usuario', 10);

  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Inicia sesión con RUT y contraseña.
   *
   * @param rutEntrada RUT tal como lo escribió el usuario (con o sin puntos y guion).
   * @param password Contraseña en texto plano; solo se compara con el hash guardado.
   * @returns El token JWT y los datos del usuario.
   * @throws BadRequestException Si el dígito verificador del RUT es incorrecto.
   * @throws UnauthorizedException Si el usuario no existe, está inactivo o la contraseña no coincide.
   *   El mensaje es el mismo en los tres casos.
   */
  async login(rutEntrada: string, password: string): Promise<LoginRespuestaDto> {
    const rut = normalizarRut(rutEntrada);
    if (!rut) throw new BadRequestException('El RUT ingresado no es válido');

    // password_hash está marcado como no seleccionable en la entidad; aquí se pide de forma explícita.
    const usuario = await this.usuarios
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.rut = :rut AND u.activo = 1', { rut })
      .getOne();

    const coincide = await bcrypt.compare(password, usuario?.passwordHash ?? this.hashFalso);
    if (!usuario || !coincide) {
      throw new UnauthorizedException('RUT o contraseña incorrectos');
    }

    const payload: JwtPayload = { sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre };
    return {
      accessToken: await this.jwt.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: formatearRut(usuario.rut),
        rol: usuario.rol,
        especialidad: usuario.especialidad,
      },
    };
  }
}
