using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class Thread : BaseEntity
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        [ForeignKey("PlayerCharacter")]
        public int? PlayerCharacterId { get; set; }
        public PlayerCharacter Character { get; set; }

        [ForeignKey("Adventure")]
        public int? AdventureId { get; set; }
        public Adventure Adventure { get; set; }
    }
}