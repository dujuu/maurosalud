/** Deja solo dígitos y K (mayúscula). */
export function limpiarRut(valor: string): string {
  return valor.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Dígito verificador (módulo 11). */
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

/** RUT normalizado (`12345678-5`) o `null` si no es válido. */
export function normalizarRut(valor: string): string | null {
  const limpio = limpiarRut(valor);
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return null;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return calcularDv(cuerpo) === dv ? `${Number(cuerpo)}-${dv}` : null;
}

/** Da formato mientras se escribe: `123456785` → `12.345.678-5`. */
export function formatearRutEntrada(valor: string): string {
  const limpio = limpiarRut(valor).slice(0, 9);
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}
