import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método para obtener la lista paginada de Pokémon desde la API oficial
  // page: número de página (1, 2, 3, ...)
  // limit: cantidad de elementos por página (por defecto 20)
  getPokemons(page: number, limit: number = 20): Observable<any> {
    this.apiUrl = 'https://pokeapi.co/api/v2/pokemon';
    const offset = (page - 1) * limit;

    return this.http.get<any>(`${this.apiUrl}?offset=${offset}&limit=${limit}`);
  }

  // Método para obtener la lista paginada de los Pokémones del usuario desde la API creada
  getOwnPokemons(
    id: number,
    page: number,
    limit: number = 20
  ): Observable<any> {
    const offset = (page - 1) * limit;
    const url = `http://localhost:5054/api/Pokemon/user/${id}?offset=${offset}&limit=${limit}`;

    let headers = this.getHeader();

    return this.http.get<any>(url, { headers });
  }

  // Método para obtener los detalles de un Pokémon específico por su ID, depende del mode su consume api personal o oficial
  getPokemonDetails(id: number, mode: string): Observable<any> {
    let apiUrl = '';

    if (mode === 'allPokemons') {
      apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
      return this.http
        .get<any>(apiUrl)
        .pipe(map((pokemon) => this.normalizePokemon(pokemon, mode)));
    } else {
      apiUrl = `http://localhost:5054/api/Pokemon/${id}`;
      let headers = this.getHeader();

      return this.http
        .get<any>(apiUrl, { headers })
        .pipe(map((pokemon) => this.normalizePokemon(pokemon, mode)));
    }
  }

  // Método para obtener los detalles de un Pokémon desde una URL específica
  getPokemonDetailsFromUrl(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  // Método para agregar un Pokémon a la base de datos usando la API creada
  // Recibe un objeto Pokémon y el ID del usuario
  addPokemon(userId: number, addPokemonDto: any): Observable<any> {
    let headers = this.getHeader();

    return this.http.post<any>(
      `http://localhost:5054/api/Pokemon?idUser=${userId}`,
      addPokemonDto,
      { headers }
    );
  }

  // Método que devuelve true si el Pokémon ya existe, de lo contrario devuelve false
  deletePokemon(id: number): Observable<any> {
    let headers = this.getHeader();
    const url = `http://localhost:5054/api/Pokemon/${id}`;
    return this.http.delete(url, { headers });
  }

  // Método que devuelve true si el Pokémon ya existe, de lo contrario devuelve false
  validatePokemonExists(
    userId: number,
    pokemonName: string
  ): Observable<boolean> {
    let headers = this.getHeader();

    return this.http.get<boolean>(
      `http://localhost:5054/api/Pokemon/${userId}/${pokemonName}`,
      { headers }
    );
  }

  // Método para mapear la respuesta de la API oficial y convertirla en el modelo AddPokemonDto
  buildAddPokemonDto(pokeData: any, url: string): any {
    //get the pokemon id from url
    const id = url.replace(/\/$/, '').split('/').pop();

    return {
      name: pokeData.name,
      baseExperiencia: pokeData.base_experience,
      height: pokeData.height,
      weight: pokeData.weight,
      sound: pokeData.cries.latest,
      principalImage:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' +
        id +
        '.png',
      stats: {
        hp: pokeData.stats[0]?.base_stat || 0,
        attack: pokeData.stats[1]?.base_stat || 0,
        defense: pokeData.stats[2]?.base_stat || 0,
        specialAttack: pokeData.stats[3]?.base_stat || 0,
        specialDefense: pokeData.stats[4]?.base_stat || 0,
        speed: pokeData.stats[5]?.base_stat || 0,
      },
      types: pokeData.types.map((t: any) => {
        return { name: t.type.name };
      }),
      abilities: pokeData.abilities.map((a: any) => {
        return { name: a.ability.name };
      }),
      moves: pokeData.moves.map((m: any) => {
        return { name: m.move.name };
      }),
      images: [
        { url: pokeData.sprites.front_default }, // Imagen frontal
        { url: pokeData.sprites.back_default }, // Imagen trasera
        { url: pokeData.sprites.front_shiny }, // Imagen shiny
      ],
    };
  }

  // Método para obtener el token manualmente y crear el encabezado HTTP
  getHeader(): HttpHeaders {
    // Obtener token manualmente
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Método para normalizar los datos recibidos de las APIs para que coincidan en el formato esperado
  private normalizePokemon(pokemon: any, mode: string): any {
    if (mode === 'allPokemons') {
      return {
        id: pokemon.id,
        name: pokemon.name,
        base_experience: pokemon.base_experience,
        height: pokemon.height,
        weight: pokemon.weight,
        sound: pokemon.cries?.latest ?? '',
        sprites: {
          front_default: pokemon.sprites?.front_default ?? '',
          back_default: pokemon.sprites?.back_default ?? '',
          front_shiny: pokemon.sprites?.front_shiny ?? '',
        },
        stats: pokemon.stats.reduce((acc: any, statObj: any) => {
          acc[statObj.stat.name.replace('-', '')] = statObj.base_stat;
          return acc;
        }, {}),
        types: pokemon.types.map((t: any) => t.type.name.toUpperCase()),

        abilities: pokemon.abilities.map((a: any) =>
          a.ability.name.toUpperCase()
        ),

        moves: pokemon.moves.map((m: any) => m.move.name.toUpperCase()),
      };
    } else {
      return {
        id: pokemon.id,
        name: pokemon.nameP,
        base_experience: pokemon.baseExperience,
        height: pokemon.height,
        weight: pokemon.weightP,
        sound: pokemon.sound_url ?? '',
        sprites: {
          front_default: pokemon.images?.[0] ?? '',
          back_default: pokemon.images?.[1] ?? '',
          front_shiny: pokemon.images?.[2] ?? '',
        },
        stats: {
          hp: pokemon.stats.hp,
          attack: pokemon.stats.attack,
          defense: pokemon.stats.defense,
          specialattack: pokemon.stats.specialAttack,
          specialdefense: pokemon.stats.specialDefense,
          speed: pokemon.stats.speed,
        },
        types: pokemon.types.map((t: any) => t.toUpperCase()),

        abilities: pokemon.abilities.map((a: any) => a.toUpperCase()),

        moves: pokemon.moves.map((m: any) => m.toUpperCase()),
      };
    }
  }
}
