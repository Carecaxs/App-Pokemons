using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{
  [Table("Abilities")]
  public class Abilities
  {
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nameAbility")]
    public string NameAbility { get; set; }
  }
}
