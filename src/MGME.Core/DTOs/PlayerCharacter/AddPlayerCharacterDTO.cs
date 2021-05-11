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

        public IEnumerable<AddNonPlayerCharacterDTO> NewNonPlayerCharacters { get; set; }

        public IEnumerable<int> ExistingNonPlayerCharacters { get; set; }

        [Required]
        [MinLength(1)]
        public IEnumerable<AddThreadDTO> Threads { get; set; }
    }
}