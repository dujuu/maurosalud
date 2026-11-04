import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { TipoRecomendacion } from './tipo-recomendacion.enum.js';

/**
 * Tabla `recomendaciones`: una indicación que un doctor envía a uno de sus pacientes.
 *
 * Una recomendación no se edita ni se elimina en este avance. Está sin leer mientras `leidaAt` es
 * `null` y pasa a leída cuando el paciente la marca.
 */
@Entity({ name: 'recomendaciones' })
export class Recomendacion {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /** Doctor que la envió. */
  @Column({ name: 'doctor_id', type: 'int', unsigned: true })
  doctorId: number;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<Usuario>;

  /** Paciente destinatario. */
  @Column({ name: 'paciente_id', type: 'int', unsigned: true })
  pacienteId: number;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Relation<Usuario>;

  @Column({ type: 'enum', enum: TipoRecomendacion })
  tipo: TipoRecomendacion;

  /** Resumen corto de la indicación (hasta 150 caracteres). */
  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  /** Detalle de la indicación (hasta 2000 caracteres). */
  @Column({ type: 'text' })
  descripcion: string;

  /** Fecha y hora de envío, en UTC. */
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'UTC_TIMESTAMP(6)' })
  createdAt: Date;

  /** Fecha y hora, en UTC, en que el paciente la marcó como leída. Es `null` mientras no se lee. */
  @Column({ name: 'leida_at', type: 'datetime', precision: 6, nullable: true })
  leidaAt: Date | null;
}
