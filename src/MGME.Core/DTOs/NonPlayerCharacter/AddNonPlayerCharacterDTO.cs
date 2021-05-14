using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddNonPlayerCharacterDTO
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        // Nullable if we want to add NPCs without binding them to PlayerCharacter
        public int? PlayerCharacter { get; set; }
    }
}