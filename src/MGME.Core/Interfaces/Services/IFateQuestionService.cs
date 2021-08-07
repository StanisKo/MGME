using MGME.Core.DTOs.FateQuestion;

namespace MGME.Core.Interfaces.Services
{
    public interface IFateQuestionService
    {
        string AnswerFateQuestion(AskFateQuestionDTO question);
    }
}