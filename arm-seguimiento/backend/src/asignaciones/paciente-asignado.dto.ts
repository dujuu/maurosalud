import { ApiProperty } from '@nestjs/swagger';

/** Paciente asignado a un doctor, tal como lo ve el doctor en su lista. */
export class PacienteAsignadoDto {
  @ApiProperty({ description: 'Identificador del paciente.', example: 3 })
  id: number;

  @ApiProperty({ description: 'Nombre completo.', example: 'Ana Muñoz' })
  nombre: string;

  @ApiProperty({ description: 'RUT con puntos y guion.', example: '16.789.012-1' })
  rut: string;
}
