using System.Collections.Generic;

using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.Adventure;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class GetNonPlayerCharacterDetailDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public GetPlayerCharacterDTO PlayerCharacter { get; set; }

        public IEnumerable<GetAdventureDTO> Adventures { get; set; }
    }
}