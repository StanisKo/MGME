using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    // We reuse this DTO for updates, and therefore it includes some DA validations
    public class GetOrUpdateUserDTO : BaseEntityDTO
    {
        [StringLength(254, MinimumLength = 6)]
        public string Name { get; set; }

        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; }
   }
}