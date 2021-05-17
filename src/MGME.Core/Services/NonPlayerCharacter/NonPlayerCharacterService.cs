using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using System.Collections.Generic;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.Constants;
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

        public async Task <DataServiceResponse<List<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters(int filter)
        {
            DataServiceResponse<List<GetNonPlayerCharacterListDTO>> response = new DataServiceResponse<List<GetNonPlayerCharacterListDTO>>();

            int userId = GetUserIdFromHttpContext();

            bool weNeedAll = filter == (int)NonPlayerCharacterFilter.ALL;

            bool weNeedOnlyAvailable = !weNeedAll;

            try
            {
                Expression<Func<NonPlayerCharacter, bool>> predicate =
                    nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                    /*
                    The condition to add NonPlayerCharacter to a PlayerCharacter or an Adventure is the same
                    It shouldn't belong to the PlayerCharacter already
                    */
                    && weNeedOnlyAvailable ? nonPlayerCharacter.PlayerCharacterId == null : true;

                List<GetNonPlayerCharacterListDTO> nonPlayerCharacters = await _repository.GetEntititesAsync<GetNonPlayerCharacterListDTO>(
                    predicate: predicate,
                    include: weNeedAll
                        ? new[] { "PlayerCharacter" }
                        : null,
                    select: nonPlayerCharacter => new GetNonPlayerCharacterListDTO()
                    {
                        Id = nonPlayerCharacter.Id,
                        Name = nonPlayerCharacter.Name,
                        PlayerCharacter = weNeedAll && nonPlayerCharacter.PlayerCharacter != null
                            ? new GetPlayerCharacterDTO()
                            {
                                Id = nonPlayerCharacter.PlayerCharacter.Id,
                                Name = nonPlayerCharacter.PlayerCharacter.Name
                            }
                            : null,
                        AdventureCount = weNeedAll
                            ? nonPlayerCharacter.Adventures.Count
                            : null
                    }
                );

                response.Data = nonPlayerCharacters;
                response.Success = true;
                response.Message = nonPlayerCharacters.Count == 0 ? "No NPCs exist yet" : null;

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
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

        public Task <BaseServiceResponse> AddToPlayerCharacterOrAdventure(AddToPlayerCharacterOrAdventureDTO ids)
        {
            throw new NotImplementedException();
        }

        public async Task <BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            if (updatedNonPlayerCharacter.Name == null && updatedNonPlayerCharacter.Description == null)
            {
                response.Success = false;
                response.Message = "To update NPC, either name or description must be provided";

                return response;
            }

            try
            {
                NonPlayerCharacter nonPlayerCharacterToUpdate = await _repository.GetEntityAsync(
                    id: updatedNonPlayerCharacter.Id,
                    predicate: nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                );

                if (nonPlayerCharacterToUpdate == null)
                {
                    response.Success = false;
                    response.Message = "NPC doesn't exist";

                    return response;
                }

                /*
                We avoid explicitly updating fields, since model can grow in the future and
                at some point we might want to get rid of Name/Description check above and
                let front end update variable number of fields
                */
                Type typeOfNonPlayerCharacter = nonPlayerCharacterToUpdate.GetType();

                PropertyInfo[] updatedProperties = updatedNonPlayerCharacter.GetType().GetProperties();

                List<string> propertiesToUpdate = new List<string>();

                foreach (PropertyInfo updatedProperty in updatedProperties)
                {
                    if (updatedProperty.GetValue(updatedNonPlayerCharacter) == null || updatedProperty.Name == "Id")
                    {
                        continue;
                    }

                    PropertyInfo propertyToUpdate = typeOfNonPlayerCharacter.GetProperty(updatedProperty.Name);

                    propertyToUpdate.SetValue(
                        nonPlayerCharacterToUpdate,
                        updatedProperty.GetValue(updatedNonPlayerCharacter)
                    );

                    propertiesToUpdate.Add(updatedProperty.Name);
                }

                await _repository.UpdateEntityAsync(
                    nonPlayerCharacterToUpdate,
                    propertiesToUpdate
                );

                response.Success = true;
                response.Message = "NPC was successfully updated";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public Task <BaseServiceResponse> DeleteNonPlayerCharacter(int id)
        {
            throw new NotImplementedException();
        }
    }
}