using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class UpdatePlayerCharacterDTO : BaseEntityDTO
    {
        [StringLength(254)]
        public string Name { get; set; }

        public string Description { get; set; }
    }
}
