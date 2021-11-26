using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs
{
    public class EntitiesToDelete
    {
        [Required]
        [MinLength(1)]
        public IEnumerable<int> Ids { get; set; }
    }
}