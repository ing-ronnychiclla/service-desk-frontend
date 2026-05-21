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

  // Estadísticas globales persistidas en el servicio
  get stats(): { total: number; open: number; inProgress: number; closed: number } {
    return this.ticketService.stats;
  }
  set stats(value: { total: number; open: number; inProgress: number; closed: number }) {
    this.ticketService.stats = value;
  }
  
  // Estado del Filtro de Estado (persistido en el servicio)
  get selectedStatus(): string {
    return this.ticketService.selectedStatus;
  }
  set selectedStatus(status: string) {
    this.ticketService.selectedStatus = status;
  }

  // Formulario Reactivo
  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.loadTickets();
    this.loadStats();
  }

  // --- Métodos de Lógica ---

  loadStats(): void {
    // Si ya estamos cargando todos los tickets en la tabla, no es necesario hacer otra petición en segundo plano
    if (this.selectedStatus === 'ALL') {
      return;
    }

    this.ticketService.getTickets(0, 100).subscribe({
      next: (res) => {
        this.calculateStats(res.content);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas en segundo plano:', err);
      }
    });
  }

  loadTickets(): void {
    this.isLoading = true;
    const filterStatus = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;
    
    this.ticketService.getTickets(0, 100, filterStatus).subscribe({
      next: (res) => { 
        this.ticketData = res; 
        this.isLoading = false; 
        // Solo recalculamos las estadísticas si estamos cargando TODOS los tickets
        // para preservar los números globales en las tarjetas de estadísticas.
        if (this.selectedStatus === 'ALL') {
          this.calculateStats(res.content);
        }
      },
      error: (err) => { 
        this.isLoading = false; 
        console.error('Error al cargar tickets:', err);
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.loadTickets();
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
        this.selectedStatus = 'ALL'; // Resetear el filtro para ver el nuevo ticket
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