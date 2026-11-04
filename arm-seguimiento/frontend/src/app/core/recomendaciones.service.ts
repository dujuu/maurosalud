import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  NuevaRecomendacion,
  PacienteAsignado,
  RecomendacionEmitida,
  RecomendacionRecibida,
} from './models';

/**
 * Llamadas HTTP a las rutas de pacientes y recomendaciones de la API. El token lo agrega el interceptor
 * (`authInterceptor`), por lo que aquí no se maneja la autenticación.
 */
@Injectable({ providedIn: 'root' })
export class RecomendacionesService {
  private readonly http = inject(HttpClient);

  // ---- Rutas del doctor ----

  /** Pacientes asignados al doctor con sesión (`GET /api/doctor/pacientes`). */
  pacientes() {
    return this.http.get<PacienteAsignado[]>('/api/doctor/pacientes');
  }

  /**
   * Envía una recomendación a un paciente del doctor (`POST /api/recomendaciones`).
   *
   * @param datos Paciente, tipo, título e indicaciones.
   * @returns La recomendación creada. La API responde 403 si el paciente no es del doctor.
   */
  crear(datos: NuevaRecomendacion) {
    return this.http.post<RecomendacionEmitida>('/api/recomendaciones', datos);
  }

  /** Recomendaciones que el doctor envió, con su estado de lectura (`GET /api/recomendaciones/emitidas`). */
  emitidas() {
    return this.http.get<RecomendacionEmitida[]>('/api/recomendaciones/emitidas');
  }

  // ---- Rutas del paciente ----

  /** Recomendaciones que el paciente recibió, de cualquiera de sus doctores (`GET /api/recomendaciones/mias`). */
  mias() {
    return this.http.get<RecomendacionRecibida[]>('/api/recomendaciones/mias');
  }

  /**
   * Marca una recomendación como leída (`PATCH /api/recomendaciones/:id/leida`).
   *
   * @param id Identificador de la recomendación. La API responde 404 si no es del paciente.
   * @returns La recomendación con su fecha de lectura. Repetir la llamada no cambia la fecha.
   */
  marcarLeida(id: number) {
    return this.http.patch<RecomendacionRecibida>(`/api/recomendaciones/${id}/leida`, {});
  }
}
