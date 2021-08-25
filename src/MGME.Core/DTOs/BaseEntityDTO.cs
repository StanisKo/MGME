using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs
{
    public class BaseEntityDTO
    {
        [Required]
        public int Id { get; set; }
    }
}
