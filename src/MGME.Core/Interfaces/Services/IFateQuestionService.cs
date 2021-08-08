namespace MGME.Core.Interfaces.Services
{
    public interface IFateQuestionService
    {
        (bool exceptional, string answer) AnswerFateQuestion(int odds, int chaosFactor, int rollResult);
    }
}