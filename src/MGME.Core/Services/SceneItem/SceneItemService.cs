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

        private readonly IFateQuestionService _fateQuestionService;

        private readonly IEntityRepository<Scene> _sceneRepository;

        private readonly IEntityRepository<SceneItem> _sceneItemRepository;

        private readonly IEntityRepository<FateQuestion> _fateQuestionRepository;

        private readonly IMapper _mapper;

        public SceneItemService(IRollingService rollingService,
                                IFateQuestionService fateQuestionService,
                                IEntityRepository<Scene> sceneRepository,
                                IEntityRepository<SceneItem> sceneItemRepository,
                                IEntityRepository<FateQuestion> fateQuestionRepository,
                                IMapper mapper,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _rollingService = rollingService;
            _fateQuestionService = fateQuestionService;

            _sceneRepository = sceneRepository;
            _sceneItemRepository = sceneItemRepository;
            _fateQuestionRepository = fateQuestionRepository;

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

                        // At this point, client must've provided a question, odds, and chaos factor
                        if (newSceneItem.FateQuestion == null || newSceneItem.Odds == null || newSceneItem.ChaosFactor == null)
                        {
                            response.Success = false;
                            response.Message = "Fate question, odds, and chaos factor are all required to ask a fate question";

                            return response;
                        }

                        int rollResult = _rollingService.Roll1D100();

                        (bool answer, bool exceptional) answer = _fateQuestionService.AnswerFateQuestion(
                            (int)newSceneItem.Odds, (int)newSceneItem.ChaosFactor, rollResult
                        );

                        FateQuestion fateQuestionToAdd = new FateQuestion()
                        {
                            SceneItemId = sceneItemToAdd.Id,
                            Question = newSceneItem.FateQuestion,
                            Answer = answer.answer,
                            Exceptional = answer.exceptional,
                            RollResult = rollResult
                        };

                        // What happens on roll result? If conditions met, do we create new random event item here
                        // or let fe handle it?

                        await _fateQuestionRepository.AddEntityAsync(fateQuestionToAdd);

                        response.Message = "Fate Question was successfully added";

                        break;

                    case SceneItemType.RANDOM_EVENT:
                        break;

                    case SceneItemType.BATTLE:
                        break;

                    default:
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