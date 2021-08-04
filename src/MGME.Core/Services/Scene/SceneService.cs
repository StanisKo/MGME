using System;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
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

        public Task<BaseServiceResponse> AddScene(AddSceneDTO newScene)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }
        }
    }
}