import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `doctor_paciente`, que indica qué pacientes atiende cada doctor.
 * Si se elimina un usuario, se eliminan sus asignaciones.
 */
export class CreateDoctorPaciente1793660000002 implements MigrationInterface {
  name = 'CreateDoctorPaciente1793660000002';

  /** Crea la tabla con clave primaria compuesta y claves foráneas a `usuarios`. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE doctor_paciente (
        doctor_id   INT UNSIGNED NOT NULL,
        paciente_id INT UNSIGNED NOT NULL,
        created_at  DATETIME(6)  NOT NULL DEFAULT (UTC_TIMESTAMP(6)),
        PRIMARY KEY (doctor_id, paciente_id),
        KEY idx_dp_paciente (paciente_id),
        CONSTRAINT fk_dp_doctor   FOREIGN KEY (doctor_id)   REFERENCES usuarios (id) ON DELETE CASCADE,
        CONSTRAINT fk_dp_paciente FOREIGN KEY (paciente_id) REFERENCES usuarios (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /** Elimina la tabla. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE doctor_paciente');
  }
}
