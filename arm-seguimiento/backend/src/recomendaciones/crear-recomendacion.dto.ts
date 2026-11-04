import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString, MaxLength, MinLength, Min } from 'class-validator';
import { limpiarTexto } from '../common/texto.util.js';
import { TipoRecomendacion } from './tipo-recomendacion.enum.js';

/**
 * Cuerpo de la solicitud para crear una recomendación.
 * El doctor no se indica aquí: la API lo toma del token.
 */
export class CrearRecomendacionDto {
  @ApiProperty({ description: 'Identificador del paciente. Debe estar asignado al doctor.', example: 3, minimum: 1 })
  @IsInt({ message: 'Seleccione un paciente válido' })
  @Min(1, { message: 'Seleccione un paciente válido' })
  pacienteId: number;

  @ApiProperty({ enum: TipoRecomendacion, description: 'Tipo de recomendación.', example: TipoRecomendacion.MEDICAMENTO })
  @IsEnum(TipoRecomendacion, {
    message: 'El tipo debe ser MEDICAMENTO, RUTINA, HABITO_EVITAR u OTRO',
  })
  tipo: TipoRecomendacion;

  /** Se recorta y se limpia de caracteres de control antes de validar el largo. */
  @ApiProperty({
    description: 'Resumen corto de la indicación. Se recortan los extremos antes de validar.',
    example: 'Paracetamol cada 8 horas',
    minLength: 3,
    maxLength: 150,
  })
  @Transform(limpiarTexto)
  @IsString({ message: 'El título es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  titulo: string;

  /** Se recorta y se limpia de caracteres de control antes de validar el largo. */
  @ApiProperty({
    description: 'Detalle de la indicación. Se recortan los extremos antes de validar.',
    example: 'Tome 1 comprimido de 500 mg cada 8 horas durante 3 días, después de las comidas.',
    minLength: 5,
    maxLength: 2000,
  })
  @Transform(limpiarTexto)
  @IsString({ message: 'Las indicaciones son obligatorias' })
  @MinLength(5, { message: 'Las indicaciones deben tener al menos 5 caracteres' })
  @MaxLength(2000, { message: 'Las indicaciones no pueden superar los 2000 caracteres' })
  descripcion: string;
}
