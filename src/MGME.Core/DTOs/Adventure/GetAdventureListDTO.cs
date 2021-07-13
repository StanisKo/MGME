using System;

using MGME.Core.DTOs.Thread;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.DTOs.Adventure
{
    public class GetAdventureListDTO : BaseEntityDTO
    {
        public string Title { get; set; }

        public GetThreadDTO Thread { get; set; }

        public int ThreadCount { get; set; }

        public GetPlayerCharacterDTO PlayerCharacter { get; set; }

        public int PlayerCharacterCount { get; set; }

        public GetNonPlayerCharacterDTO NonPlayerCharacter { get; set; }

        public int NonPlayerCharacterCount { get; set; }

        public int SceneCount { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}