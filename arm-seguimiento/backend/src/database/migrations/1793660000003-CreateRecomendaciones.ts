import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla `recomendaciones`.
 * Un usuario con recomendaciones no se puede eliminar (`ON DELETE RESTRICT`), para no perder el registro.
 */
export class CreateRecomendaciones1793660000003 implements MigrationInterface {
  name = 'CreateRecomendaciones1793660000003';

  /** Crea la tabla y los índices por paciente y por doctor (ambos ordenados por fecha). */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE recomendaciones (
        id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        doctor_id   INT UNSIGNED NOT NULL,
        paciente_id INT UNSIGNED NOT NULL,
        tipo        ENUM('MEDICAMENTO','RUTINA','HABITO_EVITAR','OTRO') NOT NULL,
        titulo      VARCHAR(150) NOT NULL,
        descripcion TEXT         NOT NULL,
        created_at  DATETIME(6)  NOT NULL DEFAULT (UTC_TIMESTAMP(6)),
        leida_at    DATETIME(6)  NULL,
        PRIMARY KEY (id),
        KEY idx_reco_paciente (paciente_id, created_at),
        KEY idx_reco_doctor   (doctor_id, created_at),
        CONSTRAINT fk_reco_doctor   FOREIGN KEY (doctor_id)   REFERENCES usuarios (id) ON DELETE RESTRICT,
        CONSTRAINT fk_reco_paciente FOREIGN KEY (paciente_id) REFERENCES usuarios (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /** Elimina la tabla. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE recomendaciones');
  }
}
