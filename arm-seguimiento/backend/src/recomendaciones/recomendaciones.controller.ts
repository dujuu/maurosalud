import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../auth/decorators.js';
import { UsuarioAutenticado } from '../auth/usuario-autenticado.js';
import { Rol } from '../usuarios/rol.enum.js';
import { CrearRecomendacionDto } from './crear-recomendacion.dto.js';
import { RecomendacionEmitidaDto, RecomendacionRecibidaDto } from './recomendacion.respuestas.js';
import { RecomendacionesService } from './recomendaciones.service.js';

/** Rutas de las recomendaciones bajo `/api/recomendaciones`. */
@ApiTags('Recomendaciones')
@ApiBearerAuth()
@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly servicio: RecomendacionesService) {}

  /** Crea una recomendación. El doctor sale del token; nunca se acepta un `doctorId` del cliente. */
  @Post()
  @Roles(Rol.DOCTOR)
  @ApiOperation({
    summary: 'Enviar una recomendación',
    description:
      'Crea una recomendación del doctor autenticado para uno de sus pacientes asignados. ' +
      'Los textos se recortan y se limpian de caracteres de control antes de validarlos.',
  })
  @ApiCreatedResponse({ type: RecomendacionEmitidaDto, description: 'Recomendación creada, sin leer.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos: textos muy cortos o largos, tipo inexistente o campos no permitidos.' })
  @ApiUnauthorizedResponse({ description: 'Sin sesión válida.' })
  @ApiForbiddenResponse({ description: 'El usuario no es doctor, o el paciente no está asignado a él.' })
  crear(
    @CurrentUser() doctor: UsuarioAutenticado,
    @Body() dto: CrearRecomendacionDto,
  ): Promise<RecomendacionEmitidaDto> {
    return this.servicio.crear(doctor.id, dto);
  }

  /** Lista lo que el doctor envió, con el estado de lectura de cada recomendación. */
  @Get('emitidas')
  @Roles(Rol.DOCTOR)
  @ApiOperation({
    summary: 'Recomendaciones que envié',
    description: 'Devuelve las recomendaciones del doctor autenticado, de la más nueva a la más antigua.',
  })
  @ApiOkResponse({ type: RecomendacionEmitidaDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Sin sesión válida.' })
  @ApiForbiddenResponse({ description: 'El usuario no es doctor.' })
  emitidas(@CurrentUser() doctor: UsuarioAutenticado): Promise<RecomendacionEmitidaDto[]> {
    return this.servicio.emitidas(doctor.id);
  }

  /** Lista lo que el paciente recibió. El paciente sale del token: no hay forma de pedir lo de otra persona. */
  @Get('mias')
  @Roles(Rol.PACIENTE)
  @ApiOperation({
    summary: 'Recomendaciones que recibí',
    description: 'Devuelve las recomendaciones del paciente autenticado, de cualquiera de sus doctores, de la más nueva a la más antigua.',
  })
  @ApiOkResponse({ type: RecomendacionRecibidaDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Sin sesión válida.' })
  @ApiForbiddenResponse({ description: 'El usuario no es paciente.' })
  mias(@CurrentUser() paciente: UsuarioAutenticado): Promise<RecomendacionRecibidaDto[]> {
    return this.servicio.mias(paciente.id);
  }

  /** Marca una recomendación del paciente como leída. Repetir la solicitud no cambia la fecha. */
  @Patch(':id/leida')
  @Roles(Rol.PACIENTE)
  @ApiOperation({
    summary: 'Marcar como leída',
    description:
      'Registra la fecha y la hora de lectura. Si la recomendación ya estaba leída, conserva la fecha original. ' +
      'La marca no se puede deshacer.',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la recomendación.', example: 12 })
  @ApiOkResponse({ type: RecomendacionRecibidaDto })
  @ApiBadRequestResponse({ description: 'El identificador no es un número entero.' })
  @ApiUnauthorizedResponse({ description: 'Sin sesión válida.' })
  @ApiForbiddenResponse({ description: 'El usuario no es paciente.' })
  @ApiNotFoundResponse({ description: 'La recomendación no existe o es de otro paciente.' })
  marcarLeida(
    @CurrentUser() paciente: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecomendacionRecibidaDto> {
    return this.servicio.marcarLeida(paciente.id, id);
  }
}
