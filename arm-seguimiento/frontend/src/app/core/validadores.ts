import type { ValidatorFn } from '@angular/forms';

/** Exige un largo mínimo ignorando los espacios de los extremos (un texto de solo espacios no vale). */
export const textoMinimo =
  (min: number): ValidatorFn =>
  (control) =>
    String(control.value ?? '').trim().length >= min ? null : { textoMinimo: { min } };
