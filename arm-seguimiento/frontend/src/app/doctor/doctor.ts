import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Encabezado } from '../shared/encabezado';
import { DoctorDatos } from './doctor-datos';
import { PacientesDoctor } from './pacientes-doctor';
import { ResumenDoctor } from './resumen-doctor';

/**
 * Panel del doctor. Reúne las pestañas Pacientes y Resumen, y provee un único `DoctorDatos` para que
 * ambas compartan los mismos datos sin pedirlos dos veces.
 */
@Component({
  selector: 'app-doctor',
  imports: [Encabezado, MatTabsModule, PacientesDoctor, ResumenDoctor],
  providers: [DoctorDatos],
  template: `
    <app-encabezado />
    <main class="contenedor">
      <mat-tab-group animationDuration="0ms" [preserveContent]="true" mat-stretch-tabs="false" mat-align-tabs="start">
        <mat-tab label="Pacientes">
          <ng-template matTabContent><app-pacientes-doctor /></ng-template>
        </mat-tab>
        <mat-tab label="Resumen">
          <ng-template matTabContent><app-resumen-doctor /></ng-template>
        </mat-tab>
      </mat-tab-group>
    </main>
  `,
  styles: `
    main {
      padding-top: 0.5rem;
    }
  `,
})
export class Doctor {}
