using System.Collections.Generic;
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

        [Required]
        public bool EmailIsConfirmed { get; set; }

        [Required]
        public string Role { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; }

        public ICollection<PlayerCharacter> PlayerCharacters { get; set; }

        public ICollection<Adventure> Adventures { get; set; }

        public ICollection<NonPlayerCharacter> NonPlayerCharacters { get; set; }

        public ICollection<Thread> Threads { get; set; }
    }
}