import { Injectable } from '@angular/core';
import {
  CanActivate, // Interfaz que define el guardia de ruta
  ActivatedRouteSnapshot, // Representa información sobre la ruta activa en ese momento
  RouterStateSnapshot, // Representa el estado del enrutamiento en un momento dado
  Router, // Permite redirigir al usuario a otra ruta
} from '@angular/router';
import { AuthService } from './auth.service'; // Importamos el servicio de autenticación para verificar si el usuario está logueado

// El decorador @Injectable indica que este servicio puede ser inyectado en otros componentes o servicios
@Injectable({
  providedIn: 'root', // Hace que este servicio esté disponible en toda la aplicación sin necesidad de declararlo en providers
})
export class AuthGuard implements CanActivate {
  // Implementamos CanActivate para definir reglas de acceso a rutas protegidas

  constructor(
    private authService: AuthService, // Inyectamos AuthService para verificar si el usuario está autenticado
    private router: Router // Inyectamos Router para hacer redirecciones si es necesario
  ) {}

  /**
   * Método que determina si el usuario puede acceder a una ruta protegida.
   * @param route - Información de la ruta actual
   * @param state - Estado del enrutador en el momento de la verificación
   * @returns `true` si el usuario está autenticado, `false` si no lo está (lo redirige a login)
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Si el usuario NO está logueado, lo redirige a la página de login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['']); // Redirige a la ruta de login
      return false; // Bloquea el acceso a la ruta solicitada
    }
    // Si está autenticado, permite el acceso a la ruta
    return true;
  }
}
