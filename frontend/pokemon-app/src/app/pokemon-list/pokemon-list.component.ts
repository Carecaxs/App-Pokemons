import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../services/auth.service';

interface Pokemon {
  name: string;
  url: string;
  id: number;
  imageUrl: string;
}

@Component({
  selector: 'app-pokemon-list',
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent {
  pokemons: any[] = []; // Lista para almacenar los Pokémon obtenidos desde la API
  mode: string = ''; // Indica si se muestran todos los Pokémon o solo los del usuario
  idUser: number = 0; // ID del usuario actual
  pokemonToDelete: number = 0; // ID del Pokémon que será eliminado
  showNotification: boolean = false; // Controla la visibilidad de la notificación
  notificationMessage: string = ''; // Mensaje de notificación

  // Propiedades para la paginación
  page: number = 1;
  itemsPerPage: number = 20;
  totalItems: number = 0;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService
  ) {
    this.idUser = auth.getUserId() ?? 0;
  }

  ngOnInit(): void {
    this.loadPokemons(); // Carga los Pokémon al inicializar el componente
  }

  // Método para cargar la lista de Pokémon según el modo seleccionado
  loadPokemons(): void {
    // Leer el "mode" que viene de la ruta
    // va recibir como opciones allPokemons o myPokemons
    this.mode = this.activatedRoute.snapshot.data['mode'];

    //en base al mode que se recibe se va mostrar los pokemones de la api oficial (allPokemons) o mis propios Pokemons(myPokemons)
    if (this.mode === 'allPokemons') {
      this.getAllPokemons();
    } else {
      //  Cargar desde API personal
      this.getOwnPokemons();
    }
  }

  // Método para ver los detalles de un Pokémon
  viewPokemonDetails(id: number, mode: string): void {
    switch (mode) {
      case 'allPokemons':
        this.router.navigate(['/pokemon/all', id]);
        break;

      case 'myPokemons':
        this.router.navigate(['/pokemon/own', id]);

        break;
    }
  }

  // Método para obtener Pokémon de la API oficial
  getAllPokemons(): void {
    this.pokemonService
      .getPokemons(this.page, this.itemsPerPage)
      .subscribe((response) => {
        // guardar total de items retornados
        this.totalItems = response.count;

        this.pokemons = response.results.map((pokemon: Pokemon) => {
          //extraer el id desde la url
          const id = pokemon.url.split('/').filter(Boolean).pop();

          return {
            ...pokemon,
            id: Number(id),
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`, // guardar la url del pokemon donde puedo ver mas detalles del mismo
          };
        });
      });
  }

  // Método para obtener los Pokémon personalizados del usuario
  getOwnPokemons(): void {
    // Calls the Pokemon service to retrieve the user's own Pokémon list.
    this.pokemonService
      .getOwnPokemons(this.idUser, this.page, this.itemsPerPage)
      .subscribe((response) => {
        // guardar numero de pokemones
        this.totalItems = response.count;

        // Mapea los datos de respuesta a una interfaz unificada
        this.pokemons = response.results.map((pokemon: any) => {
          return {
            name: pokemon.nameP,
            url: pokemon.url,
            id: pokemon.id,
            imageUrl: pokemon.principalImage,
          };
        });
      });
  }

  addPokemonToMyList(urlPokemon: string) {
    // 1) Llamar a un servicio que obtenga los datos completos de la PokeAPI
    this.pokemonService.getPokemonDetailsFromUrl(urlPokemon).subscribe({
      next: (pokemonDetails) => {
        // 2) Mapear esos datos a tu AddPokemonDto o lo que necesites
        const addPokemonDto = this.pokemonService.buildAddPokemonDto(
          pokemonDetails,
          urlPokemon
        );

        //validar si el pokemon ya lo tiene
        this.pokemonService
          .validatePokemonExists(this.idUser, addPokemonDto.name)
          .subscribe((exists) => {
            if (!exists) {
              //guardar pokemon

              this.pokemonService
                .addPokemon(this.idUser, addPokemonDto)
                .subscribe({
                  next: () => {
                    // si todo salio bien
                    this.showNotificationMessage(
                      '✅ Pokémon agregado exitosamente!'
                    );
                  },
                  error: (err) => {
                    console.error(err);
                    alert('Error con el servidor, vuelva a intentar!');
                  },
                });
            } else {
              //si el pokemon ya lo tiene guardado
              this.showNotificationMessage(
                'Este pokemon ya esta en tu biblioteca'
              );
            }
          });
      },
      error: (err) => {
        console.error(err);
        alert('Error obteniendo datos del Pokémon');
      },
    });
  }

  //eliminar pokemon de la lista personal
  removePokemonFromMyList() {
    var id = this.pokemonToDelete;

    if (id > 0) {
      this.pokemonService.deletePokemon(id).subscribe({
        next: () => {
          // Actualiza la lista eliminando el Pokémon borrado
          this.pokemons = this.pokemons.filter((p) => p.id !== id);
          this.loadPokemons();
          this.closeModalDelete();
        },
        error: (err) => {
          console.error(err.message);
          alert('Error al eliminar el Pokémon, por favor vuelva a intentar!');
        },
      });
    }
  }

  //method to change page
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadPokemons();
  }

  // Guarda el ID del Pokémon que se eliminará
  setPokemonToDelete(id: number) {
    this.pokemonToDelete = id;
  }

  closeModalDelete() {
    const closeButton = document.querySelector(
      '#confirmDeleteModal .btn-close'
    ) as HTMLButtonElement;

    if (closeButton) {
      closeButton.click();
    }
  }

  // Método para mostrar la notificación y ocultarla después de 3s
  showNotificationMessage(message: string) {
    this.notificationMessage = message; // Asigna el mensaje recibido
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 2000); // Se oculta en 1.5 segundos
  }
}
