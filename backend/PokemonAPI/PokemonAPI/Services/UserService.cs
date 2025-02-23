using Microsoft.EntityFrameworkCore;    // Importa Entity Framework Core para trabajar con la base de datos.
using Microsoft.IdentityModel.Tokens;
using PokemonAPI.Data;                 // Importa el espacio de nombres que contiene el contexto de la base de datos.
using PokemonAPI.Models;               // Importa el espacio de nombres que contiene los modelos de datos (por ejemplo, User).
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace PokemonAPI.Services
{
  // Clase que implementa la interfaz IUserService. Esta clase maneja las operaciones relacionadas con el usuario.
  public class UserService : IUserService
  {
    // Se declara un campo privado de tipo AppDbContext para interactuar con la base de datos.
    private readonly AppDbContext _context;

   // Campo privado que almacenará la clave JWT
    private readonly string _jwtKey;

    // Constructor donde se inyecta la dependencia del contexto (AppDbContext).
    // Esto permite acceder a la base de datos a través de _context.
    public UserService(AppDbContext context, IConfiguration config)
    {
      _context = context;
      _jwtKey = config["Jwt:Key"];
    }

    // Método asíncrono que obtiene un usuario por su email desde la base de datos.
    public async Task<User> GetUserByEmailAsync(string email)
    {
      return await _context.User.FirstOrDefaultAsync(u => u.Email == email);
    }

    // Método asíncrono que obtiene un usuario por su ID desde la base de datos.
    public async Task<User> GetUserByIdAsync(int id)
    {
      // Utiliza el método FindAsync de EF Core para buscar al usuario por ID.
      return await _context.User.FindAsync(id);
    }

    // Método asíncrono que registra un nuevo usuario.
    public async Task<int> RegisterUserAsync(User user)
    {
            try
            {
                // Verifica si ya existe un usuario con el mismo correo
                if (await _context.User.AnyAsync(u => u.Email == user.Email))
                    return 0; // Usuario ya existe

                _context.User.Add(user);
                await _context.SaveChangesAsync();
                return user.Id; // Retorna el ID del usuario recién creado
            }
            catch (Exception ex)
            {
     
                return -1; // Error de conexión u otra excepción
            }
        }



        // Método que genera el token JWT para un usuario en particular.
        // Recibe un objeto "User" (podrías tener ID, Email, etc. en esa clase).
        public string GenerateJwtToken(User user)
        {
            // 1. Convertimos la cadena de la clave en un arreglo de bytes,
            //    para crear la llave simétrica con la que firmaremos el token.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));

            // 2. Creamos las credenciales de firma (SigningCredentials)
            //    usando la clave simétrica (key) y el algoritmo de cifrado HmacSha256.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3. Construimos el token JWT.
            //    Aquí puedes incluir Claims, issuer, audience, etc.
            //    aca solo definimos la expiración y las credenciales de firma.
            var token = new JwtSecurityToken(
                expires: DateTime.UtcNow.AddHours(2), // Token válido por 2 horas
                signingCredentials: creds
            );

            // 4. Usamos JwtSecurityTokenHandler para
            //    serializar (convertir) el token en una cadena JWT.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }





    }
}
