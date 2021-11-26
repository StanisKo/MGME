using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class NonPlayerCharacter : BaseEntity
    {
        [Required]
        [StringLength(254)]
        public string Name { get; set; }

        public string Description { get; set; }

        public ICollection<Adventure> Adventures { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }

        /*
        FK to PlayerCharacter is nullable, since NPC can exist
        without PlayerCharacter and in such case is able to take
        part in multiple Adventures
        */
        [ForeignKey("PlayerCharacter")]
        public int? PlayerCharacterId { get; set; }
        public PlayerCharacter PlayerCharacter { get; set; }
    }
}