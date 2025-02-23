
using Microsoft.EntityFrameworkCore;
using PokemonAPI.Data;
using PokemonAPI.Models;
using PokemonAPI.Models.DTOs;


namespace PokemonAPI.Services
{
    /// <summary>
    /// Servicio para gestionar la lógica de negocio de los Pokémon.
    /// Proporciona métodos para validar, obtener, agregar y eliminar Pokémon.
    /// </summary>
    public class PokemonService : IPokemonService
    {

        private readonly AppDbContext _context;

        /// <summary>
        /// Constructor del servicio de Pokémon.
        /// </summary>
        /// <param name="context">Contexto de la base de datos.</param>
        public PokemonService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Verifica si un Pokémon existe para un usuario específico.
        /// </summary>
        /// <param name="userId">ID del usuario.</param>
        /// <param name="pokemonName">Nombre del Pokémon.</param>
        /// <returns>True si el Pokémon existe, False en caso contrario.</returns>
        public async Task<bool> ValidatePokemonExistsAsync(int userId, string pokemonName)
        {
            return await (from p in _context.Pokemons
                          join up in _context.UsersPokemons on p.id equals up.idPokemon
                          where p.nameP == pokemonName && up.userId == userId
                          select up.idPokemon)
                      .AnyAsync(); //  Devuelve true si existe, false si no
        }



        /// <summary>
        /// Obtiene todos los Pokémon de un usuario con paginación.
        /// </summary>
        /// <param name="userId">ID del usuario.</param>
        /// <param name="offset">Número de elementos a omitir.</param>
        /// <param name="limit">Número máximo de elementos a recuperar.</param>
        /// <returns>Lista de Pokémon y el total de registros.</returns>
        public async Task<dynamic> GetAllPokemonsAsync(int userId, int offset, int limit)
        {
            try
            {

                var pokemons = (from up in _context.UsersPokemons
                                join p in _context.Pokemons on up.idPokemon equals p.id
                                where up.userId == userId
                                select new
                                {
                                    p.id,
                                    p.nameP,
                                    p.principalImage,
                                    url = $"http://localhost:5054/api/Pokemon/{p.id}"
                                });



                // Total de registros sin paginar
                var totalCount = await pokemons.CountAsync();

                // Aplicamos la paginación
                var results = await pokemons.Skip(offset).Take(limit).ToListAsync();


                return new { count = totalCount, results, error=false };

            }catch (Exception ex)
            {
                return new { error=true, message=ex.Message };
               
            }


        }


