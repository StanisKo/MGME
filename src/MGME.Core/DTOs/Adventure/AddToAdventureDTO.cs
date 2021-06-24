using System.Collections.Generic;

namespace MGME.Core.DTOs.Adventure
{
    public class AddToAdventureDTO
    {
        public IEnumerable<int> PlayerCharacters { get; set; }

        public IEnumerable<int> NonPlayerCharacters { get; set; }
    }
}