using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("PokemonType")]
    public class PokemonType
    {
        [Key]
        public int Id { get; set; }
        public int idType { get; set; }
        public int pokemonId { get; set; }


    }
}
