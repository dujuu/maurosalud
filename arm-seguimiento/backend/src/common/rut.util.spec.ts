import { calcularDv, formatearRut, normalizarRut } from './rut.util.js';

describe('rut.util', () => {
  it('calcula el dígito verificador', () => {
    expect(calcularDv('12345678')).toBe('5');
    expect(calcularDv('14567890')).toBe('0');
    expect(calcularDv('18234567')).toBe('9');
  });

  it('normaliza con y sin puntos o guion', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRut('12345678-5')).toBe('12345678-5');
    expect(normalizarRut('123456785')).toBe('12345678-5');
    expect(normalizarRut(' 14.567.890-0 ')).toBe('14567890-0');
  });

  it('rechaza dígito verificador incorrecto o formato inválido', () => {
    expect(normalizarRut('12.345.678-9')).toBeNull();
    expect(normalizarRut('abc')).toBeNull();
    expect(normalizarRut('')).toBeNull();
  });

  it('formatea con puntos', () => {
    expect(formatearRut('12345678-5')).toBe('12.345.678-5');
    expect(formatearRut('7654321-6')).toBe('7.654.321-6');
  });
});
