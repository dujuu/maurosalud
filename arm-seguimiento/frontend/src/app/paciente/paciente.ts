import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, interval } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/errores';
import { etiquetaTipo, ICONO_TIPO, type RecomendacionRecibida, type TipoRecomendacion } from '../core/models';
import { RecomendacionesService } from '../core/recomendaciones.service';
import { Encabezado } from '../shared/encabezado';

/** Refresco para que aparezcan solas las recomendaciones nuevas del doctor. */
const REFRESCO_MS = 20_000;

/**
 * Pantalla del paciente. Muestra las recomendaciones que recibió, con las no leídas primero, y permite marcarlas
 * como leídas. Se actualiza sola cada 20 segundos para mostrar las nuevas.
 */
@Component({
  selector: 'app-paciente',
  imports: [Encabezado, DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './paciente.html',
  styleUrl: './paciente.css',
})
export class Paciente {
  /** Servicio HTTP de recomendaciones. */
  private readonly api = inject(RecomendacionesService);
  /** Avisos breves, por ejemplo «Marcada como leída». */
  private readonly snack = inject(MatSnackBar);
  /** Usuario con sesión abierta. */
  protected readonly usuario = inject(AuthService).usuario;
  /** Nombre en español de cada tipo. */
  protected readonly etiquetaTipo = etiquetaTipo;
  /** Ícono de Material Symbols de cada tipo. */
  protected readonly icono = (tipo: TipoRecomendacion) => ICONO_TIPO[tipo];

  /** Recomendaciones recibidas, tal como las entrega la API. */
  protected readonly items = signal<RecomendacionRecibida[]>([]);
  /** `true` durante la primera carga o una recarga manual. */
  protected readonly cargando = signal(true);
  /** Mensaje del último error, o `null`. */
  protected readonly error = signal<string | null>(null);
  /** Identificador de la recomendación que se está marcando, o `null`. Evita peticiones repetidas. */
  protected readonly marcando = signal<number | null>(null);

  /** Cantidad de recomendaciones sin leer. */
  protected readonly noLeidas = computed(() => this.items().filter((r) => !r.leidaAt).length);

  /** Frase que resume la situación del paciente («Tiene 2 recomendaciones sin leer»). */
  protected readonly estadoGeneral = computed(() => {
    if (this.items().length === 0) return '';
    const n = this.noLeidas();
    if (n === 0) return 'Está al día: no tiene recomendaciones sin leer.';
    return n === 1 ? 'Tiene 1 recomendación sin leer.' : `Tiene ${n} recomendaciones sin leer.`;
  });

  /** Primero las sin leer; dentro de cada grupo, de más nueva a más antigua. */
  protected readonly ordenadas = computed(() =>
    [...this.items()].sort(
      (a, b) =>
        Number(!!a.leidaAt) - Number(!!b.leidaAt) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  /** Carga las recomendaciones y programa la actualización automática. */
  constructor() {
    this.cargar();
    interval(REFRESCO_MS)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.cargar(true));
  }

  /**
   * Pide las recomendaciones a la API.
   *
   * @param silencioso Si es `true` (actualización automática), no muestra el indicador de carga ni el error.
   */
  protected cargar(silencioso = false): void {
    if (!silencioso) this.cargando.set(true);
    this.api
      .mias()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => {
          this.items.set(lista);
          this.error.set(null);
        },
        error: (err: unknown) => {
          if (!silencioso) this.error.set(mensajeError(err));
        },
      });
  }

  /**
   * Marca una recomendación como leída. Ignora los clics repetidos sobre la misma recomendación mientras
   * la solicitud está en curso.
   *
   * @param r Recomendación que el paciente leyó.
   */
  protected marcarLeida(r: RecomendacionRecibida): void {
    if (this.marcando() === r.id) return; // evita peticiones repetidas por varios clics
    this.marcando.set(r.id);
    this.error.set(null);
    this.api
      .marcarLeida(r.id)
      .pipe(finalize(() => this.marcando.set(null)))
      .subscribe({
        next: (actualizada) => {
          this.items.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
          this.snack.open('Marcada como leída', 'Cerrar');
        },
        error: (err: unknown) => this.error.set(mensajeError(err)),
      });
  }
}
