namespace PokemonAPI.Models.DTOs
{
    public class AddPokemonDto
    {

        public string Name { get; set; }
        public int BaseExperiencia { get; set; }
        public int Height { get; set; }
        public int Weight { get; set; }
        public string Sound { get; set; }
        public string principalImage { get; set; }

        public StatsDto Stats { get; set; }
        public List<TypeDto> Types { get; set; }
        public List<AbilityDto> Abilities { get; set; }
        public List<MoveDto>  Moves { get; set; }
        public List<ImagesDto> Images { get; set; }



    }
}
