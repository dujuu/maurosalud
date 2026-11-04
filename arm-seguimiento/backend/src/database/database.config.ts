import type { DataSourceOptions } from 'typeorm';
import { DoctorPaciente } from '../asignaciones/doctor-paciente.entity.js';
import { Recomendacion } from '../recomendaciones/recomendacion.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { CreateUsuarios1793660000001 } from './migrations/1793660000001-CreateUsuarios.js';
import { CreateDoctorPaciente1793660000002 } from './migrations/1793660000002-CreateDoctorPaciente.js';
import { CreateRecomendaciones1793660000003 } from './migrations/1793660000003-CreateRecomendaciones.js';

/**
 * Arma las opciones de conexión a la base de datos. Es la única fuente de esta configuración: la usan
 * la aplicación (NestJS) y el CLI de migraciones, por lo que ambos ven exactamente el mismo esquema.
 *
 * Decisiones que conviene conocer:
 * - `timezone: 'Z'` hace que las fechas se lean y se escriban en UTC.
 * - `synchronize: false` impide que TypeORM modifique las tablas; el esquema cambia solo con migraciones.
 * - Las entidades y las migraciones se listan una por una (sin patrones de archivos) para que funcione
 *   igual en módulos ESM.
 *
 * @param env Variables de entorno: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` y `DB_NAME`.
 * @returns Opciones para `DataSource` de TypeORM.
 */
export function buildDataSourceOptions(
  env: Record<string, string | undefined>,
): DataSourceOptions {
  return {
    type: 'mariadb',
    host: env.DB_HOST ?? '127.0.0.1',
    port: Number(env.DB_PORT ?? 3306),
    username: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z', // fechas siempre en UTC; el frontend las muestra en hora local
    entities: [Usuario, DoctorPaciente, Recomendacion],
    // Se listan explícitamente (sin glob) para que funcione igual en ESM.
    migrations: [
      CreateUsuarios1793660000001,
      CreateDoctorPaciente1793660000002,
      CreateRecomendaciones1793660000003,
    ],
    migrationsTableName: 'migrations',
    synchronize: false, // el esquema se gestiona solo con migraciones
  };
}
