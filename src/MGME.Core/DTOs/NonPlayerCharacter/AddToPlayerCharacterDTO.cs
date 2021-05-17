using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddToPlayerCharacterOrAdventureDTO
    {
        [Required]
        [MinLength(1)]
        public IEnumerable<int> NonPlayerCharacterId { get; set; }

        // Either PlayerCharacterId or AdventureId must be provided
        public int? PlayerCharacterId { get; set; }

        public int? AdventureId { get; set; }
    }
}