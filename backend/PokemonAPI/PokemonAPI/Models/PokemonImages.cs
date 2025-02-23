using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{

    [Table("PokemonImages")]
    public class PokemonImages
    {

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("pokemonId")]
        public int PokemonId { get; set; }
   

        [Column("imageId")]
        public int ImageId { get; set; }
      
    }
}
