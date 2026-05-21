import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// Importamos las herramientas HTTP
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Activamos el cliente HTTP globalmente e inyectamos nuestro interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};