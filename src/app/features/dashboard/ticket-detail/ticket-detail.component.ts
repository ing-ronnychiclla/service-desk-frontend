import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Ticket } from '../../../../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-detail.component.html'
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  public authService = inject(AuthService);
  private location = inject(Location); // Para el botón de "Volver"

  ticket: Ticket | null = null;
  isLoading: boolean = true;
  isUpdating: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    // Capturamos el parámetro 'id' de la URL (ej: /dashboard/ticket/5)
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicketDetails(Number(ticketId));
    }
  }

  loadTicketDetails(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información del ticket.';
        this.isLoading = false;
      }
    });
  }

  changeStatus(newStatus: string): void {
    if (!this.ticket) return;
    
    this.isUpdating = true;
    this.errorMessage = '';
    const currentTicketId = this.ticket.id;
    
    console.log(`[TicketDetail] Intentando cambiar estado del ticket #${currentTicketId} a: ${newStatus}`);
    
    this.ticketService.updateTicketStatus(currentTicketId, newStatus).subscribe({
      next: (updatedTicket) => {
        console.log('[TicketDetail] Respuesta del servidor exitosa:', updatedTicket);
        
        // Si el servidor nos devuelve el ticket actualizado correctamente
        if (updatedTicket && updatedTicket.id && updatedTicket.status) {
          this.ticket = updatedTicket;
          this.isUpdating = false;
          
          // Diagnóstico interactivo para el usuario:
          if (updatedTicket.status === 'IN_PROGRESS') {
            if (updatedTicket.assigneeEmail) {
              alert(`¡Éxito! El ticket ha sido tomado y asignado a: ${updatedTicket.assigneeEmail}`);
            } else {
              alert('Aviso del Servidor AWS:\nEl estado cambió a IN_PROGRESS, pero NO se asignó el ticket a tu cuenta.\n\nMotivo: El backend de AWS tiene una regla que impide que usuarios con rol EMPLOYEE se auto-asignen tickets. Verifica con qué usuario iniciaste sesión en el frontend.');
            }
          }
          
        } else {
          console.warn('[TicketDetail] El servidor no retornó un ticket válido. Recargando detalles...');
          // Si el cuerpo es nulo/vacío, volvemos a consultar el ticket al servidor de forma segura
          this.loadTicketDetails(currentTicketId);
          this.isUpdating = false;
        }
      },
      error: (err) => {
        console.error('[TicketDetail] Error al actualizar el estado del ticket:', err);
        
        // Extraemos detalles del error para mostrarlos en el alert
        let details = 'Error desconocido';
        if (err.error && typeof err.error === 'object' && err.error.message) {
          details = err.error.message;
        } else if (err.message) {
          details = err.message;
        } else {
          details = `Código HTTP ${err.status} (${err.statusText || 'Sin mensaje'})`;
        }
        
        alert(`Error al actualizar el estado en el servidor:\n${details}`);
        this.isUpdating = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'OPEN': 'text-indigo-700 border border-indigo-200 bg-indigo-100',
      'IN_PROGRESS': 'text-amber-700 border border-amber-200 bg-amber-100',
      'CLOSED': 'text-emerald-700 border border-emerald-200 bg-emerald-100'
    };
    return classes[status] || 'text-slate-600 border border-slate-200 bg-slate-100';
  }
}