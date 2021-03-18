using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    public class UserConfirmEmailDTO
    {
        [Required]
        public string Token { get; set; }
    }
}