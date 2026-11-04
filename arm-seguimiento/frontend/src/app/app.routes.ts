import { Routes } from '@angular/router';
import { loginGuard, rolGuard } from './core/guards';

/**
 * Rutas de la aplicación. Cada pantalla se carga solo cuando se visita (carga diferida).
 * - `/login` es pública, pero lleva a su pantalla a quien ya tiene sesión (`loginGuard`).
 * - `/doctor` y `/paciente` exigen el rol correspondiente, confirmado con el servidor (`rolGuard`).
 * - Cualquier otra dirección lleva a `/login`.
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    title: 'Iniciar sesión - Vida Norte',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'doctor',
    canActivate: [rolGuard('DOCTOR')],
    title: 'Panel del doctor - Vida Norte',
    loadComponent: () => import('./doctor/doctor').then((m) => m.Doctor),
  },
  {
    path: 'paciente',
    canActivate: [rolGuard('PACIENTE')],
    title: 'Mis recomendaciones - Vida Norte',
    loadComponent: () => import('./paciente/paciente').then((m) => m.Paciente),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
