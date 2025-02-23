// Importamos TestBed para configurar el entorno de pruebas en Angular.
import { TestBed } from '@angular/core/testing';

// Importamos HttpClientTestingModule y HttpTestingController para simular y controlar las peticiones HTTP.
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

// Importamos el servicio que queremos testear y la interfaz que define la respuesta esperada.
import { AuthService, AuthResponse } from './auth.service';

describe('AuthService', () => {
  // Declaramos variables que almacenarán la instancia del servicio y del controlador de pruebas HTTP.
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Constante con la URL base de la API de autenticación, usada para validar las solicitudes.
  const apiUrl = 'http://localhost:5054/api/Auth';

  // beforeEach se ejecuta antes de cada test para configurar el entorno.
  beforeEach(() => {
    TestBed.configureTestingModule({
      // Importamos el módulo que simula HttpClient para evitar llamadas reales.
      imports: [HttpClientTestingModule],
      // Proveemos el AuthService para que se pueda inyectar en las pruebas.
      providers: [AuthService],
    });
    // Inyectamos la instancia del servicio.
    service = TestBed.inject(AuthService);
    // Inyectamos el controlador para manejar y verificar las peticiones HTTP simuladas.
    httpMock = TestBed.inject(HttpTestingController);
    // Limpiamos el localStorage para iniciar con un entorno limpio en cada prueba.
    localStorage.clear();
  });

  // afterEach se ejecuta después de cada test.
  afterEach(() => {
    // Verifica que no queden peticiones HTTP pendientes.
    httpMock.verify();
    // Limpia el localStorage nuevamente para evitar efectos secundarios en otras pruebas.
    localStorage.clear();
  });

  // Prueba básica para asegurarse de que el servicio se crea correctamente.
  it('should be created', () => {
    expect(service).toBeTruthy(); // Se espera que la instancia del servicio exista (no sea null ni undefined).
  });

  // Prueba para el método login
  it('should login and return an AuthResponse', (done: DoneFn) => {
    // Datos de prueba para el login
    const email = 'test@example.com';
    const password = 'password';
    // Creamos un objeto simulado que cumple con la interfaz AuthResponse.
    const mockResponse: AuthResponse = {
      message: 'Inicio de sesión exitoso',
      token: 'abc123',
      userId: 1,
      email: email,
    };

    // Llamamos al método login y nos suscribimos al observable que retorna.
    service.login(email, password).subscribe((response) => {
      // Comprobamos que el token, el userId y el email retornados sean los esperados.
      expect(response.token).toEqual('abc123');
      expect(response.userId).toBe(1);
      expect(response.email).toEqual(email);
      // Llamamos a done() para indicar que la prueba asíncrona ha finalizado.
      done();
    });

    // httpMock.expectOne intercepta la solicitud HTTP esperada.
    const req = httpMock.expectOne(`${apiUrl}/login`);
    // Verificamos que la solicitud sea de tipo POST.
    expect(req.request.method).toBe('POST');
    // Verificamos que el cuerpo de la solicitud sea el objeto esperado.
    expect(req.request.body).toEqual({ email, password });
    // Simulamos la respuesta del servidor enviando el objeto mockResponse.
    req.flush(mockResponse);
  });

  // Prueba para el método register
  it('should register and return an AuthResponse', (done: DoneFn) => {
    // Datos de prueba para el registro.
    const fullName = 'Test User';
    const email = 'new@example.com';
    const password = 'password';
    // Creamos una respuesta simulada para el registro.
    const mockResponse: AuthResponse = {
      message: 'Registro exitoso',
      token: 'xyz789',
      userId: 2,
      email: email,
    };

    // Llamamos al método register y nos suscribimos a la respuesta.
    service.register(fullName, email, password).subscribe((response) => {
      // Verificamos que el token, userId y email retornados sean correctos.
      expect(response.token).toEqual('xyz789');
      expect(response.userId).toBe(2);
      expect(response.email).toEqual(email);
      done();
    });

    // Se espera que se realice una solicitud a la URL de registro.
    const req = httpMock.expectOne(`${apiUrl}/register`);
    // Se verifica que el método HTTP sea POST.
    expect(req.request.method).toBe('POST');
    // El cuerpo de la solicitud debe coincidir con lo que se envía (nota que la propiedad de la contraseña es 'passwordd').
    expect(req.request.body).toEqual({ fullName, email, passwordd: password });
    // Simulamos la respuesta con el objeto mockResponse.
    req.flush(mockResponse);
  });

  // Prueba para verificar que se almacena y recupera el token en localStorage.
  it('should store and retrieve token from localStorage', () => {
    const token = 'token123';
    // Llamamos a setToken para guardar el token en localStorage.
    service.setToken(token);
    // Verificamos que getToken retorne el token almacenado.
    expect(service.getToken()).toEqual(token);
    // isLoggedIn debería devolver true, ya que existe un token almacenado.
    expect(service.isLoggedIn()).toBeTrue();
  });

  // Prueba para verificar que el método logout elimina el token.
  it('should remove token on logout', () => {
    // Simulamos que ya hay un token almacenado en localStorage.
    localStorage.setItem('token', 'token123');
    // Llamamos al método logout.
    service.logout();
    // getToken debe retornar null ya que se eliminó el token.
    expect(service.getToken()).toBeNull();
    // isLoggedIn debe devolver false, ya que no hay token almacenado.
    expect(service.isLoggedIn()).toBeFalse();
  });
});
