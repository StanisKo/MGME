using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.Scene
{
    public class AddSceneDTO
    {
        [Required]
        [StringLength(254)]
        public string Title { get; set; }

        [Required]
        public string Setup { get; set; }

        [Required]
        public int AdventureId { get; set; }

        public int? AdventureChaosFactor { get; set; }

        /*
        Client may provide RandomEvent string in case if that's a first scene
        That was seeded with random event
        */
        public string RandomEvent { get; set; }
    }
}