using System;

using MGME.Core.Constants;
using MGME.Core.DTOs.FateQuestion;
using MGME.Core.DTOs.RandomEvent;
using MGME.Core.DTOs.Battle;

namespace MGME.Core.DTOs.SceneItem
{
    public class GetSceneItemListDTO : BaseEntityDTO
    {
        public SceneItemType Type { get; set; }

        public DateTime CreatedAt { get; set; }

        /*
        At one point in time, scene item can be either
        Fate Question, Random Event, or Battle
        */
        public GetFateQuestionDTO FateQuestion { get; set; }

        public GetRandomEventDTO RandomEvent { get; set; }

        public GetBattleDTO Battle { get; set; }
    }
}