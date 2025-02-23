using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonAPI.Models
{

    [Table("Images")]
    public class Images
    {
        [Key]
        [Column("id")]

        public int Id { get; set; }


        [Column("urlImage")]
        public string UrlImage { get; set; }

    }
}
