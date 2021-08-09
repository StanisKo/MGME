using System.ComponentModel.DataAnnotations;

using MGME.Core.Constants;

namespace MGME.Core.DTOs.SceneItem
{
    public class AddSceneItemDTO
    {
        [Required]
        public int SceneId { get; set; }

        [Required]
        public SceneItemType Type { get; set; }

        // Provided if scene item is a fate question, otherwise nullable
        public string FateQuestion { get; set; }
    }
}