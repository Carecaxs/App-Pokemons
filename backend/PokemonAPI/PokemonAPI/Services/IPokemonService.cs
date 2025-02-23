using PokemonAPI.Models;
using PokemonAPI.Models.DTOs;

namespace PokemonAPI.Services
{
    public interface IPokemonService
    {

        // Obtiene la lista de todos los Pokémon ligados a un usuario.
        Task<dynamic> GetAllPokemonsAsync(int userId, int offset, int limit);

        // recibe nombre del pokemon y id del usuario y se determina si existe o no, se retorna true en caso de que exista o false en caso de que no
        Task<bool> ValidatePokemonExistsAsync(int userId, string pokemonName);

        // Obtiene un Pokémon por su ID.
        Task<dynamic> GetPokemonByIdAsync(int id);

        // Crea un nuevo Pokémon en la base de datos.
        Task<int> AddPokemonAsync(AddPokemonDto pokemon, int idUser);


        /// Elimina un Pokémon de la base de datos por su ID.
        Task<bool> DeletePokemonAsync(int id);
    }
}
