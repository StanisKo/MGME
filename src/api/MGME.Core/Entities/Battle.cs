using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class Battle : BaseEntity
    {
        [Required]
        public string Outcome { get; set; }

        [ForeignKey("SceneItem")]
        public int SceneItemId { get; set; }
        public SceneItem SceneItem { get; set; }
    }
}