import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { haceCuanto, iniciales } from '../core/fechas';
import { TIPOS } from '../core/models';
import { DoctorDatos } from './doctor-datos';

/** Lee una variable CSS del tema. Chart.js dibuja en un canvas y no entiende variables CSS. */
const colorTema = (variable: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

export interface FilaPaciente {
  /** Nombre del paciente. */
  nombre: string;
  /** Recomendaciones que ya leyó. */
  leidas: number;
  /** Recomendaciones que todavía no lee. */
  sinLeer: number;
}

/**
 * Resumen calculado con las recomendaciones que el doctor realmente envió: no hay cifras de ejemplo.
 * Responde dos preguntas: ¿se están leyendo mis indicaciones? y ¿quién tiene pendientes hace más tiempo?
 */
@Component({
  selector: 'app-resumen-doctor',
  imports: [BaseChartDirective, MatIconModule, MatProgressBarModule],
  providers: [
    provideCharts({ registerables: [BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend] }),
  ],
  templateUrl: './resumen-doctor.html',
  styleUrl: './resumen-doctor.css',
})
export class ResumenDoctor {
  /** Datos compartidos con la pestaña Pacientes. El resumen no hace peticiones propias. */
  protected readonly datos = inject(DoctorDatos);
  /** Iniciales del paciente, para el avatar. */
  protected readonly iniciales = iniciales;
  /** Tiempo transcurrido en palabras («hoy», «ayer», «hace 3 días»). */
  protected readonly haceCuanto = haceCuanto;

  /** Color de las recomendaciones leídas. */
  private readonly primario = colorTema('--mat-sys-primary');
  /** Color de las recomendaciones sin leer. */
  private readonly pendiente = colorTema('--mat-sys-secondary-container');
  /** Color de las líneas de la cuadrícula. */
  private readonly borde = colorTema('--mat-sys-outline-variant');
  /** Color del texto de los gráficos. */
  private readonly texto = colorTema('--mat-sys-on-surface-variant');

  /** Cantidad de recomendaciones enviadas. */
  protected readonly total = computed(() => this.datos.emitidas().length);
  /** Cantidad de recomendaciones leídas. */
  protected readonly leidas = computed(() => this.datos.emitidas().filter((r) => r.leidaAt).length);
  /** Cantidad de recomendaciones sin leer. */
  protected readonly sinLeer = computed(() => this.total() - this.leidas());

  /** Leídas y sin leer de cada paciente, del que más recibió al que menos. */
  protected readonly porPaciente = computed<FilaPaciente[]>(() => {
    const filas = new Map<number, FilaPaciente>();
    for (const r of this.datos.emitidas()) {
      const fila = filas.get(r.paciente.id) ?? { nombre: r.paciente.nombre, leidas: 0, sinLeer: 0 };
      if (r.leidaAt) fila.leidas++;
      else fila.sinLeer++;
      filas.set(r.paciente.id, fila);
    }
    return [...filas.values()].sort((a, b) => b.leidas + b.sinLeer - (a.leidas + a.sinLeer));
  });

  /** Cantidad de recomendaciones de cada tipo (incluye los tipos sin envíos). */
  protected readonly porTipo = computed(() =>
    TIPOS.map((t) => ({
      etiqueta: t.etiqueta,
      cantidad: this.datos.emitidas().filter((r) => r.tipo === t.valor).length,
    })),
  );

  /** Frase con los totales; los números van dentro de la oración, no como indicadores sueltos. */
  protected readonly frase = computed(() => {
    const total = this.total();
    if (total === 0) return '';
    const pacientes = this.porPaciente().length;
    const leidas = this.leidas();
    const sinLeer = this.sinLeer();
    const enviadas = `Ha enviado ${total} ${total === 1 ? 'recomendación' : 'recomendaciones'} a ${pacientes} ${pacientes === 1 ? 'paciente' : 'pacientes'}.`;
    const leidasTexto = leidas === 1 ? '1 fue leída' : `${leidas} fueron leídas`;
    const sinLeerTexto = sinLeer === 1 ? 'sigue 1 sin leer' : `siguen ${sinLeer} sin leer`;
    return sinLeer > 0 ? `${enviadas} ${leidasTexto} y ${sinLeerTexto}.` : `${enviadas} ${leidasTexto}.`;
  });

  /** Las que llevan más tiempo sin leerse, para saber a quién conviene volver a contactar. */
  protected readonly pendientes = computed(() =>
    this.datos
      .emitidas()
      .filter((r) => !r.leidaAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 8),
  );

  /** Datos del gráfico de lectura por paciente. */
  protected readonly datosPaciente = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.porPaciente().map((f) => f.nombre),
    datasets: [
      { label: 'Leídas', data: this.porPaciente().map((f) => f.leidas), backgroundColor: this.primario, borderRadius: 4 },
      {
        label: 'Sin leer',
        data: this.porPaciente().map((f) => f.sinLeer),
        backgroundColor: this.pendiente,
        borderColor: this.primario,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }));

  /** Datos del gráfico por tipo. */
  protected readonly datosTipo = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.porTipo().map((t) => t.etiqueta),
    datasets: [
      { label: 'Recomendaciones', data: this.porTipo().map((t) => t.cantidad), backgroundColor: this.primario, borderRadius: 4 },
    ],
  }));

  /** Opciones del gráfico de barras apiladas (leídas y sin leer). */
  protected readonly opcionesApiladas: ChartConfiguration<'bar'>['options'];
  /** Opciones del gráfico de barras simples (por tipo). */
  protected readonly opcionesSimples: ChartConfiguration<'bar'>['options'];

  /** Configura la tipografía y los colores de Chart.js, y arma las opciones de los dos gráficos. */
  constructor() {
    Chart.defaults.font.family = "'Atkinson Hyperlegible Next Variable', system-ui, sans-serif";
    Chart.defaults.font.size = 14;
    Chart.defaults.color = this.texto;

    const base = (apilado: boolean): ChartConfiguration<'bar'>['options'] => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: apilado, beginAtZero: true, ticks: { precision: 0 }, grid: { color: this.borde } },
        y: { stacked: apilado, grid: { display: false } },
      },
      plugins: { legend: { display: apilado, position: 'bottom', labels: { usePointStyle: true } } },
    });
    this.opcionesApiladas = base(true);
    this.opcionesSimples = base(false);
  }
}
