using MGME.Core.Interfaces.Services;
using MGME.Core.DTOs.FateQuestion;

namespace MGME.Core.Services.FateQuestionService
{
    public class FateQuestionService : IFateQuestionService
    {
        private readonly IRollingService _rollingService;

        // TODO: double check
        private readonly int[,,] oddsAndMargins = new int[11, 9, 3]
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
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            },

            {
                {  }, {  }, {  },

                {  }, {  }, {  },

                {  }, {  }, {  }
            }
        };

        public FateQuestionService(IRollingService rollingService)
        {
            _rollingService = rollingService;
        }

        public string AnswerFateQuestion(AskFateQuestionDTO question)
        {
            throw new System.NotImplementedException();
        }
    }
}