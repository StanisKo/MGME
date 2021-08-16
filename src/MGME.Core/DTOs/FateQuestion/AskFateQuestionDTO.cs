using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs.FateQuestion
{
    public class AskFateQuestionDTO
    {
        [Required]
        public string Question { get; set; }

        [Required]
        [Range(0, 10)]
        public int Odds { get; set; }

        [Required]
        [Range(0, 8)]
        public int AdventureChaosFactor { get; set; }
    }
}