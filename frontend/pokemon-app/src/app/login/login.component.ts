import { Component } from '@angular/core';
import { AuthResponse, AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Propiedades para almacenar los datos ingresados en el formulario de login
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Método para iniciar sesión en la aplicación
  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response: AuthResponse) => {
        // Guarda el token y redirige a la página principal
        this.authService.setToken(response.token);
        this.router.navigate(['pokemon/all']);
      },
      error: (err) => {
        if (err.status === 401) {
          // El backend retorna 401 con { message: "Credenciales incorrectas" }
          this.message = err.error?.message || 'Credenciales incorrectas';
        } else if (err.status === 0) {
          // Error de conexión (la API no responde)
          alert(
            'No se pudo conectar con el servidor. Vuelva a intentar mas tarde.'
          );
        } else {
          // Otros errores (500, etc.)
          alert(
            err.error?.message ||
              'Ocurrió un error al iniciar sesión. Inténtalo más tarde.'
          );
        }
      },
    });
  }
}
