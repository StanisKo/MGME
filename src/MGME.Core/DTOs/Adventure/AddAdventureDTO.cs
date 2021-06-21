using System.Collections.Generic;

using MGME.Core.DTOs.Thread;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.DTOs.Adventure
{
    public class AddAdventureDTO
    {
        public string Title { get; set; }

        public string Context { get; set; }

        public IEnumerable<int> PlayerCharactersToAdd { get; set; }

        public IEnumerable<AddThreadDTO> ThreadsToAdd { get; set; }

        public IEnumerable<AddNonPlayerCharacterDTO> NewNonPlayerCharactersToAdd { get; set; }

        public IEnumerable<int> ExistingNonPlayerCharactersToAdd { get; set; }
    }
}