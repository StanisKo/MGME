using System;

using MGME.Core.Constants;

namespace MGME.Core.DTOs.Scene
{
    public class GetSceneListDTO : BaseEntityDTO
    {
        public string Title { get; set; }

        public SceneType Type { get; set; }

        public string Setup { get; set; }

        public string RandomEvent { get; set; }

        public string ModifiedSetup { get; set; }

        public bool Resolved { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}