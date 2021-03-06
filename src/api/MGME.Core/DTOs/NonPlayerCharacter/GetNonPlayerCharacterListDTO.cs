using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.PlayerCharacter;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class GetNonPlayerCharacterListDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public GetPlayerCharacterDTO PlayerCharacter { get; set; }

        public GetAdventureDTO Adventure { get; set; }

        public int? AdventureCount { get; set; }
    }
}