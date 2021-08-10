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

        /*
        Question, Odds, and ChaosFactor are necessary only if
        type of scene item is fate question, otherwise nullable
        */
        public string Question { get; set; }

        public int? Odds { get; set; }

        public int? ChaosFactor { get; set; }

        /*
        Outcome is necessary only if type of scene
        is battle, otherwise nullable
        */
        public string Outcome { get; set; }
    }
}