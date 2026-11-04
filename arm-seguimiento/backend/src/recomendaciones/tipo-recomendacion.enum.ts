/** Tipos de sugerencia posterior a la atención, según la sección 4 del Caso de Negocio. */
export enum TipoRecomendacion {
  /** Indicación sobre un medicamento: dosis, horario o duración. */
  MEDICAMENTO = 'MEDICAMENTO',
  /** Actividad o ejercicio que el paciente debe realizar. */
  RUTINA = 'RUTINA',
  /** Algo que el paciente debe evitar mientras dure el tratamiento. */
  HABITO_EVITAR = 'HABITO_EVITAR',
  /** Cualquier otra indicación. */
  OTRO = 'OTRO',
}
