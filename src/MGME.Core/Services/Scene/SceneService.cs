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
        private IEntityRepository<Scene> _repository;

        private readonly IMapper _mapper;

        public SceneService(IEntityRepository<Scene> repository,
                            IMapper mapper,
                            IHttpContextAccessor httpContextAccessor): base(httpContextAccessor)
        {
            _repository = repository;
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