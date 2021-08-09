using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.FateQuestionService
{
    public class FateQuestionService : IFateQuestionService
    {
        /*
        Method receives roll result as param and not used roll service from DI,
        Since there are no use cases where this service will be called via a dedicated endpoint
        */
        public (bool answer, bool exceptional) AnswerFateQuestion(int odds, int chaosFactor, int rollResult)
        {
            int lowerMargin  = _oddsAndMargins[odds, chaosFactor, 0];

            int normalMargin = _oddsAndMargins[odds, chaosFactor, 1];

            int higherMargin = _oddsAndMargins[odds, chaosFactor, 2];

            (bool answer, bool exceptional) answer = (false, false);

            // If roll is within the normal margin, the answer is yes
            if (rollResult <= normalMargin)
            {
                answer.answer = true;
            }

            // If roll falls outside of normal margin, then the answer is exceptional
            if (rollResult <= lowerMargin || rollResult >= higherMargin)
            {
                answer.exceptional = true;
            }

            return answer;
        }

        /*
        Declared as matrix and not jagged array to avoid typing out initialization syntax

        of new int[][] { new int[] { ... } } for every row that corresponds to the odd
        */
        private readonly int[,,] _oddsAndMargins = new int[11, 9, 3]
        {
            {
                { 0, -20, 77 }, { 0, 0, 81 }, { 0, 0, 81 },

                { 1, 5, 82 }, { 1, 5, 82 }, { 2, 10, 83 },

                { 3, 15, 84 }, { 5, 25, 86 }, { 10, 50, 91 }
            },

            {
                { 0, 0, 81 }, { 1, 5, 82 }, { 1, 5, 82 },

                { 2, 10, 83 }, { 3, 15, 84 }, { 5, 25, 86 },

                { 7, 35, 88 }, { 10, 50, 91 }, { 15, 75, 96 }
            },

            {
                { 1, 5, 82 }, { 1, 5, 82 }, { 2, 10, 83 },

                { 3, 15, 84 }, { 5, 25, 86 }, { 9, 45, 90 },

                { 10, 50, 91 }, { 13, 65, 94 }, { 15, 85, 97 }
            },

            {
                { 1, 5, 82 }, { 2, 10, 83 }, { 3, 15, 84 },

                { 4, 20, 85 }, { 7, 35, 88 }, { 10, 50, 91 },

                { 11, 55, 92 }, { 15, 75, 96 }, { 18, 90, 99 }
            },

            {
                { 2, 10, 83 }, { 3, 15, 84 }, { 5, 25, 86 },

                { 7, 35, 88 }, { 10, 50, 91 }, { 13, 65, 94 },

                { 15, 75, 96 }, { 16, 85, 97 }, { 19, 95, 100 }
            },

            {
                { 4, 20, 85 }, { 5, 25, 86 }, { 9, 45, 90 },

                { 10, 50, 91 }, { 13, 65, 94 }, { 16, 80, 97 },

                { 16, 85, 97 }, { 18, 90, 99 }, { 19, 95, 100 }
            },

            {
                { 5, 25, 86 }, { 7, 35, 88 }, { 10, 50, 91 },

                { 11, 55, 92 }, { 15, 75, 96 }, { 16, 85, 97 },

                { 18, 90, 99 }, { 19, 95, 100 }, { 20, 100, 0 }
            },

            {
                { 9, 45, 90 }, { 10, 50, 91 }, { 13, 65, 94 },

                { 15, 75, 96 }, { 16, 85, 97 }, { 18, 90, 99 },

                { 19, 95, 100 }, { 19, 95, 100 }, { 21, 105, 0 }
            },

            {
                { 10, 50, 91 }, { 11, 55, 92 }, { 15, 75, 96 },

                { 16, 80, 97 }, { 18, 90, 99 }, { 19, 95, 100 },

                { 19, 95, 100 }, { 20, 100, 0 }, { 23, 115, 0 }
            },

            {
                { 11, 55, 92 }, { 13, 65, 94 }, { 16, 80, 97 },

                { 16, 85, 97 }, { 18, 90, 99 }, { 19, 95, 100 },

                { 19, 95, 100 }, { 22, 110, 0 }, { 25, 125, 0 }
            },

            {
                { 16, 80, 97 }, { 16, 85, 97 }, { 18, 90, 99 },

                { 19, 95, 100 }, { 19, 95, 100 }, { 20, 100, 0 },

                { 20, 100, 0 }, { 26, 130, 0 }, { 26, 145, 0 }
            }
        };
    }
}