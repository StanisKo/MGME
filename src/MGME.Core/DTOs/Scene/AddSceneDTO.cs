using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using MGME.Core.Constants;

namespace MGME.Core.DTOs.Scene
{
    public class AddSceneDTO
    {
        [Required]
        [StringLength(254)]
        public string Title { get; set; }

        public SceneType? Type { get; set; }

        [Required]
        public string Setup { get; set; }

        
    }
}