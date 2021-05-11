using System.Collections.Generic;

using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class GetPlayerCharacterDetailDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public List<GetNonPlayerCharacterDTO> NonPlayerCharacters { get; set; }
    }
}