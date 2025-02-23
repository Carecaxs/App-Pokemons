using Microsoft.AspNetCore.Mvc;          // Importa el espacio de nombres para trabajar con las funcionalidades de ASP.NET Core MVC.
using Microsoft.IdentityModel.Tokens;
using PokemonAPI.Models;                 // Importa el espacio de nombres donde se encuentran los modelos (como 'User').
using PokemonAPI.Services;               // Importa el espacio de nombres donde se encuentra el servicio IUserService.
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]                          // Indica que esta clase es un controlador de API y permite usar características como el model binding.
[Route("api/[controller]")]              // Define la ruta de la API, donde '[controller]' se reemplaza automáticamente con el nombre del controlador (en este caso, 'Auth').
public class AuthController : ControllerBase
{
  // Se declara un campo privado de tipo IUserService para interactuar con la lógica de negocio relacionada con los usuarios.
  private readonly IUserService _userService;



  // Constructor donde se inyecta la dependencia IUserService. Este servicio se utiliza para las operaciones relacionadas con los usuarios.
  public AuthController(IUserService userService)
  {
    _userService = userService;

  }




  // Método para registrar un nuevo usuario. Este método responde a solicitudes POST.
  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] User user)
  {
        // Se intenta registrar el usuario
        var result = await _userService.RegisterUserAsync(user);

        // Si result == 0, significa que el usuario ya existe
        if (result == 0)
            return BadRequest("El usuario ya existe");

        // Si result == -1, hubo un error en la conexión u otra excepción
        if (result == -1)
            return StatusCode(500, "Error interno al registrar el usuario");

        // Si result > 0, el registro fue exitoso y result es el ID del usuario
        // Se obtiene el usuario recién creado (asegúrate de que GetUserByIdAsync esté implementado)
        var registeredUser = await _userService.GetUserByIdAsync(result);
        if (registeredUser == null)
            return StatusCode(500, "Error al obtener los datos del usuario");

        // Generar el token JWT usando el usuario obtenido
        var token = _userService.GenerateJwtToken(registeredUser);

        // Retornar la respuesta con token y datos del usuario
        return Ok(new
        {
            message = "Usuario registrado exitosamente",
            token = token,
            userId = registeredUser.Id,
            email = registeredUser.Email
        });
    }




  // Método para obtener un usuario por su ID. Este método responde a solicitudes GET.
  [HttpGet("{id}")]
  public async Task<IActionResult> GetUserById(int id)
  {
    // Se llama al servicio para obtener el usuario de manera asíncrona.
    var user = await _userService.GetUserByIdAsync(id);

    // Si el usuario no se encuentra, se devuelve una respuesta NotFound con un mensaje.
    if (user == null)

      return NotFound("Usuario no encontrado");

 
    // Si el usuario es encontrado, se devuelve una respuesta OK con los datos del usuario.
    return Ok(user);
  }


  // Este método maneja las solicitudes POST en el endpoint "/login".
  // Recibe un objeto LoginRequest que contiene el correo y la contraseña del usuario.

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
        try
        {
            // 1) Obtener el usuario de la BD
            var user = await _userService.GetUserByEmailAsync(request.Email);

            // 2) Validar si existe y coincide la password
            if (user == null || user.Passwordd != request.Password)
            {
                return Unauthorized(new { message = "Credenciales incorrectas" });//credenciales incorrectas
            }

            // 3) Generar el token JWT
            var token = _userService.GenerateJwtToken(user);

            // 4) Devolver token (y opcionalmente datos de usuario)
            return Ok(new
            {
                message = "Inicio de sesión exitoso",
                token = token,
                userId = user.Id,
                email = user.Email

            });

        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });

        }
       


       
    }







}
