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

        public Task <DataServiceResponse<List<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters(int filter)
        {
            throw new NotImplementedException();
        }

        public async Task <DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id)
        {
            DataServiceResponse<GetNonPlayerCharacterDetailDTO> response = new DataServiceResponse<GetNonPlayerCharacterDetailDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetNonPlayerCharacterDetailDTO nonPlayerCharacter = await _repository.GetEntityAsync<GetNonPlayerCharacterDetailDTO>(
                    id: id,
                    predicate: nonPlayerCharacter => nonPlayerCharacter.UserId == userId,
                    include: new[]
                    {
                        "PlayerCharacter",
                        "Adventures"
                    },
                    select: nonPlayerCharacter => new GetNonPlayerCharacterDetailDTO()
                    {
                        Id = nonPlayerCharacter.Id,
                        Name = nonPlayerCharacter.Name,
                        Description = nonPlayerCharacter.Description,
                        PlayerCharacter = new GetPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.PlayerCharacter.Id,
                            Name = nonPlayerCharacter.PlayerCharacter.Name
                        },
                        Adventures = nonPlayerCharacter.Adventures.Select(
                            adventure => new GetAdventureDTO()
                            {
                                Id = adventure.Id,
                                Title = adventure.Title
                            }
                        )
                    }
                );

                if (nonPlayerCharacter == null)
                {
                    response.Success = false;
                    response.Message = "NPC doesn't exist";

                    return response;
                }

                response.Data = nonPlayerCharacter;
                response.Success = true;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                NonPlayerCharacter nonPlayerCharacterToAdd = new NonPlayerCharacter()
                {
                    Name = newNonPlayerCharacter.Name,
                    Description = newNonPlayerCharacter.Description,
                    PlayerCharacterId = newNonPlayerCharacter.PlayerCharacter, // null if not provided
                    UserId = userId
                };

                await _repository.AddEntityAsync(nonPlayerCharacterToAdd);

                response.Success = true;
                response.Message = "NPC was successfully added";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public Task <BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            throw new NotImplementedException();
        }

        public Task <BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task <BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task <BaseServiceResponse> DeleteNonPlayerCharacter(int id)
        {
            throw new NotImplementedException();
        }
    }
}