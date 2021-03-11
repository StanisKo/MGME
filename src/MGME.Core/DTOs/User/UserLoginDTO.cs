using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    public class UserLoginDTO
    {
        [StringLength(254, MinimumLength = 6)]
        [Required]
        public string Name { get; set; }

        [Required]
        [StringLength(254, MinimumLength = 8)]
        public string Password { get; set; }
    }
}