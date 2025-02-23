using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{

    [Table("PokemonMoves")]
    public class PokemonMoves
    {

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("pokemonId")]
        public int PokemonId { get; set; }


        [Column("moveId")]
        public int MoveId { get; set; }
    
    }
}
