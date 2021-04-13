using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    public class ChangeUserPasswordDTO
    {
        [Required]
        [StringLength(254, MinimumLength = 8)]
        public string OldPassword { get; set; }

        [Required]
        [StringLength(254, MinimumLength = 8)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        [StringLength(254, MinimumLength = 8)]
        public string ConfirmPassword { get; set; }
    }
}