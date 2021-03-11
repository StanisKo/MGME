using System.ComponentModel.DataAnnotations;

namespace MGME.Core.Entities
{
    public class User : BaseEntity
    {
        [Required]
        [StringLength(254, MinimumLength = 6, ErrorMessage = "Name length can't be less than 8.")]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public string Role { get; set; }
    }
}