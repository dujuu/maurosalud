import { limpiarTexto } from './texto.util.js';

describe('limpiarTexto', () => {
  const f = (value: unknown) => limpiarTexto({ value });

  it('recorta los extremos', () => expect(f('  hola  ')).toBe('hola'));
  it('un texto de solo espacios, tabs o saltos queda vacío', () => expect(f(' \t\n  ')).toBe(''));
  it('quita caracteres de control pero conserva saltos de línea internos', () => {
    expect(f('a\u0000b\u0007c\nd')).toBe('abc\nd');
  });
  it('no toca emojis ni acentos', () => expect(f('Tomar 💊 áéíóú ñ')).toBe('Tomar 💊 áéíóú ñ'));
  it('deja pasar valores que no son string', () => {
    expect(f(5)).toBe(5);
    expect(f(null)).toBeNull();
  });
});
