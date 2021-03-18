using System.ComponentModel.DataAnnotations;

/*
https://stackoverflow.com/questions/13237193/data-annotation-to-validate-confirm-password

also check for confirm password with DA
*/

namespace MGME.Core.DTOs.User
{
    public class UserRegisterDTO
    {
        [Required]
        [StringLength(254, MinimumLength = 6)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; }

        [Required]
        [StringLength(254, MinimumLength = 8)]
        public string Password { get; set; }
    }
}
