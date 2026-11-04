import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `usuarios` (doctores y pacientes).
 * Las fechas se guardan en UTC (`UTC_TIMESTAMP`), igual que `timezone: 'Z'` del DataSource.
 */
export class CreateUsuarios1793660000001 implements MigrationInterface {
  name = 'CreateUsuarios1793660000001';

  /** Crea la tabla. El RUT es único y la contraseña se guarda solo como hash. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
        rut           VARCHAR(12)  NOT NULL,
        nombre        VARCHAR(120) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        rol           ENUM('DOCTOR','PACIENTE') NOT NULL,
        especialidad  VARCHAR(80)  NULL,
        activo        TINYINT(1)   NOT NULL DEFAULT 1,
        created_at    DATETIME(6)  NOT NULL DEFAULT (UTC_TIMESTAMP(6)),
        PRIMARY KEY (id),
        UNIQUE KEY uq_usuarios_rut (rut)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /** Elimina la tabla. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE usuarios');
  }
}
