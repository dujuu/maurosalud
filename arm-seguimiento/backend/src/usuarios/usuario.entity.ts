import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from './rol.enum.js';

/** Tabla `usuarios`: doctores y pacientes, distinguidos por el campo `rol`. */
@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /** RUT normalizado, sin puntos y con guion (`12345678-5`). Es único. */
  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  /**
   * Hash bcrypt de la contraseña. No se selecciona por defecto, para que no salga por error en una
   * consulta cualquiera; el inicio de sesión lo pide de forma explícita.
   */
  @Column({ name: 'password_hash', type: 'varchar', length: 100, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Rol })
  rol: Rol;

  /** Especialidad del doctor. Es `null` para los pacientes. */
  @Column({ type: 'varchar', length: 80, nullable: true })
  especialidad: string | null;

  /** Si es `false`, el usuario no puede ingresar ni usar un token anterior. */
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /** Fecha de creación, en UTC. */
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'UTC_TIMESTAMP(6)' })
  createdAt: Date;
}
