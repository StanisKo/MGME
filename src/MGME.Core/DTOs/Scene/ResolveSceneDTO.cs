using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Scene
{
    public class ResolveSceneDTO
    {
        [Required]
        public int AdventureId { get; set; }

        [Required]
        public int SceneId { get; set; }
    }
}