namespace MGME.Core.DTOs.FateQuestion
{
    public class GetFateQuestionDTO
    {
        public string Question { get; set; }

        public bool Answer { get; set; }

        public bool Exceptional { get; set; }

        public int RollResult { get; set; }

        public string Interpretation { get; set; }
    }
}