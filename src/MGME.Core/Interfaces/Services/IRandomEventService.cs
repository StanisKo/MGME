namespace MGME.Core.Interfaces.Services
{
    public interface IRandomEventService
    {
        string DetermineEventFocus();

        string DetermineEventMeaningAndSubject();
    }
}