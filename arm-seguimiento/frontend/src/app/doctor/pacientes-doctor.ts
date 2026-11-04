import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import {
  FormGroupDirective,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { mensajeError } from '../core/errores';
import { iniciales } from '../core/fechas';
import { etiquetaTipo, ICONO_TIPO, TIPOS, type TipoRecomendacion } from '../core/models';
import { RecomendacionesService } from '../core/recomendaciones.service';
import { textoMinimo } from '../core/validadores';
import { DoctorDatos } from './doctor-datos';

/**
 * Pestaña Pacientes del doctor. Organiza el trabajo por paciente: a la izquierda la lista de sus pacientes
 * asignados y a la derecha el hilo del paciente elegido, con el formulario para escribirle una recomendación.
 *
 * En celular se muestra primero solo la lista y, al elegir un paciente, su hilo a pantalla completa.
 */
@Component({
  selector: 'app-pacientes-doctor',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    TextFieldModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './pacientes-doctor.html',
  styleUrl: './pacientes-doctor.css',
})
export class PacientesDoctor {
  /** Datos compartidos con la pestaña Resumen. */
  protected readonly datos = inject(DoctorDatos);
  /** Servicio HTTP de recomendaciones. */
  private readonly api = inject(RecomendacionesService);
  /** Constructor de formularios con campos que nunca son nulos. */
  private readonly fb = inject(NonNullableFormBuilder);
  /** Avisos breves, por ejemplo «Recomendación enviada». */
  private readonly snack = inject(MatSnackBar);
  /** Directiva del formulario. Permite reiniciarlo sin que los campos aparezcan como errores. */
  private readonly formDir = viewChild(FormGroupDirective);

  /** Tipos de recomendación del selector. */
  protected readonly tipos = TIPOS;
  /** Nombre en español de cada tipo. */
  protected readonly etiquetaTipo = etiquetaTipo;
  /** Ícono de Material Symbols de cada tipo. */
  protected readonly icono = (tipo: TipoRecomendacion) => ICONO_TIPO[tipo];
  /** Iniciales del paciente, para el avatar. */
  protected readonly iniciales = iniciales;

  /** Identificador del paciente abierto, o `null` si no hay ninguno. */
  protected readonly activoId = signal<number | null>(null);
  /** `true` mientras hay un envío en curso. Mientras tanto se ignoran los clics repetidos. */
  protected readonly enviando = signal(false);
  /** Mensaje de error del último envío fallido. */
  protected readonly errorForm = signal<string | null>(null);

  /** Paciente abierto, o `null`. */
  protected readonly activo = computed(
    () => this.datos.pacientes().find((p) => p.id === this.activoId()) ?? null,
  );
  /** Recomendaciones enviadas al paciente abierto. Se arma en el navegador, sin pedir nada al servidor. */
  protected readonly hilo = computed(() =>
    this.datos.emitidas().filter((r) => r.paciente.id === this.activoId()),
  );
  /** Recomendaciones sin leer por paciente, para avisar en la lista. */
  protected readonly sinLeer = computed(() => {
    const cuenta = new Map<number, number>();
    for (const r of this.datos.emitidas()) {
      if (!r.leidaAt) cuenta.set(r.paciente.id, (cuenta.get(r.paciente.id) ?? 0) + 1);
    }
    return cuenta;
  });

  /** Formulario de la nueva recomendación. El título y las indicaciones se validan sin contar los espacios de los extremos. */
  protected readonly form = this.fb.group({
    tipo: ['MEDICAMENTO' as TipoRecomendacion],
    titulo: ['', [Validators.required, textoMinimo(3), Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, textoMinimo(5), Validators.maxLength(2000)]],
  });

  /** En pantallas anchas abre automáticamente el primer paciente de la lista. */
  constructor() {
    // En pantallas anchas se abre el primer paciente; en celular se parte desde la lista.
    effect(() => {
      const lista = this.datos.pacientes();
      untracked(() => {
        if (this.activoId() === null && lista.length > 0 && window.matchMedia('(min-width: 840px)').matches) {
          this.activoId.set(lista[0].id);
        }
      });
    });
  }

  /**
   * Abre el hilo de un paciente. Borra el borrador del formulario para que un texto escrito para una
   * persona no se envíe a otra por error.
   *
   * @param id Identificador del paciente.
   */
  protected seleccionar(id: number): void {
    if (id === this.activoId()) return;
    this.activoId.set(id);
    this.errorForm.set(null);
    // Un borrador escrito para un paciente no debe poder enviarse a otro por error.
    this.formDir()?.resetForm({ tipo: 'MEDICAMENTO', titulo: '', descripcion: '' });
  }

  /**
   * Envía la recomendación al paciente abierto. Valida primero; si todo está bien la agrega al hilo,
   * limpia el formulario y avisa. Si falla, muestra el error y conserva el borrador.
   */
  protected enviar(): void {
    if (this.enviando()) return; // evita duplicados por doble clic
    const paciente = this.activo();
    if (!paciente) return;
    this.errorForm.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.api
      .crear({
        pacienteId: paciente.id,
        tipo: valores.tipo,
        titulo: valores.titulo.trim(),
        descripcion: valores.descripcion.trim(),
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (creada) => {
          this.datos.agregar(creada);
          this.formDir()?.resetForm({ tipo: valores.tipo, titulo: '', descripcion: '' });
          this.snack.open(`Recomendación enviada a ${paciente.nombre}`, 'Cerrar');
        },
        error: (err: unknown) => this.errorForm.set(mensajeError(err)),
      });
  }
}
