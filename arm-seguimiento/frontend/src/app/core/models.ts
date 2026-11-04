/** Rol de un usuario. Coincide con el enum `Rol` de la API. */
export type Rol = 'DOCTOR' | 'PACIENTE';

/** Tipo de recomendación. Coincide con el enum `TipoRecomendacion` de la API. */
export type TipoRecomendacion = 'MEDICAMENTO' | 'RUTINA' | 'HABITO_EVITAR' | 'OTRO';

/** Tipos de recomendación con el nombre en español que se muestra en pantalla. */
export const TIPOS: ReadonlyArray<{ valor: TipoRecomendacion; etiqueta: string }> = [
  { valor: 'MEDICAMENTO', etiqueta: 'Medicamento' },
  { valor: 'RUTINA', etiqueta: 'Rutina' },
  { valor: 'HABITO_EVITAR', etiqueta: 'Hábito a evitar' },
  { valor: 'OTRO', etiqueta: 'Otro' },
];

/** Ícono de Material Symbols de cada tipo. El tipo siempre se muestra también con texto. */
export const ICONO_TIPO: Record<TipoRecomendacion, string> = {
  MEDICAMENTO: 'medication',
  RUTINA: 'directions_walk',
  HABITO_EVITAR: 'block',
  OTRO: 'sticky_note_2',
};

/**
 * Nombre en español de un tipo de recomendación.
 *
 * @param tipo Valor del tipo, por ejemplo `HABITO_EVITAR`.
 * @returns Su etiqueta (`Hábito a evitar`), o el mismo valor si no se reconoce.
 */
export function etiquetaTipo(tipo: string): string {
  return TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}

/** Usuario que inició sesión, tal como lo entrega la API. */
export interface Usuario {
  id: number;
  nombre: string;
  /** RUT con puntos y guion, listo para mostrar. */
  rut: string;
  rol: Rol;
  /** Especialidad del doctor. Es `null` para los pacientes. */
  especialidad: string | null;
}

/** Respuesta de `POST /api/auth/login`. */
export interface LoginRespuesta {
  /** Token JWT para el encabezado `Authorization: Bearer`. */
  accessToken: string;
  usuario: Usuario;
}

/** Paciente de la lista del doctor (`GET /api/doctor/pacientes`). */
export interface PacienteAsignado {
  id: number;
  nombre: string;
  /** RUT con puntos y guion. */
  rut: string;
}

/** Cuerpo de `POST /api/recomendaciones`. El doctor lo identifica la API por el token. */
export interface NuevaRecomendacion {
  pacienteId: number;
  tipo: TipoRecomendacion;
  titulo: string;
  descripcion: string;
}

/** Recomendación vista por el doctor que la envió. */
export interface RecomendacionEmitida {
  id: number;
  tipo: TipoRecomendacion;
  titulo: string;
  descripcion: string;
  /** Fecha y hora de envío, en UTC (texto ISO 8601). */
  createdAt: string;
  /** Fecha y hora de lectura, en UTC. Es `null` mientras el paciente no la lee. */
  leidaAt: string | null;
  paciente: { id: number; nombre: string };
}

/** Recomendación vista por el paciente que la recibió. */
export interface RecomendacionRecibida {
  id: number;
  tipo: TipoRecomendacion;
  titulo: string;
  descripcion: string;
  /** Fecha y hora de envío, en UTC (texto ISO 8601). */
  createdAt: string;
  /** Fecha y hora de lectura, en UTC. Es `null` mientras no la lee. */
  leidaAt: string | null;
  doctor: { id: number; nombre: string; especialidad: string | null };
}
