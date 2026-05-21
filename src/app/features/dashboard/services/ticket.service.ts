import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { PaginatedTicketResponse, Ticket } from '../../../../models/ticket.model';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = `${environment.apiUrl}/tickets`;

  // Estado persistente del filtro de estado para el Dashboard
  public selectedStatus: string = 'ALL';

  // Estadísticas globales del Dashboard (persistidas para evitar reseteos al navegar)
  public stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  };

  // --- Métodos de Consumo y Negocio ---

  createTicket(ticket: { title: string; description: string }): Observable<Ticket> {
    return this.http.post<Ticket>(this.API_URL, ticket);
  }

  getTickets(page: number = 0, size: number = 10, status?: string): Observable<PaginatedTicketResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedTicketResponse>(this.API_URL, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.API_URL}/${id}`);
  }

  updateTicketStatus(id: number, newStatus: string): Observable<Ticket> {
    // Agregamos status como parámetro de consulta (Query Param) 
    // en caso de que el backend de Spring Boot lo espere con @RequestParam
    const params = new HttpParams().set('status', newStatus);
    return this.http.patch<Ticket>(`${this.API_URL}/${id}/status`, { status: newStatus }, { params });
  }
}