import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Si es una petición a los endpoints públicos de autenticación, no adjuntamos token
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si tenemos un token válido (y no es un string "null", "undefined" o demo), clonamos la petición y le inyectamos el Header
  if (token && token !== 'null' && token !== 'undefined' && token !== 'demo_jwt_token_corporate_service_desk' && token.trim() !== '') {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Mandamos la petición modificada al backend
    return next(clonedRequest);
  }

  // Si no hay token, la mandamos tal cual
  return next(req);
};