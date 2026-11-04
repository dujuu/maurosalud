import { calcularDv, formatearRutEntrada, normalizarRut } from './rut';

describe('rut', () => {
  it('calcula el dígito verificador', () => {
    expect(calcularDv('12345678')).toBe('5');
    expect(calcularDv('14567890')).toBe('0');
  });

  it('valida y normaliza', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRut('123456785')).toBe('12345678-5');
    expect(normalizarRut('12.345.678-9')).toBeNull();
    expect(normalizarRut('')).toBeNull();
  });

  it('formatea mientras se escribe', () => {
    expect(formatearRutEntrada('1')).toBe('1');
    expect(formatearRutEntrada('123456785')).toBe('12.345.678-5');
    expect(formatearRutEntrada('12.345.678-5')).toBe('12.345.678-5');
    expect(formatearRutEntrada('abc12k')).toBe('12-K');
  });
});
