using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Adventure
{
    public class AddRemoveToFromAdventureDTO
    {
        [Required]
        public int AdventureId { get; set; }

        public IEnumerable<int> PlayerCharacters { get; set; }

        public IEnumerable<int> NonPlayerCharacters { get; set; }
    }
}
