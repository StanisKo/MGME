using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;
using MGME.Core.Utils;
using MGME.Core.Utils.Sorters;

namespace MGME.Core.Services.SceneService
{
    public class SceneService : BaseEntityService, ISceneService
    {
        private readonly IEntityRepository<Scene> _sceneRepository;

        private readonly IEntityRepository<Adventure> _adventureRepository;

        private readonly IRollingService _rollingService;

        private readonly IRandomEventService _randomEventService;

        private readonly IMapper _mapper;

        private readonly SceneSorter _sorter;

        public SceneService(IEntityRepository<Scene> repository,
                            IEntityRepository<Adventure> adventureRepository,
                            IRollingService rollingService,
                            IRandomEventService randomEventService,
                            IMapper mapper,
                            SceneSorter sorter,
                            IHttpContextAccessor httpContextAccessor): base(httpContextAccessor)
        {
            _sceneRepository = repository;
            _adventureRepository = adventureRepository;

            _rollingService = rollingService;
            _randomEventService = randomEventService;

            _mapper = mapper;
            _sorter = sorter;
        }

        public async Task <PaginatedDataServiceResponse<IEnumerable<GetSceneListDTO>>> GetAllScenes(int adventureId, int? selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetSceneListDTO>> response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                bool providedAdventureIdIsValid = await _adventureRepository.CheckIfEntityExistsAsync(
                    adventure => adventure.Id == adventureId && adventure.UserId == userId
                );

                if (!providedAdventureIdIsValid)
                {
                    response.Success = false;
                    response.Message = "Adventure with such id does not exist";

                    return response;
                }

                // We don't need to check against user here, since we already check against adventure before
                int numberOfResults = await _sceneRepository.GetEntitiesCountAsync(
                    scene => scene.AdventureId == adventureId
                );

                /*
                If page is not provided, we query the last page
                to return most recent scenes
                */
                selectedPage ??= (int)Math.Ceiling(numberOfResults / (double) DataAccessHelpers.PAGINATE_BY);

                IEnumerable<GetSceneListDTO> scenes = await _sceneRepository.GetEntititesAsync(
                    predicate: scene => scene.AdventureId == adventureId,
                    select: scene => new GetSceneListDTO()
                    {
                        Id = scene.Id,
                        Title = scene.Title,
                        Type = scene.Type,
                        Setup = scene.Setup,
                        ModifiedSetup = scene.ModifiedSetup,
                        RandomEvent = scene.RandomEvent,
                        Resolved = scene.Resolved,
                        CreatedAt = scene.CreatedAt
                    },
                    // We always sort on timestamp ascending
                    orderBy: _sorter.DetermineSorting("created"),
                    page: selectedPage
                );

                response.Data = scenes;

                response.Pagination.Page = selectedPage;
                response.Pagination.NumberOfResults = numberOfResults;
                response.Pagination.NumberOfPages = DataAccessHelpers.GetNumberOfPages(numberOfResults);

                response.Success = true;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddScene(AddSceneDTO newScene)
        {
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                bool providedAdventureIdIsValid = await _adventureRepository.CheckIfEntityExistsAsync(
                    adventure => adventure.Id == newScene.AdventureId && adventure.UserId == userId
                );

                if (!providedAdventureIdIsValid)
                {
                    response.Success = false;
                    response.Message = "Adventure with such id does not exist";

                    return response;
                }

                int scenesCount = await _sceneRepository.GetEntitiesCountAsync(
                    scene => scene.AdventureId == newScene.AdventureId
                );

                // It's the first scene in adventure
                if (scenesCount is 0)
                {
                    Scene firstSceneToCreate = _mapper.Map<Scene>(newScene);

                    // If client requested random event to seed the first scene, reflect it in it's type
                    firstSceneToCreate.Type =
                        firstSceneToCreate.RandomEvent is not null ? SceneType.INTERRUPTED : SceneType.NORMAL;

                    await _sceneRepository.AddEntityAsync(firstSceneToCreate);

                    response.Success = true;
                    response.Message = "Scene was successfully created";

                    return response;
                }

                // If it's not the first scene, client must provide chaos factor
                if (newScene.AdventureChaosFactor is null)
                {
                    response.Success = false;
                    response.Message = "Chaos factor is required to create a scene";

                    return response;
                }

                bool sceneAlreadyExistsOrThereAreUnresolvedScenes = await _sceneRepository.CheckIfEntityExistsAsync(
                    scene => scene.AdventureId == newScene.AdventureId
                        && (String.Equals(scene.Title.ToLower(), newScene.Title.ToLower()) || !scene.Resolved)
                );

                if (sceneAlreadyExistsOrThereAreUnresolvedScenes)
                {
                    response.Success = false;
                    response.Message = "Scene with such title already exists or there are unresolved scenes that need to be resolved first";

                    return response;
                }

                Scene sceneToCreate = _mapper.Map<Scene>(newScene);

                int rollResult = _rollingService.Roll1D10();

                // If roll is within chaos factor, scene must be modified
                if (rollResult <= newScene.AdventureChaosFactor)
                {
                    // Roll is odd ? scene must be altered : scene is interrupted by random event
                    sceneToCreate.Type = rollResult % 2 != 0 ? SceneType.ALTERED : SceneType.INTERRUPTED;
                }
                else
                {
                    sceneToCreate.Type = SceneType.NORMAL;
                }

                /*
                If scene is interrupted, we need to generate random event
                That will serve as input for modifying scene setup
                */
                if (sceneToCreate.Type is SceneType.INTERRUPTED)
                {
                    string randomEvent = _randomEventService.GenerateRandomEvent();

                    sceneToCreate.RandomEvent = randomEvent;
                }

                await _sceneRepository.AddEntityAsync(sceneToCreate);

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

        public async Task <BaseServiceResponse> ResolveScene(ResolveSceneDTO sceneToResolve)
        {
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                bool providedAdventureIdIsValid = await _adventureRepository.CheckIfEntityExistsAsync(
                    adventure => adventure.Id == sceneToResolve.AdventureId && adventure.UserId == userId
                );

                if (!providedAdventureIdIsValid)
                {
                    response.Success = false;
                    response.Message = "Adventure with such id does not exist";

                    return response;
                }

                Scene resolvedScene = await _sceneRepository.GetEntityAsync(
                    id: sceneToResolve.SceneId,
                    predicate: scene => scene.AdventureId == sceneToResolve.AdventureId
                );

                if (resolvedScene is null)
                {
                    response.Success = false;
                    response.Message = "Scene with such id does not exist";

                    return response;
                }

                if (resolvedScene.Resolved)
                {
                    response.Success = false;
                    response.Message = "Scene is already resolved";

                    return response;
                }

                resolvedScene.Resolved = true;

                await _sceneRepository.UpdateEntityAsync(resolvedScene, new[] { "Resolved" });

                response.Success = true;
                response.Message = "Scene was successfully resolved";
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