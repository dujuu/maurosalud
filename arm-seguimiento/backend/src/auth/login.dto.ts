import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { limpiarTexto } from '../common/texto.util.js';

/** Cuerpo de la solicitud de inicio de sesión. */
export class LoginDto {
  /**
   * RUT del usuario, con o sin puntos y guion. Aquí solo se valida que sea texto no vacío;
   * el dígito verificador se comprueba en `AuthService`.
   */
  @ApiProperty({ description: 'RUT con o sin puntos y guion.', example: '12.345.678-5', maxLength: 20 })
  @Transform(limpiarTexto)
  @IsString({ message: 'Ingrese su RUT' })
  @IsNotEmpty({ message: 'Ingrese su RUT' })
  @MaxLength(20, { message: 'El RUT es demasiado largo' })
  rut: string;

  /** Contraseña. El máximo de 72 caracteres es el límite de bcrypt. */
  @ApiProperty({ description: 'Contraseña del usuario.', example: 'Vida2026', maxLength: 72 })
  @IsString({ message: 'Ingrese su contraseña' })
  @IsNotEmpty({ message: 'Ingrese su contraseña' })
  @MaxLength(72, { message: 'La contraseña es demasiado larga' })
  password: string;
}
