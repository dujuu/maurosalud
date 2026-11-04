import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesModule } from './asignaciones/asignaciones.module.js';
import { AuthModule } from './auth/auth.module.js';
import { buildDataSourceOptions } from './database/database.config.js';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module.js';

/**
 * Módulo raíz de la API. Carga la configuración (`.env`), abre la conexión a la base de datos y
 * reúne los módulos funcionales: autenticación, asignaciones y recomendaciones.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildDataSourceOptions({
          DB_HOST: config.get('DB_HOST'),
          DB_PORT: config.get('DB_PORT'),
          DB_USER: config.get('DB_USER'),
          DB_PASS: config.get('DB_PASS'),
          DB_NAME: config.get('DB_NAME'),
        }),
    }),
    AuthModule,
    AsignacionesModule,
    RecomendacionesModule,
  ],
})
export class AppModule {}
