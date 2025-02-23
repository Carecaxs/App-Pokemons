using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace PokemonAPI.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("passwordd")]
        public string Passwordd { get; set; }

        [Column("fullName")]
        public string FullName { get; set; }

    }
}
