using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class Adventure : BaseEntity
    {
        [Required]
        [StringLength(254)]
        public string Title { get; set; }

        [Required]
        public string Context { get; set; }

        [Required]
        public int ChaosFactor { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public ICollection<PlayerCharacter> Characters { get; set; }

        public ICollection<NonPlayerCharacter> NPCs { get; set; }

        public ICollection<Thread> Threads { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }
    }
}