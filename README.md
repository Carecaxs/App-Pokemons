## Descripción General App Pokémons

La aplicación permite a los usuarios:

- **Registrarse e iniciar sesión** (usando autenticación basada en JWT).
- Ver una lista paginada de todos los Pokémons obtenidos desde la API oficial.
- Agregar Pokémons a una biblioteca personal (almacenada en la base de datos del backend).
- Consultar detalles completos de cada Pokémon (imágenes, sonidos, estadísticas, etc.).
- Gestionar su biblioteca personal (ver detalles y eliminar Pokémons).

## Requisitos

- [.NET] version 7.0.403
- [SQL Server] version 19
- [Node.js] version v22.14.0
- [Angular CLI] version 19.1.7

### Backend

El backend de **PokemonAPI** se encarga de:

- Gestionar usuarios (registro, login, etc.).
- Administrar la información de los Pokémons y sus relaciones (estadísticas, tipos, habilidades, movimientos, imágenes).
- Proveer endpoints seguros mediante autenticación JWT.
- Consumir y exponer APIs propias que se integran con el frontend.

1. Navega a la carpeta `backend/PokemonAPI`.
2. Ejecuta el archivo BD_POKEMON.sql en SQL Server para crear la base de datos y las tablas necesarias.
3. Abre la solución en Visual Studio
4. Revisa el archivo `appsettings.json` para asegurarte de que la cadena de conexión a tu base de datos SQL Server esté correctamente configurada.
5. Restaura los paquetes de NuGet ejecutando: dotnet restore
6. Compila la solución: dotnet build
7. Ejecutar la solucion en http (asegurese de ejecutar en http porque sino se abirira en un puerto diferente y no funcionara las apis creadas)

### Frontend

La aplicación consume la API del backend (desarrollada en .NET) para mostrar, agregar, y gestionar Pokémons.  
Además, se integra con la API oficial de PokéAPI para obtener la lista de Pokémons y sus detalles.

1. Navega a la carpeta `frontend` y abre el proyecto (por ejemplo, usando Visual Studio Code).
2. Instala las dependencias: npm install
3. Inicia la aplicación Angular ng s

//////////// la aplicacion del backend debe de estar ejecutandose cuando ejecute la pagina web ya que si no la ejecutamos no vamos a poder acceder a las apis creadas. Ademas la bd la debe de ejecutar antes de todo ////////////

### Pruebas

En este proyecto se realizaron pruebas unitarias únicamente en los servicios.
Comando para ejecutar las pruebas: ng test --include="src/app/services/**/*.spec.ts"
