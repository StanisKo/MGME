using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    public class UpdateUserDTO
    {
        [StringLength(254, MinimumLength = 6)]
        public string Name { get; set; }

        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; }
   }
}