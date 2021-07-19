using System.Collections.Generic;

using MGME.Core.DTOs.Thread;
using MGME.Core.DTOs.NonPlayerCharacter;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Adventure
{
    public class AddAdventureDTO
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Context { get; set; }

        public int ChaosFactor { get; set; }

        // There always has to be at least one PlayerCharacter
        [Required]
        [MinLength(1)]
        public IEnumerable<int> PlayerCharacters { get; set; }

        // There always has to be at least one Thread
        [Required]
        [MinLength(1)]
        public IEnumerable<AddThreadDTO> Threads { get; set; }

        // There always has to be at least one new or one existing NonPlayerCharacter
        public IEnumerable<AddNonPlayerCharacterDTO> NewNonPlayerCharacters { get; set; }

        public IEnumerable<int> ExistingNonPlayerCharacters { get; set; }
    }
}