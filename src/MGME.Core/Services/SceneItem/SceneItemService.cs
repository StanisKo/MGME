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
                bool providedSceneIdIsValid = await _sceneRepository.CheckIfEntityExistsAsync(
                    scene => scene.Id == newSceneItem.SceneId && scene.Adventure.UserId == userId
                );

                if (!providedSceneIdIsValid)
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

                        response.Message = "Fate question was successfully added";

                        break;

                    case SceneItemType.RANDOM_EVENT:

                        string randomEventDescription = _randomEventService.GenerateRandomEvent();

                        RandomEvent randomEventToAdd = new RandomEvent()
                        {
                            SceneItemId = sceneItemToAdd.Id,
                            Description = randomEventDescription
                        };

                        await _randomEventRepository.AddEntityAsync(randomEventToAdd);

                        response.Message = "Random event was successfully added";

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

        public async Task <BaseServiceResponse> UpdateSceneItem(UpdateSceneItemDTO updatedSceneItem)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                if (updatedSceneItem.Type == (int)SceneItemType.FATE_QUESTION)
                {
                    FateQuestion fateQuestionToUpdate = await _fateQuestionRepository.GetEntityAsync(
                        predicate: fateQuestion => fateQuestion.SceneItemId == updatedSceneItem.Id
                            && fateQuestion.SceneItem.Scene.Adventure.UserId == userId
                    );

                    if (fateQuestionToUpdate == null)
                    {
                        response.Success = false;
                        response.Message = "Fate question with such id does not exist";

                        return response;
                    }

                    /*
                    To avoid unnecessary complexity, the skipping of interpretation
                    is not marked by any specific field, but by a string written into
                    Interpretation field by a client

                    E.g., whenever user wants to skip interpretation, client must
                    provide immutable string -- "Interpretation Skipped", effectively
                    cancelling future updates and using said string for display purposes
                    */
                    if (fateQuestionToUpdate.Interpretation != null)
                    {
                        response.Success = false;
                        response.Message = "Interpretation of this fate question was either already provided or skipped";

                        return response;
                    }

                    fateQuestionToUpdate.Interpretation = updatedSceneItem.Interpretation;

                    await _fateQuestionRepository.UpdateEntityAsync(
                        fateQuestionToUpdate,
                        new[]
                        {
                            "Interpretation"
                        }
                    );

                    response.Success = true;
                    response.Message = "Fate Question was successfully updated";
                }
                // Otherwise it's random event
                else
                {
                    RandomEvent randomEventToUpdate = await _randomEventRepository.GetEntityAsync(
                        predicate: randomEvent => randomEvent.SceneItemId == updatedSceneItem.Id
                            && randomEvent.SceneItem.Scene.Adventure.UserId == userId
                    );

                    if (randomEventToUpdate == null)
                    {
                        response.Success = false;
                        response.Message = "Random Event with such id does not exist";

                        return response;
                    }

                    /*
                    To avoid unnecessary complexity, the skipping of interpretation
                    is not marked by any specific field, but by a string written into
                    Interpretation field by a client

                    E.g., whenever user wants to skip interpretation, client must
                    provide immutable string -- "Interpretation Skipped", effectively
                    cancelling future updates and using said string for display purposes
                    */
                    if (randomEventToUpdate.Interpretation != null)
                    {
                        response.Success = false;
                        response.Message = "Interpretation of this random event was either already provided or skipped";

                        return response;
                    }

                    randomEventToUpdate.Interpretation = updatedSceneItem.Interpretation;

                    await _randomEventRepository.UpdateEntityAsync(
                        randomEventToUpdate,
                        new[]
                        {
                            "Interpretation"
                        }
                    );

                    response.Success = true;
                    response.Message = "Random Event was successfully updated";
                }
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