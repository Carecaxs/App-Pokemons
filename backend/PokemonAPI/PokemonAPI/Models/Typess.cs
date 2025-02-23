using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
    [Table("Typess")]
    public class Typess
    {
        [Key]
        public int Id { get; set; }
        public string NameType { get; set; }

    }
}
