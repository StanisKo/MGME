using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class AddNonPlayerCharacterDTO
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public int PlayerCharacter { get; set; }
    }
}