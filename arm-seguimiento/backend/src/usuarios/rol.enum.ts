/** Roles del sistema. Cada usuario tiene exactamente uno. */
export enum Rol {
  /** Profesional de salud: ve a sus pacientes y les envía recomendaciones. */
  DOCTOR = 'DOCTOR',
  /** Persona atendida: ve las recomendaciones que recibe y las marca como leídas. */
  PACIENTE = 'PACIENTE',
}
