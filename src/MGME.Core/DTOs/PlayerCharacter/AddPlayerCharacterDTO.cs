using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.DTOs.Thread;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class AddPlayerCharacterDTO
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        // There always has to be at least one new or one existing NonPlayerCharacter
        public IEnumerable<AddNonPlayerCharacterDTO> NewNPCs { get; set; }

        public IEnumerable<int> ExistingNPCs { get; set; }

        // There always has to be at least one Thread
        [Required]
        [MinLength(1)]
        public IEnumerable<AddThreadDTO> Threads { get; set; }
    }
}