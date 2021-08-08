namespace MGME.Core.Interfaces.Services
{
    public interface IFateQuestionService
    {
        (string answer, bool exceptional) AnswerFateQuestion(int odds, int chaosFactor, int rollResult);
    }
}