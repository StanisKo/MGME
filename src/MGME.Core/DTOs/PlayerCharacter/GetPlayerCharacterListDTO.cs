using MGME.Core.DTOs.Thread;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class GetPlayerCharacterListDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public GetThreadDTO Thread { get; set; }

        public int? ThreadCount { get; set; }

        public GetAdventureDTO Adventure { get; set; }

        public int? AdventureCount { get; set; }

        public GetNonPlayerCharacterDTO NonPlayerCharacter { get; set; }

        public int? NonPlayerCharacterCount { get; set; }
    }
}