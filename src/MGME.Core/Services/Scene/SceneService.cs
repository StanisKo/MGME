using System;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.SceneService
{
    public class SceneService : BaseEntityService, ISceneService
    {
        private readonly IEntityRepository<Scene> _repository;

        private readonly IRollingService _rollingService;

        private readonly IRandomEventService _randomEventService;

        private readonly IMapper _mapper;

        public SceneService(IEntityRepository<Scene> repository,
                            IRollingService rollingService,
                            IRandomEventService randomEventService,
                            IMapper mapper,
                            IHttpContextAccessor httpContextAccessor): base(httpContextAccessor)
        {
            _repository = repository;
            _rollingService = rollingService;
            _randomEventService = randomEventService;

            _mapper = mapper;
        }

        public async Task <BaseServiceResponse> AddScene(AddSceneDTO newScene)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                int scenesCount = await _repository.GetEntitiesCountAsync(
                    scene => scene.AdventureId == newScene.AdventureId
                );

                // It's the first scene in adventure
                if (scenesCount == 0)
                {
                    Scene firstSceneToCreate = _mapper.Map<Scene>(newScene);

                    firstSceneToCreate.Type = SceneType.NORMAL;

                    await _repository.AddEntityAsync(firstSceneToCreate);

                    response.Success = true;
                    response.Message = "Scene was successfully created";

                    return response;
                }

                // If it's not the first scene, client must provide chaos factor
                if (newScene.AdventureChaosFactor == null)
                {
                    response.Success = false;
                    response.Message = "Chaos factor is required to create a scene";

                    return response;
                }

                bool sceneAlreadyExists = await _repository.CheckIfEntityExistsAsync(
                    scene => scene.AdventureId == newScene.AdventureId
                        && scene.Title.ToLower() == newScene.Title.ToLower()
                );

                if (sceneAlreadyExists)
                {
                    response.Success = false;
                    response.Message = "Scene with such title already exists";

                    return response;
                }

                Scene sceneToCreate = _mapper.Map<Scene>(newScene);

                int rollResult = _rollingService.Roll1D10();

                if (rollResult <= newScene.AdventureChaosFactor)
                {
                    sceneToCreate.Type = rollResult % 2 != 0 ? SceneType.ALTERED : SceneType.INTERRUPTED;
                }
                else
                {
                    sceneToCreate.Type = SceneType.NORMAL;
                }

                if (sceneToCreate.Type == SceneType.INTERRUPTED)
                {
                    string randomEvent = _randomEventService.GenerateRandomEvent();

                    sceneToCreate.RandomEvent = randomEvent;
                }

                await _repository.AddEntityAsync(sceneToCreate);

                response.Success = true;
                response.Message = "Scene was successfully created";
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