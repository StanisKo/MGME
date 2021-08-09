using System;

using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.RandomEventService
{
    /*
    We don't make it static to make it avialable via DI and make use of interfaces
    But register it as Singleton, so only one instance is created
    */
    public class RandomEventService : IRandomEventService
    {
        private readonly IRollingService _rollingService;

        public RandomEventService(IRollingService rollingService)
        {
            _rollingService = rollingService;
        }

        public string GenerateRandomEvent() => $"{DetermineEventFocus()}: {DetermineEventMeaning()}";

        private string DetermineEventFocus()
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

                >= 101 => throw new Exception("Unsuporrted roll value was provided")
            };

            return eventFocus;
        }

        private string DetermineEventMeaning()
        {
            string eventAction = _eventAction[_rollingService.Roll1D100() - 1];

            string eventSubject = _eventSubject[_rollingService.Roll1D100() - 1];

            return $"{eventAction} {eventSubject}";
        }

        private readonly string[] _eventAction = new string[100]
        {
            "Attainment", "Starting", "Neglect", "Fight", "Recruit", "Triumph", "Violate", "Oppose", "Malice",

            "Communicate", "Persecute", "Increase", "Decrease", "Abandon", "Gratify", "Inquire", "Antagonise",

            "Move", "Waste", "Truce", "Release", "Befriend", "Judge", "Desert", "Dominate", "Procrastinate",

            "Praise", "Separate", "Take", "Break", "Heal", "Delay", "Stop", "Lie", "Return", "Immitate", "Struggle",

            "Inform", "Bestow", "Postpone", "Expose", "Haggle", "Imprison", "Release", "Celebrate", "Develop",

            "Travel", "Block", "Harm", "Debase", "Overindulge", "Adjourn", "Adversity", "Kill", "Disrupt", "Usurp",

            "Create", "Betray", "Agree", "Abuse", "Oppress", "Inspect", "Ambush", "Spy", "Attach", "Carry", "Open",

            "Carelessness", "Ruin", "Extravagance", "Trick", "Arrive", "Propose", "Divide", "Refuse", "Mistrust",

            "Deceive", "Cruelty", "Intolerance", "Trust", "Excitement", "Activity", "Assist", "Care", "Negligence",

            "Passion", "Work hard", "Control", "Attract", "Failure", "Pursue", "Vengeance", "Proceedings", "Dispute",

            "Punish", "Guide", "Transform", "Overthrow", "Oppress", "Change"
        };

        private readonly string[] _eventSubject = new string[100]
        {
            "Goals", "Dreams", "Environment", "Outside", "Inside", "Reality", "Allies", "Enemies", "Evil", "Good",

            "Emotions", "Opposition", "War", "Peace", "The innocent", "Love", "The spiritual", "The intellectual",

            "New ideas", "Joy", "Messages", "Energy", "Balance", "Tension", "Friendship", "The physical", "A project",

            "Pleasures", "Pain", "Possessions", "Benefits", "Plans", "Lies", "Expectations", "Legal matters", "Bureaucracy",

            "Business", "A path", "News", "Exterior factors", "Advice", "A plot", "Competition", "Prison", "Illness",

            "Food", "Attention", "Success", "Failure", "Travel", "Jealousy", "Dispute", "Home", "Investment", "Suffering",

            "Wishes", "Tactics", "Stalemate", "Randomness", "Misfortune", "Death", "Disruption", "Power", "A burden",

            "Intrigues", "Fears", "Ambush", "Rumor", "Wounds", "Extravagance", "A representative", "Adversities", "Opulence",

            "Liberty", "Military", "The mundane", "Trials", "Masses", "Vehicle", "Art", "Victory", "Dispute", "Riches",

            "Status quo", "Technology", "Hope", "Magic", "Illusions", "Portals", "Danger", "Weapons", "Animals", "Weather",

            "Elements", "Nature", "The public", "Leadership", "Fame", "Anger", "Information"
        };
    }
}