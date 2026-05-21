import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // IMPORTANTE: Importamos ReactiveFormsModule para que los formularios reactivos funcionen
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Inyección de dependencias moderna (Angular 17+)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definimos la estructura de nuestro formulario
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]]
  });

  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Si el formulario es inválido, detenemos la ejecución
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Extraemos los datos y llamamos al servicio
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          // Si el backend responde con el JWT, navegamos al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté activo en http://localhost:8080';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Credenciales incorrectas. Revisa usuario y contraseña.';
          } else {
            this.errorMessage = 'Error en el servidor. Intenta nuevamente más tarde.';
          }
          console.error('Error de login:', err);
        }
      });
  }

  // Getters para usar en el HTML de forma más limpia
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
}