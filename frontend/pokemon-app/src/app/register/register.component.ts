import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  // Propiedades para almacenar los datos ingresados en el formulario de registro
  fullName: string = '';
  email: string = '';
  password: string = '';
  message: string = ''; // Mensaje a mostrar

  constructor(private authService: AuthService, private router: Router) {}

  // Método para registrar un nuevo usuario
  onSubmit(): void {
    this.message = ''; // Limpiamos el mensaje antes de cada intento
    this.authService
      .register(this.fullName, this.email, this.password)
      .subscribe({
        next: (response) => {
          // Guarda el token de autenticación en el servicio
          this.authService.setToken(response.token);
          this.router.navigate(['/pokemon/all']); // Redirige a la página principal
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          // Diferenciar entre error de usuario existente y otros errores
          if (error.status === 400 && error.error === 'El usuario ya existe') {
            // Maneja el caso específico de usuario ya registrado
            this.message = 'El usuario ya existe';
          } else {
            // Para cualquier otro problema inesperado
            this.message =
              'Error registrando el usuario. Por favor, inténtalo más tarde.';
          }
        },
      });
  }
}
