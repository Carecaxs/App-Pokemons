import { Component } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  imports: [CommonModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css',
})
export class PokemonDetailComponent {
  pokemon: any; // Objeto para almacenar los detalles del Pokémon.
  pokemonId: number = 0; // Almacenará el id del Pokémon.
  mode: string = ''; // Propiedad para indicar en qué sección estamos: allPokemons o myPokemons

  constructor(
    private route: ActivatedRoute, // Para acceder a los parámetros de la ruta.
    private pokemonService: PokemonService // Servicio para obtener los datos del Pokémon.
  ) {}

  ngOnInit(): void {
    // Leer el "mode" que viene de la ruta
    // Recibirá como opciones allPokemons o myPokemons
    this.mode = this.route.snapshot.data['mode'];

    // Obtiene el id desde la URL.
    this.pokemonId = Number(this.route.snapshot.paramMap.get('id'));
    this.getPokemonDetails();
  }

  /**
   * Obtiene los detalles de un Pokémon según el modo seleccionado.
   *
   * - Si `mode` es `'allPokemons'`, recupera los datos desde la API oficial de Pokémon.
   * - Si `mode` es `'myPokemons'`, obtiene los datos desde la API personal del usuario.
   *
   * La transformación de datos se realiza en el servicio, por lo que aquí solo
   * se asigna la respuesta directamente a `this.pokemon`.
   */
  getPokemonDetails(): void {
    this.pokemonService.getPokemonDetails(this.pokemonId, this.mode).subscribe({
      next: (response) => {
        this.pokemon = response; // Asigna los datos ya normalizados
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  goBack(): void {
    window.history.back(); // Vuelve a la página anterior (la lista de Pokémon).
  }
}
