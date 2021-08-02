using System.Collections.Generic;

using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.RandomEventService
{
    public class RandomEventService : IRandomEventService
    {
        private IRollingService _rollingService;

        public RandomEventService(IRollingService rollingService)
        {
            _rollingService = rollingService;
        }

        public string DetermineEventFocus()
        {
            int rollResult = _rollingService.Roll1D100();

            string eventFocus = rollResult switch
            {
                <= 7 => "Remote event",

                (> 7) and (<= 28) => "NPC action",

                (> 28) and (<= 35) => "Introduce new NPC",

                (> 35) and (<= 45) => "Move toward a thread",

                (> 45) and (<= 52) => "Move away from a thread",

                (> 52) and (<= 55) => "Close a thread",

                (> 55) and (<= 67) => "PC negative",

                (> 67) and (<= 75) => "PC positive",

                (> 75) and (<= 83) => "Ambiguous event",

                (> 83) and (<= 92) => "NPC negative",

                (> 92) and (<= 100) => "NPC positive",

                >= 101 => "Invalid"
            };

            return eventFocus;
        }

        public string DetermineEventMeaningAndSubject()
        {
            throw new System.NotImplementedException();
        }
    }
}