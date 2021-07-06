using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class Thread : BaseEntity
    {
        [Required]
        [StringLength(254)]
        public string Name { get; set; }

        public string Description { get; set; }

        /*
        FKs to PlayerCharacter and Adventure are nullable,
        since Thread can either belong to a Character or to and Adventure
        and Character's threads can be used as Adventure's threads. But not vice versa
        */

        [ForeignKey("PlayerCharacter")]
        public int? PlayerCharacterId { get; set; }
        public PlayerCharacter PlayerCharacter { get; set; }

        [ForeignKey("Adventure")]
        public int? AdventureId { get; set; }
        public Adventure Adventure { get; set; }
    }
}