using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.SceneItem
{
    public class UpdateSceneItemDTO : BaseEntityDTO
    {
        [Required]
        public int SceneId { get; set; }

        // We can update (interpret) only fate questions or random events, but not battles
        [Required]
        [Range(0, 1)]
        public int Type { get; set; }

        [Required]
        public string Interpretation { get; set; }
    }
}