import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { DoctorPaciente } from './doctor-paciente.entity.js';
import { DoctorController } from './doctor.controller.js';

/** Módulo de asignaciones: el vínculo entre doctores y pacientes y las rutas del doctor. */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario, DoctorPaciente])],
  controllers: [DoctorController],
})
export class AsignacionesModule {}
