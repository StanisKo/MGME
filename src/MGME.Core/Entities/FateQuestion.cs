using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MGME.Core.Entities
{
    public class FateQuestion : BaseEntity
    {
        [Required]
        public string Question { get; set; }

        [Required]
        public bool Answer { get; set; }

        public string Interpretation { get; set; }

        [ForeignKey("SceneItem")]
        public int SceneItemId { get; set; }
        public SceneItem SceneItem { get; set; }
    }
}