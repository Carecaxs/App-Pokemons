using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("PokemonAbilities")]
    public class PokemonAbilities
    {

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("pokemonId")]
        public int PokemonId { get; set; }

        

        [Column("abilityId")]
        public int AbilityId { get; set; }
    
    }
}
