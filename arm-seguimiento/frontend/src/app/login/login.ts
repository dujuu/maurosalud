import { Component, inject, isDevMode, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/errores';
import { formatearRutEntrada, limpiarRut, normalizarRut } from '../core/rut';
import { Logo } from '../shared/logo';

/** Validador del RUT. Acepta el campo vacío (lo cubre `required`) y rechaza un dígito verificador incorrecto. */
const rutValido: ValidatorFn = (control) => {
  const valor = String(control.value ?? '');
  return !valor || normalizarRut(valor) ? null : { rut: true };
};

/**
 * Pantalla de inicio de sesión. Pide RUT y contraseña, valida el RUT antes de enviarlo y, si las credenciales
 * son correctas, lleva al usuario a la pantalla de su rol.
 */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    Logo,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** Servicio de sesión. */
  private readonly auth = inject(AuthService);
  /** Router, para ir a la pantalla del rol. */
  private readonly router = inject(Router);
  /** Constructor de formularios con campos que nunca son nulos. */
  private readonly fb = inject(NonNullableFormBuilder);

  /** Formulario de acceso. */
  protected readonly form = this.fb.group({
    rut: ['', [Validators.required, rutValido]],
    password: ['', [Validators.required]],
  });

  /** `true` mientras se espera la respuesta. Evita enviar dos veces con un doble clic. */
  protected readonly cargando = signal(false);
  /** Mensaje de error del último intento, o `null`. */
  protected readonly error = signal<string | null>(null);
  /** Si la contraseña se muestra en texto. */
  protected readonly verClave = signal(false);

  /** Solo en desarrollo (`ng serve`): atajos para la demostración. */
  protected readonly mostrarDemo = isDevMode();
  /** Cuentas de demostración que se ofrecen en el panel de desarrollo. */
  protected readonly cuentasDemo = [
    { nombre: 'Dr. Rodrigo Salas', detalle: 'Doctor de Medicina General', rut: '12.345.678-5' },
    { nombre: 'Dra. Paula Contreras', detalle: 'Doctora de Kinesiología', rut: '14.567.890-0' },
    { nombre: 'Ana Muñoz', detalle: 'Paciente del Dr. Salas', rut: '16.789.012-1' },
    { nombre: 'Carlos Pérez', detalle: 'Paciente de ambos doctores', rut: '18.234.567-9' },
    { nombre: 'Sofía Araya', detalle: 'Paciente de la Dra. Contreras', rut: '19.345.678-2' },
  ];

  /**
   * Da formato al RUT mientras se escribe sin mover el cursor de lugar: así se puede corregir
   * un dígito en el medio sin que lo siguiente que se escriba caiga al final.
   */
  protected alEscribirRut(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const cursor = input.selectionStart ?? input.value.length;
    const significativosAntes = limpiarRut(input.value.slice(0, cursor)).length;
    const formateado = formatearRutEntrada(input.value);
    if (formateado === input.value) return;

    this.form.controls.rut.setValue(formateado); // actualiza el campo y el formulario
    let posicion = 0;
    let vistos = 0;
    while (posicion < formateado.length && vistos < significativosAntes) {
      if (/[0-9K]/.test(formateado[posicion])) vistos++;
      posicion++;
    }
    input.setSelectionRange(posicion, posicion);
  }

  /**
   * Completa el formulario con una cuenta de demostración.
   *
   * @param rut RUT de la cuenta elegida.
   */
  protected usarCuenta(rut: string): void {
    this.form.patchValue({ rut, password: 'Vida2026' });
    this.error.set(null);
  }

  /**
   * Envía las credenciales. Si el formulario es inválido muestra los errores y no envía nada. Al ingresar
   * reemplaza `/login` en el historial, para que el botón Atrás no regrese a esta pantalla.
   */
  protected ingresar(): void {
    if (this.cargando()) return; // evita enviar dos veces con un doble clic o Enter repetido
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { rut, password } = this.form.getRawValue();
    this.cargando.set(true);
    this.auth.login(rut, password).subscribe({
      // replaceUrl: el login no queda en el historial, así "Atrás" no rebota.
      next: (usuario) =>
        void this.router.navigateByUrl(this.auth.rutaInicio(usuario.rol), { replaceUrl: true }),
      error: (err: unknown) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
