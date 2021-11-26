using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddNonPlayerCharacterDTO
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        // Nullable if we want to add NPCs without binding them to PlayerCharacters
        public int? PlayerCharacterId { get; set; }

        // Is here for when we want to add new NonPlayerCharacter to the Adventure
        public int? AdventureId { get; set; }
    }
}
