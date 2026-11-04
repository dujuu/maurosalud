import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, interval } from 'rxjs';
import { mensajeError } from '../core/errores';
import type { PacienteAsignado, RecomendacionEmitida } from '../core/models';
import { RecomendacionesService } from '../core/recomendaciones.service';

/** Cada cuánto se refresca para ver cuándo el paciente marca una recomendación como leída. */
const REFRESCO_MS = 20_000;

/** Datos del doctor compartidos por sus pestañas (pacientes y recomendaciones enviadas). */
@Injectable()
export class DoctorDatos {
  /** Servicio HTTP de pacientes y recomendaciones. */
  private readonly api = inject(RecomendacionesService);

  /** Pacientes asignados al doctor. */
  readonly pacientes = signal<PacienteAsignado[]>([]);
  /** Recomendaciones que el doctor envió, de la más nueva a la más antigua. */
  readonly emitidas = signal<RecomendacionEmitida[]>([]);
  /** `true` mientras se hace la primera carga o una recarga manual. */
  readonly cargando = signal(true);
  /** Mensaje del último error de carga, o `null`. */
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
    interval(REFRESCO_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cargar(true));
  }

  /**
   * Pide pacientes y recomendaciones al mismo tiempo y reemplaza lo que hay en memoria.
   *
   * @param silencioso Si es `true` (las actualizaciones automáticas), no muestra el indicador de carga ni
   *   el error: ante una falla se conserva lo que ya estaba en pantalla.
   */
  cargar(silencioso = false): void {
    if (!silencioso) this.cargando.set(true);
    forkJoin({ pacientes: this.api.pacientes(), emitidas: this.api.emitidas() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ pacientes, emitidas }) => {
          this.pacientes.set(pacientes);
          this.emitidas.set(emitidas);
          this.error.set(null);
        },
        error: (err: unknown) => {
          if (!silencioso) this.error.set(mensajeError(err));
        },
      });
  }

  /** Suma una recomendación recién enviada sin esperar al próximo refresco. */
  agregar(recomendacion: RecomendacionEmitida): void {
    this.emitidas.update((lista) => [recomendacion, ...lista]);
  }
}
