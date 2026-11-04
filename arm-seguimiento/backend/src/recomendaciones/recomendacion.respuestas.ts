import { ApiProperty } from '@nestjs/swagger';
import { TipoRecomendacion } from './tipo-recomendacion.enum.js';

/** Referencia mínima a un paciente dentro de una recomendación emitida. */
export class PacienteReferenciaDto {
  @ApiProperty({ description: 'Identificador del paciente.', example: 3 })
  id: number;

  @ApiProperty({ description: 'Nombre del paciente.', example: 'Ana Muñoz' })
  nombre: string;
}

/** Referencia mínima a un doctor dentro de una recomendación recibida. */
export class DoctorReferenciaDto {
  @ApiProperty({ description: 'Identificador del doctor.', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del doctor.', example: 'Dr. Rodrigo Salas' })
  nombre: string;

  @ApiProperty({ description: 'Especialidad del doctor.', example: 'Medicina General', type: String, nullable: true })
  especialidad: string | null;
}

/** Campos comunes de una recomendación en las respuestas de la API. */
class RecomendacionBaseDto {
  @ApiProperty({ description: 'Identificador de la recomendación.', example: 12 })
  id: number;

  @ApiProperty({ enum: TipoRecomendacion, example: TipoRecomendacion.RUTINA })
  tipo: TipoRecomendacion;

  @ApiProperty({ description: 'Resumen corto de la indicación.', example: 'Caminata diaria' })
  titulo: string;

  @ApiProperty({ description: 'Detalle de la indicación.', example: 'Camine 30 minutos al día a ritmo suave.' })
  descripcion: string;

  @ApiProperty({ description: 'Fecha y hora de envío, en UTC (ISO 8601).', example: '2026-11-03T22:33:35.458Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora en que el paciente la leyó, en UTC. Es nula mientras no se lee.',
    example: '2026-11-03T23:07:10.102Z',
    type: Date,
    nullable: true,
  })
  leidaAt: Date | null;
}

/** Recomendación tal como la ve el doctor que la envió. Incluye al paciente destinatario. */
export class RecomendacionEmitidaDto extends RecomendacionBaseDto {
  @ApiProperty({ type: PacienteReferenciaDto, description: 'Paciente destinatario.' })
  paciente: PacienteReferenciaDto;
}

/** Recomendación tal como la ve el paciente que la recibió. Incluye al doctor que la envió. */
export class RecomendacionRecibidaDto extends RecomendacionBaseDto {
  @ApiProperty({ type: DoctorReferenciaDto, description: 'Doctor que la envió.' })
  doctor: DoctorReferenciaDto;
}
