using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using MGME.Core.Constants;

namespace MGME.Core.Entities
{
    public class SceneItem : BaseEntity
    {
        [Required]
        public SceneItemType Type { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [ForeignKey("Scene")]
        public int SceneId { get; set; }
        public Scene Scene { get; set; }
    }
}