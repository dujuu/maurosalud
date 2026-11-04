/**
 * Utilidades para el RUT chileno. Usan el mismo algoritmo que el frontend (`core/rut.ts`),
 * de modo que el navegador y el servidor validan igual.
 */

/**
 * Quita puntos, guiones y espacios, y deja la K en mayúscula.
 *
 * @param valor RUT escrito por el usuario.
 * @returns Solo dígitos y, si corresponde, la K final.
 */
export function limpiarRut(valor: string): string {
  return valor.replace(/[.\-\s]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador con el algoritmo de módulo 11.
 * Los dígitos se multiplican de derecha a izquierda por 2, 3, 4, 5, 6, 7, 2, 3...
 *
 * @param cuerpo Parte numérica del RUT, sin dígito verificador.
 * @returns El dígito verificador: del 0 al 9 o `K`.
 */
export function calcularDv(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Valida un RUT y lo entrega normalizado.
 *
 * @param valor RUT con o sin puntos y guion.
 * @returns El RUT en la forma `12345678-5`, o `null` si el formato o el dígito verificador no son válidos.
 */
export function normalizarRut(valor: string): string | null {
  const limpio = limpiarRut(valor);
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return null;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (calcularDv(cuerpo) !== dv) return null;
  return `${Number(cuerpo)}-${dv}`;
}

/**
 * Da formato de presentación a un RUT ya normalizado.
 *
 * @param normalizado RUT en la forma `12345678-5`.
 * @returns El RUT con puntos, por ejemplo `12.345.678-5`.
 */
export function formatearRut(normalizado: string): string {
  const [cuerpo, dv] = normalizado.split('-');
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}
