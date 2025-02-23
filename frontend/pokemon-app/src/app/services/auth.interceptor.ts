import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// El decorador @Injectable() indica que esta clase puede ser inyectada como servicio en Angular.
@Injectable()
export class Auth implements HttpInterceptor {
  // Implementamos la interfaz HttpInterceptor para modificar las peticiones HTTP.

  // Inyectamos el servicio de autenticación (AuthService) para obtener el token almacenado.
  constructor(private authService: AuthService) {}

  /**
   * Método intercept: se ejecuta automáticamente antes de que cualquier petición HTTP salga de la aplicación.
   * Su propósito es modificar la petición para agregar el token de autenticación si existe.
   *
   * req - La solicitud HTTP original (HttpRequest<any>).
   * next - El siguiente manejador en la cadena de interceptores (HttpHandler).
   * returns Observable<HttpEvent<any>> - La respuesta de la petición HTTP modificada o sin modificar.
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Intentamos obtener el token almacenado desde el servicio de autenticación.
    const token = this.authService.getToken();

    // Si existe un token, clonamos la solicitud para agregarle el encabezado de autorización.
    if (token) {
      console.log(token);
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`, // Agrega el token al header Authorization con el formato Bearer.
        },
      });

      // Pasamos la solicitud clonada con el token al siguiente manejador (next).
      return next.handle(clonedReq);
    }

    // Si no hay token, enviamos la petición original sin modificaciones.
    return next.handle(req);
  }
}
