import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Arranca la aplicación con el componente raíz y la configuración global.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
