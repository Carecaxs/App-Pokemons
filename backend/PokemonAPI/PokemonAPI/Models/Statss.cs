using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("Statss")]
    public class Statss
    {

        [Key]
        [Column("id")]
        public int id { get; set; }

        [Column("hp")]
        public int hp { get; set; }

        [Column("attack")]
        public int attack { get; set; }

        [Column("defense")]
        public int defense { get; set; }

        [Column("specialAttack")]
        public int specialAttack { get; set; }

        [Column("specialDefense")]
        public int specialDefense { get; set; }

        [Column("speed")]
        public int speed { get; set; }

        [Column("idPokemon")]
        public int idPokemon { get; set; }



    }
}
