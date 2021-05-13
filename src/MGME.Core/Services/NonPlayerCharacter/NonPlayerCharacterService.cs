using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Collections.Generic;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;


namespace MGME.Core.Services.NonPlayerCharacterService
{
    public class NonPlayerCharacterService : BaseEntityService, INonPlayerCharacterService
    {
        private readonly IEntityRepository<NonPlayerCharacter> _repository;

        private readonly IMapper _mapper;

        public NonPlayerCharacterService(IEntityRepository<NonPlayerCharacter> repository,
                                         IMapper mapper,
                                         IHttpContextAccessor httpContextAccessor): base(httpContextAccessor)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public Task<DataServiceResponse<List<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters(int filter)
        {
            throw new NotImplementedException();
        }

        public Task<DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> DeleteNonPlayerCharacter(int id)
        {
            throw new NotImplementedException();
        }
    }
}