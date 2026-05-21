// src/app/core/models/ticket.model.ts

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  creatorEmail: string;
  assigneeEmail: string | null;
  createdAt: string;
}

// Interfaz para mapear la paginación que nos devuelve Spring Data JPA
export interface PaginatedTicketResponse {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Página actual
}