using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokemonAPI.Models;
using PokemonAPI.Models.DTOs;
using PokemonAPI.Services;

namespace PokemonAPI.Controllers
{
    [ApiController]                          
    [Route("api/[controller]")]
    [Authorize]// Solo accesible con un JWT válido
    public class PokemonController : ControllerBase
    {
        private readonly IPokemonService _pokemonService;

        public PokemonController(IPokemonService pokemonService)
        {
            _pokemonService = pokemonService;
        }

        // API para obtener los pokémons del usuario con paginación
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetPokemons(int id, [FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {


            var pokemons = await _pokemonService.GetAllPokemonsAsync(id, offset, limit);

            if (pokemons.error==true)// Verifica si hay error
            {
                //si encuentra error solo se envia el error
                return StatusCode(500, new { error = pokemons.message });
            }

            //se retorna los pokemonos ya sea vacio o con elementos
            return Ok(pokemons);

        }


        // api para verificar si usuario ya tiene un pokemon
        [HttpGet("{userId}/{pokemonName}")]
        public async Task<IActionResult> ValidatePokemonExists(int userId, string pokemonName)
        {
            bool exists = await _pokemonService.ValidatePokemonExistsAsync(userId, pokemonName);

            return Ok(exists); // Devuelve `true` o `false` en formato JSON

        }

        /// <summary>
        /// Obtiene un Pokémon por su ID con todas sus relaciones.
        /// </summary>
        /// <param name="id">ID del Pokémon.</param>
        /// <returns>Detalles del Pokémon o un mensaje de error.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPokemon(int id)
        {
            try
            {

                // Llamar al servicio para obtener el Pokémon
                var pokemon = await _pokemonService.GetPokemonByIdAsync(id);

                // Si no se encuentra, devolver un mensaje adecuado
                if (pokemon == null)
                {
                    return NotFound(new { error = true, message = "Pokémon no encontrado." });
                }

                return Ok(pokemon); // Devolver los datos del Pokémon en formato JSON
            }
            catch (Exception ex)
            {
                // Registrar el error 
                Console.WriteLine($"Error en GetPokemonById: {ex.Message}");

                // Devolver un mensaje de error controlado
                return StatusCode(500, new { error = true, message = "Ocurrió un error interno en el servidor." });
            }
        }

        //api crear pokemon, recibe id del usuario y los datos del pokemon en un objeto
        // POST: api/pokemon
        [HttpPost]
        public async Task<IActionResult> CreatePokemon([FromBody] AddPokemonDto pokemon, int idUser)
        {
            try
            {
                int result = await _pokemonService.AddPokemonAsync(pokemon, idUser);
                if (result > 0)
                {
                    return Ok(new { id = result });
                }

                return BadRequest(result);

            }
            catch(Exception ex)
            {
                return BadRequest(ex);

            }

        }


        // DELETE: api/pokemon/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePokemon(int id)
        {
            try
            {
                var result = await _pokemonService.DeletePokemonAsync(id);
                if (!result)
                {
                    return NotFound(new {message = "El Pokémon no fue encontrado o no pudo eliminarse." });
                }

                // Retorna 204 No Content en caso de éxito sin contenido
                return NoContent();

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);

            }

        }
    }
}
