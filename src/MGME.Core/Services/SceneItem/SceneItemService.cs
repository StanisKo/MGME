using System;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.DTOs;
using MGME.Core.DTOs.SceneItem;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.SceneItemService
{
    public class SceneItemService : BaseEntityService, ISceneItemService
    {
        private readonly IRollingService _rollingService;

        private readonly IRandomEventService _randomEventService;

        private readonly IFateQuestionService _fateQuestionService;

        private readonly IEntityRepository<Scene> _sceneRepository;

        private readonly IEntityRepository<SceneItem> _sceneItemRepository;

        private readonly IEntityRepository<FateQuestion> _fateQuestionRepository;

        private readonly IEntityRepository<RandomEvent> _randomEventRepository;

        private readonly IEntityRepository<Battle> _battleRepository;

        private readonly IMapper _mapper;

        public SceneItemService(IRollingService rollingService,
                                IRandomEventService randomEventService,
                                IFateQuestionService fateQuestionService,
                                IEntityRepository<Scene> sceneRepository,
                                IEntityRepository<SceneItem> sceneItemRepository,
                                IEntityRepository<FateQuestion> fateQuestionRepository,
                                IEntityRepository<RandomEvent> randomEventRepository,
                                IEntityRepository<Battle> battleRepository,
                                IMapper mapper,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _rollingService = rollingService;
            _fateQuestionService = fateQuestionService;
            _randomEventService = randomEventService;

            _sceneRepository = sceneRepository;
            _sceneItemRepository = sceneItemRepository;
            _fateQuestionRepository = fateQuestionRepository;
            _randomEventRepository = randomEventRepository;
            _battleRepository = battleRepository;

            _mapper = mapper;
        }

        public async Task <BaseServiceResponse> AddSceneItem(AddSceneItemDTO newSceneItem)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                Scene sceneToAddItemTo = await _sceneRepository.GetEntityAsync(
                    id: newSceneItem.SceneId,
                    predicate: scene => scene.Adventure.UserId == userId
                );

                if (sceneToAddItemTo == null)
                {
                    response.Success = false;
                    response.Message = "Scene with such id does not exist";

                    return response;
                }

                SceneItem sceneItemToAdd = _mapper.Map<SceneItem>(newSceneItem);

                await _sceneItemRepository.AddEntityAsync(sceneItemToAdd);

                switch (newSceneItem.Type)
                {
                    case SceneItemType.FATE_QUESTION:

                        // At this point, client must have provided a question, odds, and chaos factor
                        if (newSceneItem.Question == null || newSceneItem.Odds == null || newSceneItem.ChaosFactor == null)
                        {
                            response.Success = false;
                            response.Message = "Question, odds, and chaos factor are all required to ask a fate question";

                            return response;
                        }

                        int rollResult = _rollingService.Roll1D100();

                        (bool answer, bool exceptional) answer = _fateQuestionService.AnswerFateQuestion(
                            (int)newSceneItem.Odds, (int)newSceneItem.ChaosFactor, rollResult
                        );

                        FateQuestion fateQuestionToAdd = new FateQuestion()
                        {
                            SceneItemId = sceneItemToAdd.Id,
                            Question = newSceneItem.Question,
                            Answer = answer.answer,
                            Exceptional = answer.exceptional,
                            RollResult = rollResult
                        };

                        await _fateQuestionRepository.AddEntityAsync(fateQuestionToAdd);

                        response.Message = "Fate Question was successfully added";

                        break;

                    case SceneItemType.RANDOM_EVENT:

                        string randomEventDescription = _randomEventService.GenerateRandomEvent();

                        RandomEvent randomEventToAdd = new RandomEvent()
                        {
                            SceneItemId = sceneItemToAdd.Id,
                            Description = randomEventDescription
                        };

                        await _randomEventRepository.AddEntityAsync(randomEventToAdd);

                        response.Message = "Random Event was successfully added";

                        break;

                    case SceneItemType.BATTLE:

                        // At this point, client must have provided outcome
                        if (newSceneItem.Outcome == null)
                        {
                            response.Success = false;
                            response.Message = "Outcome is required to create a battle";

                            return response;
                        }

                        Battle battleToAdd = new Battle()
                        {
                            SceneItemId = sceneItemToAdd.Id,
                            Outcome = newSceneItem.Outcome
                        };

                        await _battleRepository.AddEntityAsync(battleToAdd);

                        response.Message = "Battle was successfully added";

                        break;
                }

                response.Success = true;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }
    }
}