import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../usuarios/rol.enum.js';

/** Datos del usuario que la API devuelve al iniciar sesión. */
export class UsuarioSesionDto {
  @ApiProperty({ description: 'Identificador del usuario.', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre completo, tal como se muestra en pantalla.', example: 'Dr. Rodrigo Salas' })
  nombre: string;

  @ApiProperty({ description: 'RUT con puntos y guion.', example: '12.345.678-5' })
  rut: string;

  @ApiProperty({ enum: Rol, description: 'Rol del usuario.', example: Rol.DOCTOR })
  rol: Rol;

  @ApiProperty({
    description: 'Especialidad del doctor. Es nula para los pacientes.',
    example: 'Medicina General',
    type: String,
    nullable: true,
  })
  especialidad: string | null;
}

/** Respuesta del inicio de sesión: el token y los datos del usuario. */
export class LoginRespuestaDto {
  @ApiProperty({
    description: 'Token JWT. Se envía en el encabezado `Authorization: Bearer <token>`. Vence a las 8 horas.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ type: UsuarioSesionDto, description: 'Usuario que inició sesión.' })
  usuario: UsuarioSesionDto;
}
