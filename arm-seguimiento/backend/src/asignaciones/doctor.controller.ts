import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { CurrentUser, Roles } from '../auth/decorators.js';
import { UsuarioAutenticado } from '../auth/usuario-autenticado.js';
import { formatearRut } from '../common/rut.util.js';
import { Rol } from '../usuarios/rol.enum.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { DoctorPaciente } from './doctor-paciente.entity.js';
import { PacienteAsignadoDto } from './paciente-asignado.dto.js';

/** Rutas propias del doctor bajo `/api/doctor`. Todas exigen el rol DOCTOR. */
@ApiTags('Doctor')
@ApiBearerAuth()
@Controller('doctor')
@Roles(Rol.DOCTOR)
export class DoctorController {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  /**
   * Lista los pacientes asignados al doctor autenticado.
   *
   * @param doctor Doctor que hace la petición, tomado del token.
   * @returns Pacientes activos vinculados al doctor, ordenados por nombre.
   */
  @Get('pacientes')
  @ApiOperation({
    summary: 'Mis pacientes',
    description:
      'Devuelve solo los pacientes que el doctor autenticado tiene asignados en `doctor_paciente`. ' +
      'No existe una forma de pedir los pacientes de otro doctor.',
  })
  @ApiOkResponse({ type: PacienteAsignadoDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Sin sesión válida.' })
  @ApiForbiddenResponse({ description: 'El usuario no es doctor.' })
  async pacientes(@CurrentUser() doctor: UsuarioAutenticado): Promise<PacienteAsignadoDto[]> {
    const filas = await this.usuarios
      .createQueryBuilder('u')
      .innerJoin(DoctorPaciente, 'dp', 'dp.pacienteId = u.id')
      .where('dp.doctorId = :doctorId AND u.activo = 1', { doctorId: doctor.id })
      .orderBy('u.nombre', 'ASC')
      .getMany();
    return filas.map((p) => ({ id: p.id, nombre: p.nombre, rut: formatearRut(p.rut) }));
  }
}
