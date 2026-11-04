/**
 * Limpia un texto antes de validarlo. Se usa con `@Transform` de class-transformer.
 *
 * Quita los caracteres de control (se conservan el tabulador y los saltos de línea) y recorta los
 * extremos. Así un texto formado solo por espacios queda vacío y la validación de largo mínimo lo rechaza.
 *
 * @param entrada Objeto de class-transformer; solo se usa `value`.
 * @returns El texto limpio, o el mismo valor si no es un texto.
 */
export function limpiarTexto({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}
