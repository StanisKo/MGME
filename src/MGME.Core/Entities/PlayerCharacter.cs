using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class PlayerCharacter : BaseEntity
    {
        [Required]
        [StringLength(254)]
        public string Name { get; set; }

        public string Description { get; set; }

        public ICollection<Adventure> Adventures { get; set; }

        public ICollection<NonPlayerCharacter> NonPlayerCharacters { get; set; }

        public ICollection<Thread> Threads { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }
    }
}