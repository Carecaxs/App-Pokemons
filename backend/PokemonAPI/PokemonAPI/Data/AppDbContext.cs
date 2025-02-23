using Microsoft.EntityFrameworkCore;
using PokemonAPI.Models;

namespace PokemonAPI.Data
{
  public class AppDbContext : DbContext
  {

    private readonly IConfiguration Configuration;

    public AppDbContext(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      if (!optionsBuilder.IsConfigured)
      {
        var connectionString = Configuration.GetConnectionString("DefaultConnection");
        optionsBuilder.UseSqlServer(connectionString);
      }
    }

    // Definimos las tablas de la base de datos como DbSet
    public DbSet<User> User { get; set; }
    public DbSet<Pokemon> Pokemons { get; set; }
    public DbSet<Statss> Statss { get; set; }
    public DbSet<Abilities> Abilities { get; set; }
    public DbSet<PokemonAbilities> PokemonAbilities { get; set; }
    public DbSet<Moves> Moves { get; set; }
    public DbSet<PokemonMoves> PokemonMoves { get; set; }
    public DbSet<Images> Images { get; set; }
    public DbSet<PokemonImages> PokemonImages { get; set; }
    public DbSet<UsersPokemons> UsersPokemons { get; set; }
    public DbSet<Typess> Types { get; set; }
    public DbSet<PokemonType> PokemonType { get; set; }




  }
}
