using PokemonAPI.Models;   
namespace PokemonAPI.Services
{
  // Interfaz IUserService que define los métodos que deben implementarse en cualquier clase que la implemente.
  public interface IUserService
  {
    // Método asíncrono que obtiene un usuario por su ID. Retorna un Task de tipo 'User' para manejar la operación asíncrona.
    Task<User> GetUserByIdAsync(int id);

    // Método asíncrono que registra un nuevo usuario. Retorna un Task de tipo 'bool' indicando si el registro fue exitoso.
    Task<int> RegisterUserAsync(User user);


    Task<User> GetUserByEmailAsync(string email);

    string GenerateJwtToken(User user);





  }
}
