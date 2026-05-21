import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

// Interfaz para la respuesta que armamos en Spring Boot
interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // En Angular 17 usamos 'inject' en lugar del constructor tradicional
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      // 'tap' nos permite ejecutar una acción secundaria sin alterar el flujo de datos
      tap(response => {
        if (response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // Aquí más adelante podríamos añadir lógica para validar si el token expiró
    return !!token; 
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('[AuthService] No hay token, rol nulo.');
      return null;
    }
    
    try {
      // Reemplazamos los caracteres Base64Url a Base64 estándar
      let payload = token.split('.')[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // Añadimos el padding de Base64 si falta
      const pad = payload.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        payload += new Array(5 - pad).join('=');
      }
      
      // Decodificamos el payload que contiene claims personalizados
      const decoded = JSON.parse(decodeURIComponent(window.atob(payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')));
      
      console.log('[AuthService] Token decodificado. Rol encontrado:', decoded.role);
      
      // Algunos backends agregan el prefijo ROLE_ (por convención de Spring Security)
      let finalRole = decoded.role || null;
      if (finalRole && finalRole.startsWith('ROLE_')) {
        finalRole = finalRole.substring(5);
      }
      
      return finalRole;
    } catch (e) {
      console.error('[AuthService] Error decodificando JWT:', e);
      return null;
    }
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      let payload = token.split('.')[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      const pad = payload.length % 4;
      if (pad) {
        if (pad === 1) {
          return null;
        }
        payload += new Array(5 - pad).join('=');
      }
      
      const decoded = JSON.parse(decodeURIComponent(window.atob(payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')));
      
      return decoded.sub || null;
    } catch (e) {
      console.error('[AuthService] Error decodificando JWT email:', e);
      return null;
    }
  }

  isAgentOrAdmin(): boolean {
    const role = this.getUserRole();
    console.log('[AuthService] Evaluando isAgentOrAdmin. Rol actual:', role);
    return role === 'AGENT' || role === 'ADMIN';
  }

  isAgent(): boolean {
    const role = this.getUserRole();
    console.log('[AuthService] Evaluando isAgent. Rol actual:', role);
    return role === 'AGENT';
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN';
  }

  isEmployee(): boolean {
    const role = this.getUserRole();
    console.log('[AuthService] Evaluando isEmployee. Rol actual:', role);
    return role === 'EMPLOYEE';
  }
}