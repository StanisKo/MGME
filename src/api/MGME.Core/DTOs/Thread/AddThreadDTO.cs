using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Thread
{
    public class AddThreadDTO
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
    }
}