        /// <summary>
        /// Obtiene un Pokémon por su ID con todas sus relaciones.
        /// </summary>
        /// <param name="id">ID del Pokémon.</param>
        /// <returns>Información detallada del Pokémon o un mensaje de error.</returns>
        public async Task<dynamic> GetPokemonByIdAsync(int id)
        {
            try
            {
                // Consulta la base de datos para obtener el Pokémon y sus datos relacionados
                var pokemon = await _context.Pokemons
                    .Where(p => p.id == id)
                    .Select(p => new
                    {
                        p.id,
                        p.nameP,
                        p.baseExperience,
                        p.height,
                        p.weightP,
                        p.sound_url,

                        // Obtener las estadísticas del Pokémon
                        stats = _context.Statss
                            .Where(s => s.idPokemon == p.id)
                            .Select(s => new
                            {
                                s.hp,
                                s.attack,
                                s.defense,
                                s.specialAttack,
                                s.specialDefense,
                                s.speed
                            })
                            .FirstOrDefault(),

                        // Obtener las habilidades del Pokémon como una lista
                        abilities = _context.PokemonAbilities
                            .Where(pa => pa.PokemonId == p.id)
                            .Join(_context.Abilities, pa => pa.AbilityId, a => a.Id, (pa, a) => a.NameAbility)
                            .ToList(),

                        // Obtener los movimientos del Pokémon como una lista
                        moves = _context.PokemonMoves
                            .Where(pm => pm.PokemonId == p.id)
                            .Join(_context.Moves, pm => pm.MoveId, m => m.Id, (pm, m) => m.NameMove)
                            .ToList(),
                        // Obtener los tipos del Pokémon como una lista
                        types = _context.PokemonType
                            .Where(pt => pt.pokemonId == p.id)
                            .Join(_context.Types, pt => pt.idType, t => t.Id, (pt, t) => t.NameType)
                            .ToList(),

                        // Obtener las imágenes del Pokémon como una lista
                        images = _context.PokemonImages
                            .Where(pi => pi.PokemonId == p.id)
                            .Join(_context.Images, pi => pi.ImageId, im => im.Id, (pi, im) => im.UrlImage)
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                // Si no se encuentra el Pokémon, devolver null
                if (pokemon == null)
                {
                    return null;
                }

                return pokemon;
            }
            catch (Exception ex)
            {

                // Opcionalmente, devolver un objeto de error en lugar de null
                return new { error = true, message = ex.Message };
            }
        }




        /// <summary>
        /// Agrega un nuevo Pokémon a la base de datos.
        /// </summary>
        /// <param name="pokemon">DTO con la información del Pokémon.</param>
        /// <param name="idUser">ID del usuario que está agregando el Pokémon.</param>
        /// <returns>ID del Pokémon creado o -1 en caso de error.</returns>
        public async Task<int> AddPokemonAsync(AddPokemonDto pokemon, int idUser)
        {
            // Iniciamos una transacción en la base de datos
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Crear la entidad del nuevo Pokémon
                    var newPokemon = new Pokemon
                    {
                        nameP = pokemon.Name,
                        baseExperience = pokemon.BaseExperiencia,
                        height = pokemon.Height,
                        weightP = pokemon.Weight,
                        sound_url = pokemon.Sound,
                        principalImage=pokemon.principalImage
                    };
                    _context.Pokemons.Add(newPokemon);
                    await _context.SaveChangesAsync();  // Guardamos el Pokémon en la base de datos

                    // Crear la relación entre el usuario y el Pokémon
                    var newUserPokemons = new UsersPokemons
                    {
                        userId = idUser,
                        idPokemon = newPokemon.id
                    };
                    _context.UsersPokemons.Add(newUserPokemons);


                    // Crear las estadísticas del Pokémon

                    var newStats = new Statss
                    {
                        hp = pokemon.Stats.Hp,
                        attack = pokemon.Stats.Attack,
                        defense = pokemon.Stats.Defense,
                        specialAttack = pokemon.Stats.SpecialAttack,
                        specialDefense = pokemon.Stats.SpecialDefense,
                        speed = pokemon.Stats.Speed,
                        idPokemon = newPokemon.id
                    };
                    _context.Statss.Add(newStats);


                    // Agregar los tipos del Pokémon
                    foreach (var typeDto in pokemon.Types)
                    {

                        string typeName = typeDto.Name.ToUpper();

                        // Primero, vemos si ya existe un tipo con ese nombre
                        var existingType = await _context.Types
                            .FirstOrDefaultAsync(t => t.NameType == typeName);

                        if (existingType == null)
                        {
                            // Si no existe, creamos uno nuevo
                            existingType = new Typess
                            {
                                NameType = typeName
                            };
                            _context.Types.Add(existingType);

                            // Guardamos para que la BD genere el 'id' del nuevo tipo
                            await _context.SaveChangesAsync();
                        }


                        // Agregar habilidades del Pokémon
                        var newPokemonType = new PokemonType
                        {
                            idType = existingType.Id,
                            pokemonId = newPokemon.id
                        };
                        _context.PokemonType.Add(newPokemonType);
                    }

                    // Después del foreach, guardamos todos los PokemonType creados
                    await _context.SaveChangesAsync();


                    // Agregar habilidades del Pokémon
                    foreach (var abilityDto in pokemon.Abilities)
                    {
                        // Convertir el nombre a mayúsculas para la comparación
                        string abilityName = abilityDto.Name.ToUpper();

                        // Buscar si ya existe la habilidad en la base de datos
                        var existingAbility = await _context.Abilities
                            .FirstOrDefaultAsync(a => a.NameAbility == abilityName);

                        // Si no existe, crearlo y guardar para obtener el ID
                        if (existingAbility == null)
                        {
                            var newAbility = new Abilities { NameAbility = abilityName };
                            _context.Abilities.Add(newAbility);
                            await _context.SaveChangesAsync(); // Se genera el ID
                            existingAbility = newAbility;
                        }

                        // Crear la relación en la tabla puente
                        var newPokemonAbility = new PokemonAbilities
                        {
                            PokemonId = newPokemon.id,
                            AbilityId = existingAbility.Id
                        };
                        _context.PokemonAbilities.Add(newPokemonAbility);
                    }

                    await _context.SaveChangesAsync(); // Guardar todas las PokemonAbilities



                    // Agregar movimientos del Pokémon
                    foreach (var moveDto in pokemon.Moves)
                    {
                        string moveName = moveDto.Name.ToUpper();

                        // Buscar si el movimiento ya existe
                        var existingMove = await _context.Moves
                            .FirstOrDefaultAsync(m => m.NameMove == moveName);

                        if (existingMove == null)
                        {
                            var newMove = new Moves { NameMove = moveName };
                            _context.Moves.Add(newMove);
                            await _context.SaveChangesAsync(); // Genera el ID
                            existingMove = newMove;
                        }

                        // Crear la relación en la tabla puente
                        var newPokemonMove = new PokemonMoves
                        {
                            PokemonId = newPokemon.id,
                            MoveId = existingMove.Id
                        };
                        _context.PokemonMoves.Add(newPokemonMove);
                    }

                    await _context.SaveChangesAsync(); // Guardar todos los PokemonMoves


                    // Agregar imágenes del Pokémon
                    foreach (var imageDto in pokemon.Images)
                    {
                        // Ver si ya existe esa imagen (tal vez por la URL)
                        var newImage = await _context.Images
                            .FirstOrDefaultAsync(i => i.UrlImage == imageDto.url);

                        newImage = new Images
                        {
                            UrlImage = imageDto.url

                        };
                        _context.Images.Add(newImage);
                        await _context.SaveChangesAsync();


                        // Insertar relación
                        var newPokemonImage = new PokemonImages
                        {
                            PokemonId = newPokemon.id,
                            ImageId = newImage.Id
                        };
                        _context.PokemonImages.Add(newPokemonImage);
                    }
                    await _context.SaveChangesAsync();


                    //  Si todo salió bien, confirmamos la transacción y se retorna el id del nuevo pokemon
                    await transaction.CommitAsync();
                    return newPokemon.id;
                }
                catch (Exception)
                {
                    // Si ocurre un error, deshacemos todos los cambios
                    await transaction.RollbackAsync();
                    return -1;
                }
            }
        }



