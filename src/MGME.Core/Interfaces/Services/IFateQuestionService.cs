using MGME.Core.DTOs.FateQuestion;

namespace MGME.Core.Interfaces.Services
{
    public interface IFateQuestionService
    {
        (bool exceptional, string answer) AnswerFateQuestion(AskFateQuestionDTO question);
    }
}