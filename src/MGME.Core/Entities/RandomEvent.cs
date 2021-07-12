using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class RandomEvent : BaseEntity
    {
        [Required]
        public string Focus { get; set; }

        [Required]
        public string Meaning { get; set; }

        public string Interpetation { get; set; }

        [ForeignKey("SceneItem")]
        public int SceneItemId { get; set; }
        public SceneItem SceneItem { get; set; }
    }
}