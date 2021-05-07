using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class RandomEvent : BaseEntity
    {
        [Required]
        public int Focus { get; set; }

        [Required]
        public int Meaning { get; set; }

        public string Interpetation { get; set; }

        [ForeignKey("SceneItem")]
        public int SceneItemId { get; set; }
        public SceneItem SceneItem { get; set; }
    }
}