        /// <summary>
        /// Elimina un Pokémon de la base de datos por su ID.
        /// </summary>
        /// <param name="id">ID del Pokémon.</param>
        /// <returns>True si se eliminó correctamente, False en caso contrario.</returns>
        public async Task<bool> DeletePokemonAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1) Verificar si existe el Pokémon
                var pokemon = await _context.Pokemons.FindAsync(id);
                if (pokemon == null)
                    return false;

                // 2) Eliminar relaciones en tablas puente

                // a) Estadísticas
                var stats = await _context.Statss
                    .Where(s => s.idPokemon == id)
                    .ToListAsync();
                _context.Statss.RemoveRange(stats);

                // b) Usuarios-Pokemons
                var userPokemons = await _context.UsersPokemons
                    .Where(up => up.idPokemon == id)
                    .ToListAsync();
                _context.UsersPokemons.RemoveRange(userPokemons);

                // c) Habilidades (PokemonAbilities)
                var pokemonAbilities = await _context.PokemonAbilities
                    .Where(pa => pa.PokemonId == id)
                    .ToListAsync();
                _context.PokemonAbilities.RemoveRange(pokemonAbilities);

                // d) Movimientos (PokemonMoves)
                var pokemonMoves = await _context.PokemonMoves
                    .Where(pm => pm.PokemonId == id)
                    .ToListAsync();
                _context.PokemonMoves.RemoveRange(pokemonMoves);

                // e) Tipos (PokemonType)
                var pokemonTypes = await _context.PokemonType
                    .Where(pt => pt.pokemonId == id)
                    .ToListAsync();
                _context.PokemonType.RemoveRange(pokemonTypes);

                // f) Imágenes (PokemonImages)
                var pokemonImages = await _context.PokemonImages
                    .Where(pi => pi.PokemonId == id)
                    .ToListAsync();
                _context.PokemonImages.RemoveRange(pokemonImages);

                // 2.1) Guardar cambios para eliminar todas las relaciones
                await _context.SaveChangesAsync();

                // 3) Eliminar el Pokémon en sí
                _context.Pokemons.Remove(pokemon);
                await _context.SaveChangesAsync();

                // 4) Eliminar registros huérfanos en las tablas maestras

                // a) Tipos que ya no estén asociados a ningún Pokémon
                var orphanTypes = await _context.Types
                    .Where(t => !_context.PokemonType.Any(pt => pt.idType == t.Id))
                    .ToListAsync();
                _context.Types.RemoveRange(orphanTypes);

                // b) Habilidades huérfanas
                var orphanAbilities = await _context.Abilities
                    .Where(a => !_context.PokemonAbilities.Any(pa => pa.AbilityId == a.Id))
                    .ToListAsync();
                _context.Abilities.RemoveRange(orphanAbilities);

                // c) Movimientos huérfanos
                var orphanMoves = await _context.Moves
                    .Where(m => !_context.PokemonMoves.Any(pm => pm.MoveId == m.Id))
                    .ToListAsync();
                _context.Moves.RemoveRange(orphanMoves);

                // d) Imágenes huérfanas (en este caso, todas las imágenes son únicas)
                var orphanImages = await _context.Images
                    .Where(i => !_context.PokemonImages.Any(pi => pi.ImageId == i.Id))
                    .ToListAsync();
                _context.Images.RemoveRange(orphanImages);

                // 5) Guardar todos los cambios restantes
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw ex;
            }
        }



    }
}
