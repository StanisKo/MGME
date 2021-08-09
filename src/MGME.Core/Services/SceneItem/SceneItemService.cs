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

        private readonly IMapper _mapper;

        public SceneItemService(IRollingService rollingService,
                                IFateQuestionService fateQuestionService,
                                IEntityRepository<Scene> sceneRepository,
                                IEntityRepository<SceneItem> sceneItemRepository,
                                IMapper mapper,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _rollingService = rollingService;
            _fateQuestionService = fateQuestionService;

            _sceneRepository = sceneRepository;
            _sceneItemRepository = sceneItemRepository;

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

                switch (newSceneItem.Type)
                {
                    case SceneItemType.FATE_QUESTION:

                        
                        break;

                    case SceneItemType.RANDOM_EVENT:
                        break;

                    case SceneItemType.BATTLE:
                        break;

                    default:
                        break;
                }

                SceneItem sceneItemToAdd = _mapper.Map<SceneItem>(newSceneItem);
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