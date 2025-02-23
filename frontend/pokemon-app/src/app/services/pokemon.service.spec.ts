// Importamos TestBed para configurar el entorno de pruebas.
import { TestBed } from '@angular/core/testing';
// Importamos la función provideHttpClientTesting y HttpTestingController para simular y controlar peticiones HTTP.
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
// Importamos el servicio a testear.
import { PokemonService } from './pokemon.service';
// Importamos el AuthService para proveerlo (usaremos un stub para que devuelva un token).
import { AuthService } from './auth.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;

  // Creamos un stub para AuthService, que simula el método getToken.
  const authServiceStub = {
    getToken: () => 'dummyToken',
  };

  // Constante para URL base (usada en pruebas para endpoints de autenticación).
  const personalApiUrlBase = 'http://localhost:5054/api/Pokemon';

  beforeEach(() => {
    // Configuramos el TestBed para el entorno de pruebas.
    TestBed.configureTestingModule({
      // Usamos provideHttpClientTesting() para simular el HttpClient.
      imports: [HttpClientTestingModule],
      // Proveemos el servicio a testear y el stub para AuthService.
      providers: [
        PokemonService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
    // Inyectamos la instancia del servicio.
    service = TestBed.inject(PokemonService);
    // Inyectamos el controlador para las peticiones HTTP simuladas.
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificamos que no queden peticiones pendientes.
    httpMock.verify();
  });

  // ------------------ Pruebas para métodos que realizan solicitudes HTTP ------------------

  // 1. Prueba para getPokemons() (API oficial)
  it('should get paginated pokemons from official API', () => {
    const page = 1;
    const limit = 20;
    const offset = 0;
    const mockResponse = {
      count: 100,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    };

    // Llamamos a getPokemons y esperamos la respuesta.
    service.getPokemons(page, limit).subscribe((response) => {
      expect(response.count).toEqual(100);
      expect(response.results.length).toEqual(1);
      expect(response.results[0].name).toEqual('bulbasaur');
    });

    // Interceptamos la solicitud GET que debe realizarse a la URL construida.
    const req = httpMock.expectOne(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    expect(req.request.method).toBe('GET');
    // Simulamos la respuesta del servidor.
    req.flush(mockResponse);
  });

  // 2. Prueba para getOwnPokemons() (API personal, usando token)
  it('should get paginated own pokemons from personal API', () => {
    const userId = 1;
    const page = 1;
    const limit = 20;
    const offset = 0;
    const mockResponse = {
      count: 50,
      results: [
        { id: 1, nameP: 'bulbasaur', images: ['img1', 'img2', 'img3'] },
      ],
    };

    service.getOwnPokemons(userId, page, limit).subscribe((response) => {
      expect(response.count).toEqual(50);
      expect(response.results.length).toEqual(1);
      expect(response.results[0].nameP).toEqual('bulbasaur');
    });

    const url = `${personalApiUrlBase}/user/${userId}?offset=${offset}&limit=${limit}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    // Verificamos que se haya adjuntado el header Authorization con el token del stub.
    expect(req.request.headers.get('Authorization')).toEqual(
      'Bearer dummyToken'
    );
    req.flush(mockResponse);
  });

  // 3. Prueba para getPokemonDetails() en modo 'allPokemons'
  it('should get pokemon details from official API for mode allPokemons', () => {
    const id = 1;
    const mode = 'allPokemons';
    // Simulamos la respuesta de la API oficial.
    const mockResponse = {
      id: 1,
      name: 'bulbasaur',
      base_experience: 64,
      height: 7,
      weight: 69,
      cries: { latest: 'soundUrl' },
      sprites: {
        front_default: 'frontImg',
        back_default: 'backImg',
        front_shiny: 'shinyImg',
      },
      stats: [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
      ],
      types: [{ type: { name: 'grass' } }],
      abilities: [{ ability: { name: 'overgrow' } }],
      moves: [{ move: { name: 'razor-wind' } }],
    };

    service.getPokemonDetails(id, mode).subscribe((pokemon) => {
      // El método normalizePokemon transforma los datos a la forma esperada.
      expect(pokemon.id).toEqual(1);
      expect(pokemon.name).toEqual('bulbasaur');
      expect(pokemon.sprites.front_default).toEqual('frontImg');
      expect(pokemon.stats.hp).toEqual(45);
      expect(pokemon.types[0]).toEqual('GRASS'); // se transforma a mayúsculas en normalizePokemon
      expect(pokemon.abilities[0]).toEqual('OVERGROW');
      expect(pokemon.moves[0]).toEqual('RAZOR-WIND');
    });

    const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // 4. Prueba para getPokemonDetails() en modo 'myPokemons'
  it('should get pokemon details from personal API for mode myPokemons', () => {
    const id = 1;
    const mode = 'myPokemons';
    // Simulamos la respuesta de la API personal.
    const mockResponse = {
      id: 1,
      nameP: 'bulbasaur',
      baseExperience: 64,
      height: 7,
      weightP: 69,
      sound_url: 'soundUrl',
      images: ['img1', 'img2', 'img3'],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45,
      },
      types: ['GRASS', 'POISON'],
      abilities: ['OVERGROW', 'CHLOROPHYLL'],
      moves: ['RAZOR-WIND', 'SWORDS-DANCE'],
    };

    service.getPokemonDetails(id, mode).subscribe((pokemon) => {
      expect(pokemon.id).toEqual(1);
      expect(pokemon.name).toEqual('bulbasaur');
      // En modo 'myPokemons', se usa la normalización propia
      expect(pokemon.sprites.front_default).toEqual('img1');
      expect(pokemon.stats.hp).toEqual(45);
      expect(pokemon.types[0]).toEqual('GRASS');
      expect(pokemon.abilities[0]).toEqual('OVERGROW');
      expect(pokemon.moves[0]).toEqual('RAZOR-WIND');
    });

    const url = `${personalApiUrlBase}/${id}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toEqual(
      'Bearer dummyToken'
    );
    req.flush(mockResponse);
  });

  // 5. Prueba para addPokemon() (POST)
  it('should add a pokemon and return a response', () => {
    const userId = 1;
    const addPokemonDto = { name: 'TestPokemon' };
    const mockResponse = { success: true };

    service.addPokemon(userId, addPokemonDto).subscribe((response) => {
      expect(response.success).toBeTrue();
    });

    const url = `http://localhost:5054/api/Pokemon?idUser=${userId}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toEqual(
      'Bearer dummyToken'
    );
    expect(req.request.body).toEqual(addPokemonDto);
    req.flush(mockResponse);
  });

  // 6. Prueba para deletePokemon() (DELETE)
  it('should delete a pokemon', () => {
    const id = 1;
    const mockResponse = {}; // Simulamos respuesta vacía

    service.deletePokemon(id).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const url = `http://localhost:5054/api/Pokemon/${id}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toEqual(
      'Bearer dummyToken'
    );
    req.flush(mockResponse);
  });

  // 7. Prueba para validatePokemonExists() (GET)
  it('should validate if a pokemon exists', () => {
    const userId = 1;
    const pokemonName = 'BULBASAUR';
    const mockResponse = true;

    service.validatePokemonExists(userId, pokemonName).subscribe((response) => {
      expect(response).toBeTrue();
    });

    const url = `http://localhost:5054/api/Pokemon/${userId}/${pokemonName}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toEqual(
      'Bearer dummyToken'
    );
    req.flush(mockResponse);
  });

  // 8. Prueba para buildAddPokemonDto (función pura sin HTTP)
  it('should build addPokemonDto correctly', () => {
    // Simulamos la respuesta de la API oficial.
    const pokeData = {
      name: 'bulbasaur',
      base_experience: 64,
      height: 7,
      weight: 69,
      cries: { latest: 'soundUrl' },
      sprites: {
        front_default: 'frontImg',
        back_default: 'backImg',
        front_shiny: 'shinyImg',
        other: { 'official-artwork': { front_default: 'officialImg' } },
      },
      stats: [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
      ],
      types: [{ type: { name: 'grass' } }],
      abilities: [{ ability: { name: 'overgrow' } }],
      moves: [{ move: { name: 'razor-wind' } }],
    };

    const url = 'https://pokeapi.co/api/v2/pokemon/1/';
    const dto = service.buildAddPokemonDto(pokeData, url);
    // Comprobamos que las propiedades se asignen correctamente.
    expect(dto.name).toEqual('bulbasaur');
    expect(dto.baseExperiencia).toEqual(64);
    expect(dto.height).toEqual(7);
    expect(dto.weight).toEqual(69);
    expect(dto.sound).toEqual('soundUrl');
    expect(dto.principalImage).toEqual(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
    );
  });

  // 9. Prueba para getHeader(): Verificar que se genera el header Authorization.
  it('should return an Authorization header if token exists', () => {
    const headers = service.getHeader();
    expect(headers.get('Authorization')).toEqual('Bearer dummyToken');
  });
});
