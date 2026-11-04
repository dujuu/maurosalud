/** "hoy", "ayer" o "hace N días", contando días de calendario en hora local. */
export function haceCuanto(iso: string, ahora: Date = new Date()): string {
  const fecha = new Date(iso);
  const dia = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dias = Math.round((dia(ahora) - dia(fecha)) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

/** Iniciales para el avatar: "Ana Muñoz" → "AM"; ignora títulos como Dr./Dra. */
export function iniciales(nombre: string): string {
  const partes = nombre
    .split(/\s+/)
    .filter((p) => p && !/^(dr|dra)\.?$/i.test(p));
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}
