import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../core/auth.service';
import { Logo } from './logo';

/** Barra superior con el nombre del centro, el usuario con sesión abierta y el botón para cerrar la sesión. */
@Component({
  selector: 'app-encabezado',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, Logo],
  template: `
    <mat-toolbar class="barra">
      <div class="contenedor interior">
        <div class="marca">
          <app-logo class="isotipo" [marca]="true" />
          <span class="nombre">Centro Médico <strong>Vida Norte</strong></span>
        </div>

        @if (usuario(); as u) {
          <div class="sesion">
            <div class="quien">
              <span class="persona">{{ u.nombre }}</span>
              <span class="detalle">{{ detalle() }}</span>
            </div>
            <button mat-stroked-button type="button" (click)="auth.logout()">
              <mat-icon>logout</mat-icon>
              <span class="texto-boton">Cerrar sesión</span>
            </button>
          </div>
        }
      </div>
    </mat-toolbar>
  `,
  styles: `
    .barra {
      --mat-toolbar-container-background-color: var(--mat-sys-surface-container-lowest);
      --mat-toolbar-container-text-color: var(--mat-sys-on-surface);
      height: auto;
      min-height: 64px;
      padding: 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .interior {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-block: 0.5rem;
    }
    .marca {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .isotipo {
      width: 36px;
    }
    .nombre {
      font: var(--mat-sys-title-medium);
      color: var(--vn-tinta);
    }
    .nombre strong {
      font-weight: 700;
    }
    .sesion {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .quien {
      display: flex;
      flex-direction: column;
      text-align: right;
      line-height: 1.25;
    }
    .persona {
      font: var(--mat-sys-title-small);
    }
    .detalle {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    @media (max-width: 599px) {
      .nombre {
        display: none;
      }
      .texto-boton {
        display: none;
      }
      .interior {
        gap: 0.5rem;
      }
    }
  `,
})
export class Encabezado {
  /** Servicio de sesión. */
  protected readonly auth = inject(AuthService);
  /** Usuario con sesión abierta. */
  protected readonly usuario = this.auth.usuario;
  /** Segunda línea bajo el nombre: la especialidad del doctor o «Paciente». */
  protected readonly detalle = computed(() => {
    const u = this.usuario();
    if (!u) return '';
    return u.rol === 'DOCTOR' ? (u.especialidad ?? 'Doctor') : 'Paciente';
  });
}
