using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class UpdatePlayerCharacterDTO
    {
        [Required]
        public int Id { get; set; }

        [StringLength(254)]
        public string Name { get; set; }

        public string Description { get; set; }
    }
}