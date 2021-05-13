using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddToPlayerCharacterDTO
    {
        [Required]
        public int NonPlayerCharacterId { get; set; }

        [Required]
        public int PlayerCharacterId { get; set; }
    }
}