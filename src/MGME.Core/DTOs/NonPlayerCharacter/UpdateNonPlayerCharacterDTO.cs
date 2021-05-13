using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.NonPlayerCharacter
{
    public class UpdateNonPlayerCharacterDTO
    {
        [Required]
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
    }
}