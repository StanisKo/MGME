using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddToAdventureDTO
    {
        [Required]
        public int NonPlayerCharacterId { get; set; }

        [Required]
        public int AdventureId { get; set; }
    }
}