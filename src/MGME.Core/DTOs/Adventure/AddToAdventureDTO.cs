using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Adventure
{
    public class AddToAdventureDTO
    {
        [Required]
        public int Adventure { get; set; }

        public IEnumerable<int> PlayerCharacters { get; set; }

        public IEnumerable<int> NonPlayerCharacters { get; set; }
    }
}