namespace MGME.Core.Interfaces.Services
{
    public interface IFateQuestionService
    {
        (bool answer, bool exceptional) AnswerFateQuestion(int odds, int chaosFactor, int rollResult);
    }
}