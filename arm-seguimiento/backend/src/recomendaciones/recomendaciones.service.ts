import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorPaciente } from '../asignaciones/doctor-paciente.entity.js';
import type { CrearRecomendacionDto } from './crear-recomendacion.dto.js';
import { Recomendacion } from './recomendacion.entity.js';
import type { RecomendacionEmitidaDto, RecomendacionRecibidaDto } from './recomendacion.respuestas.js';

/** Lógica de negocio de las recomendaciones: crear, consultar y marcar como leídas. */
@Injectable()
export class RecomendacionesService {
  constructor(
    @InjectRepository(Recomendacion) private readonly recomendaciones: Repository<Recomendacion>,
    @InjectRepository(DoctorPaciente) private readonly asignaciones: Repository<DoctorPaciente>,
  ) {}

  /**
   * Crea una recomendación de un doctor para uno de sus pacientes.
   *
   * @param doctorId Doctor que la envía, tomado del token.
   * @param dto Datos validados de la recomendación.
   * @returns La recomendación creada, con el nombre del paciente.
   * @throws ForbiddenException Si el paciente no está asignado al doctor. El mensaje es el mismo
   *   cuando el paciente no existe, para no revelar qué identificadores existen.
   */
  async crear(doctorId: number, dto: CrearRecomendacionDto): Promise<RecomendacionEmitidaDto> {
    const asignado = await this.asignaciones.existsBy({ doctorId, pacienteId: dto.pacienteId });
    if (!asignado) throw new ForbiddenException('Ese paciente no está asignado a usted');

    const guardada = await this.recomendaciones.save(
      this.recomendaciones.create({
        doctorId,
        pacienteId: dto.pacienteId,
        tipo: dto.tipo,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        leidaAt: null,
      }),
    );
    const completa = await this.recomendaciones.findOneOrFail({
      where: { id: guardada.id },
      relations: { paciente: true },
    });
    return this.comoEmitida(completa);
  }

  /**
   * Lista las recomendaciones que envió un doctor.
   *
   * @param doctorId Doctor autenticado.
   * @returns Sus recomendaciones, de la más nueva a la más antigua, con el estado de lectura.
   */
  async emitidas(doctorId: number): Promise<RecomendacionEmitidaDto[]> {
    const filas = await this.recomendaciones.find({
      where: { doctorId },
      relations: { paciente: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return filas.map((r) => this.comoEmitida(r));
  }

  /**
   * Lista las recomendaciones que recibió un paciente, de cualquiera de sus doctores.
   *
   * @param pacienteId Paciente autenticado.
   * @returns Sus recomendaciones, de la más nueva a la más antigua, con los datos del doctor.
   */
  async mias(pacienteId: number): Promise<RecomendacionRecibidaDto[]> {
    const filas = await this.recomendaciones.find({
      where: { pacienteId },
      relations: { doctor: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return filas.map((r) => this.comoRecibida(r));
  }

  /**
   * Marca una recomendación como leída. Es idempotente: si ya estaba leída conserva la fecha original.
   *
   * @param pacienteId Paciente autenticado.
   * @param id Identificador de la recomendación.
   * @returns La recomendación con su fecha de lectura.
   * @throws NotFoundException Si no existe o es de otro paciente. Se responde igual en ambos casos
   *   para que no se pueda averiguar si el identificador existe.
   */
  async marcarLeida(pacienteId: number, id: number): Promise<RecomendacionRecibidaDto> {
    const reco = await this.recomendaciones.findOne({
      where: { id, pacienteId },
      relations: { doctor: true },
    });
    if (!reco) throw new NotFoundException('Recomendación no encontrada');

    if (!reco.leidaAt) {
      reco.leidaAt = new Date();
      await this.recomendaciones.update({ id, pacienteId }, { leidaAt: reco.leidaAt });
    }
    return this.comoRecibida(reco);
  }

  /** Convierte una fila (con el paciente cargado) a la vista que recibe el doctor. */
  private comoEmitida(r: Recomendacion): RecomendacionEmitidaDto {
    return {
      id: r.id,
      tipo: r.tipo,
      titulo: r.titulo,
      descripcion: r.descripcion,
      createdAt: r.createdAt,
      leidaAt: r.leidaAt,
      paciente: { id: r.paciente.id, nombre: r.paciente.nombre },
    };
  }

  /** Convierte una fila (con el doctor cargado) a la vista que recibe el paciente. */
  private comoRecibida(r: Recomendacion): RecomendacionRecibidaDto {
    return {
      id: r.id,
      tipo: r.tipo,
      titulo: r.titulo,
      descripcion: r.descripcion,
      createdAt: r.createdAt,
      leidaAt: r.leidaAt,
      doctor: { id: r.doctor.id, nombre: r.doctor.nombre, especialidad: r.doctor.especialidad },
    };
  }
}
