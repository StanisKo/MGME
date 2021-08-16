using System.Collections.Generic;

using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.DTOs.Thread;

namespace MGME.Core.DTOs.Adventure
{
    public class GetAdventureDetailDTO : BaseEntityDTO
    {
        public string Title { get; set; }

        public string Context { get; set; }

        public int ChaosFactor { get; set; }

        public IEnumerable<GetPlayerCharacterDTO> PlayerCharacters { get; set; }

        public IEnumerable<GetNonPlayerCharacterDTO> NonPlayerCharacters { get; set; }

        public IEnumerable<GetThreadDTO> Threads { get; set; }
    }
}