using System.Collections.Generic;

using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.DTOs.Adventure;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class GetPlayerCharacterDetailDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public IEnumerable<GetNonPlayerCharacterDTO> NonPlayerCharacters { get; set; }

        public IEnumerable<GetAdventureDTO> Adventures { get; set; }
    }
}