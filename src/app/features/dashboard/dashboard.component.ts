import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketService } from './services/ticket.service';
import { PaginatedTicketResponse, Ticket } from '../../../models/ticket.model';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private ticketService = inject(TicketService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ticketData: PaginatedTicketResponse | null = null;
  isLoading: boolean = true;
  
  // Estado del Modal
  showModal: boolean = false;
  isSaving: boolean = false;

  // Estadísticas globales calculated on load
  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  };
  
  // Formulario Reactivo
  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  // --- Métodos de Lógica ---

  loadTickets(): void {
    this.isLoading = true;
    this.ticketService.getTickets(0, 100).subscribe({
      next: (res) => { 
        this.ticketData = res; 
        this.isLoading = false; 
        this.calculateStats(res.content);
      },
      error: (err) => { 
        this.isLoading = false; 
        console.error('Error al cargar tickets:', err);
      }
    });
  }

  calculateStats(tickets: Ticket[]): void {
    this.stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length
    };
  }

  toggleModal(): void {
    this.showModal = !this.showModal;
    if (!this.showModal) this.ticketForm.reset(); // Limpia el formulario al cerrar
  }

  saveTicket(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.ticketService.createTicket(this.ticketForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.toggleModal();
        this.loadTickets(); // Recargamos la tabla para ver el nuevo ticket
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error al crear el ticket:', err);
        alert('Ocurrió un error al intentar crear el ticket.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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