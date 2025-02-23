using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("UsersPokemons")]
    public class UsersPokemons
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("idPokemon")]
        public int idPokemon { get; set; }

  

        [Column("userId")]
        public int userId { get; set; }
    
    }
}
