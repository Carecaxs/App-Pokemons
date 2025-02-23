using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("Pokemons")]

    public class Pokemon
    {

        [Key]
        [Column("id")]
        public int id { get; set; }

        [Column("nameP")]
        public string nameP { get; set; }


        [Column("baseExperience")]
        public int baseExperience { get; set; }

        [Column("height")]
        public int height { get; set; }

        [Column("weightP")]
        public int weightP { get; set; }

        [Column("sound_url")]
        public string sound_url { get; set; }

        [Column("principalImage")]
        public string principalImage { get; set; }





    }
}
