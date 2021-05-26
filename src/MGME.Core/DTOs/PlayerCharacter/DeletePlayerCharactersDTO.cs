using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.PlayerCharacter
{
    public class DeletePlayerCharactersDTO
    {
        [Required]
        [MinLength(1)]
        public IEnumerable<int> Ids { get; set; }
    }
}