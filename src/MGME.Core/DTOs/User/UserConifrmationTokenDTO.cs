using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.User
{
    public class UserConifrmationTokenDTO
    {
        [Required]
        public string Token { get; set; }
    }
}