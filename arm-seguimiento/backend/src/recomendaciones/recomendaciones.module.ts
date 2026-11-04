import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorPaciente } from '../asignaciones/doctor-paciente.entity.js';
import { Recomendacion } from './recomendacion.entity.js';
import { RecomendacionesController } from './recomendaciones.controller.js';
import { RecomendacionesService } from './recomendaciones.service.js';

/** Módulo de recomendaciones: envío del doctor, consulta de ambos lados y marca de lectura. */
@Module({
  imports: [TypeOrmModule.forFeature([Recomendacion, DoctorPaciente])],
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService],
})
export class RecomendacionesModule {}
