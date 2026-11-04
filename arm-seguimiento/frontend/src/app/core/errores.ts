import { HttpErrorResponse } from '@angular/common/http';

/** Convierte un error HTTP en un mensaje en español que dice qué pasó y qué hacer. */
export function mensajeError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado. Intente nuevamente.';

  // 0 = sin red; 502/503/504 = el servidor no responde (por ejemplo, está apagado o reiniciando).
  if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
    return 'No se pudo conectar con el servidor. Revise su conexión e intente de nuevo en unos minutos.';
  }

  const detalle = (err.error as { message?: string | string[] } | null)?.message;
  const texto = Array.isArray(detalle) ? detalle.join('. ') : detalle;

  switch (err.status) {
    case 400:
      return texto ?? 'Los datos ingresados no son válidos.';
    case 401:
      return texto ?? 'Debe iniciar sesión.';
    case 403:
      return texto ?? 'No tiene permisos para esta acción.';
    case 404:
      return texto ?? 'No se encontró lo solicitado.';
    default:
      return 'El servidor tuvo un problema. Intente nuevamente en unos minutos.';
  }
}
