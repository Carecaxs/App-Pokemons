using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("Moves")]
    public class Moves
    {

        [Key]
        [Column("id")]
        public int Id { get; set; }


        [Column("nameMove")]
        public string NameMove { get; set; }
    }
}
