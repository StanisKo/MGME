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
        FateQuestion, Odds, and ChaosFactor are necessary only if
        type of scene item is fate question, otherwise nullable
        */
        public string FateQuestion { get; set; }

        public int? Odds { get; set; }

        public int? ChaosFactor { get; set; }

        /*
        Battle outcome is necessary only if type of scene
        is battle, otherwise nullable
        */
        public string BattleOutcome { get; set; }
    }
}