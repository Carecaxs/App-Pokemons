import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaz for the object response of the login
export interface AuthResponse {
  message: string;
  token: string;
  userId: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5054/api/Auth';

  constructor(private http: HttpClient) {}

  // Method to log in, receives email and password and returns an observable
  login(email: string, password: string): Observable<AuthResponse> {
    const body = { email, password };

    return new Observable((observer) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).subscribe({
        next: (response) => {
          this.setUserId(response.userId);
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // Method to register user:
  // If the user already exists, the API will return a 400 with the message “User already exists”.
  // If successful, it returns the token and the user's data.
  register(
    fullName: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    const body = {
      fullName: fullName,
      email: email,
      passwordd: password,
    };

    return new Observable((observer) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).subscribe({
        next: (response) => {
          this.setToken(response.token);
          this.setUserId(response.userId); // ✅ Guardamos el ID del usuario
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // store the token in localStorage
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Checks if there is a token stored (logged in user)
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // log out method. Clean local storage
  logout() {
    localStorage.removeItem('token');
  }

  // Guardar el ID del usuario en localStorage
  setUserId(userId: number) {
    localStorage.setItem('userId', userId.toString());
  }

  // Obtener el ID del usuario desde localStorage
  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }
}
