import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './database.config.js';

// Carga el archivo `.env` de la carpeta actual; si no existe, se usan las variables del entorno.
try {
  process.loadEnvFile();
} catch {
  // sin archivo .env
}

/**
 * Conexión a la base de datos para el CLI de TypeORM (`migration:run`, `migration:revert` y
 * `migration:show`) y para el seed. La aplicación NestJS arma la suya en `AppModule`, con las
 * mismas opciones (`buildDataSourceOptions`).
 */
export default new DataSource(buildDataSourceOptions(process.env));
