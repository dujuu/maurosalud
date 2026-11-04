import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsCl from '@angular/common/locales/es-CL';
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

registerLocaleData(localeEsCl);

/**
 * Configuración global de la aplicación:
 * - router con las rutas de `app.routes.ts`;
 * - cliente HTTP con el interceptor que agrega el token y cierra la sesión ante un 401;
 * - idioma y formato de fechas de Chile (`es-CL`);
 * - íconos de Material Symbols y opciones por defecto de los campos de formulario y de los avisos.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    // Íconos: Material Symbols (autoalojados con fontsource) en lugar de la fuente de Google.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic', hideRequiredMarker: true } },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' },
    },
  ],
};
