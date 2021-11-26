using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class AddToPlayerCharacterDTO
    {
        [Required]
        public int PlayerCharacterId { get; set; }

        [Required]
        [MinLength(1)]
        public IEnumerable<int> NonPlayerCharacters { get; set; }
    }
}
