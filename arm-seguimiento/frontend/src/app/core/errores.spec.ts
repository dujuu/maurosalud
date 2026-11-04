import { HttpErrorResponse } from '@angular/common/http';
import { mensajeError } from './errores';

const http = (status: number, error: unknown = null) => new HttpErrorResponse({ status, error });

describe('mensajeError', () => {
  it('sin conexión o servidor caído (0, 502, 503, 504) explica qué hacer', () => {
    for (const s of [0, 502, 503, 504]) expect(mensajeError(http(s))).toContain('No se pudo conectar');
  });
  it('usa el mensaje del servidor en 400, 401, 403 y 404', () => {
    expect(mensajeError(http(400, { message: 'El título es obligatorio' }))).toBe('El título es obligatorio');
    expect(mensajeError(http(403, { message: 'Ese paciente no está asignado a usted' }))).toBe(
      'Ese paciente no está asignado a usted',
    );
  });
  it('une varios mensajes de validación', () => {
    expect(mensajeError(http(400, { message: ['Uno', 'Dos'] }))).toBe('Uno. Dos');
  });
  it('un error 500 no expone detalles', () => {
    expect(mensajeError(http(500, { message: 'stack interno' }))).toBe(
      'El servidor tuvo un problema. Intente nuevamente en unos minutos.',
    );
  });
  it('un error que no es HTTP da un mensaje genérico', () => {
    expect(mensajeError(new Error('x'))).toContain('error inesperado');
  });
});
