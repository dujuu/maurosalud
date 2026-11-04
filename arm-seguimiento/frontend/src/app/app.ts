import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación. Solo contiene el `router-outlet`: cada pantalla la carga el router
 * según la ruta (ver `app.routes.ts`).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
