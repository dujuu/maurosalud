import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * Tabla `doctor_paciente`: qué pacientes atiende cada doctor.
 *
 * Un doctor solo ve y solo escribe a los pacientes que tiene asignados. Un paciente puede tener
 * varios doctores, por ejemplo de distintas especialidades. La clave primaria es compuesta.
 */
@Entity({ name: 'doctor_paciente' })
export class DoctorPaciente {
  @PrimaryColumn({ name: 'doctor_id', type: 'int', unsigned: true })
  doctorId: number;

  @PrimaryColumn({ name: 'paciente_id', type: 'int', unsigned: true })
  pacienteId: number;

  /** Fecha de la asignación, en UTC. */
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'UTC_TIMESTAMP(6)' })
  createdAt: Date;
}
