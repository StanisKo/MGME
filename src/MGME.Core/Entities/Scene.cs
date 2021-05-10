using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using MGME.Core.Constants;

namespace MGME.Core.Entities
{
    public class Scene : BaseEntity
    {
        [Required]
        [StringLength(254)]
        public string Title { get; set; }

        public SceneType Type { get; set; }

        [Required]
        public string Setup { get; set; }

        public string InterrupEvent { get; set; }

        public string ModifiedSetup { get; set; }

        [Required]
        public bool Resolved { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public ICollection<SceneItem> SceneItems { get; set; }

        [ForeignKey("Adventure")]
        public int AdventureId { get; set; }
        public Adventure Adventure { get; set; }
    }
}