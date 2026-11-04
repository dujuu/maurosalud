import { FormControl } from '@angular/forms';
import { textoMinimo } from './validadores';

describe('textoMinimo', () => {
  const valida = (valor: string | null, min = 3) => textoMinimo(min)(new FormControl(valor));

  it('acepta texto con el largo mínimo', () => expect(valida('abc')).toBeNull());
  it('rechaza texto más corto', () => expect(valida('ab')).not.toBeNull());
  it('un texto de solo espacios no cuenta', () => {
    expect(valida('     ')).not.toBeNull();
    expect(valida(' \t\n ')).not.toBeNull();
  });
  it('los espacios de los extremos no suman', () => expect(valida('  ab  ')).not.toBeNull());
  it('rechaza null', () => expect(valida(null)).not.toBeNull());
});
