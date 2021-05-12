using System;
using System.Linq;
using System.Reflection;
using System.Linq.Expressions;
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

namespace MGME.Core.Services.PlayerCharacterService
{
    public class PlayerCharacterService : BaseEntityService, IPlayerCharacterService
    {
        private readonly IEntityRepository<PlayerCharacter> _playerCharacterRepository;

        private readonly IEntityRepository<NonPlayerCharacter> _nonPlayerCharacterRepository;

        private readonly IMapper _mapper;

        public PlayerCharacterService(IEntityRepository<PlayerCharacter> playerCharacterRepository,
                                      IEntityRepository<NonPlayerCharacter> nonPlayerCharacterRepository,
                                      IMapper mapper,
                                      IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _playerCharacterRepository = playerCharacterRepository;
            _nonPlayerCharacterRepository = nonPlayerCharacterRepository;
            _mapper = mapper;
        }

        public async Task <DataServiceResponse<List<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters()
        {
            DataServiceResponse<List<GetPlayerCharacterListDTO>> response = new DataServiceResponse<List<GetPlayerCharacterListDTO>>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                List<GetPlayerCharacterListDTO> playerCharacters = await _playerCharacterRepository.GetEntititesAsync<GetPlayerCharacterListDTO>(
                    predicate: playerCharacter => playerCharacter.UserId == userId,
                    select: playerCharacter => new GetPlayerCharacterListDTO()
                    {
                        Id = playerCharacter.Id,
                        Name = playerCharacter.Name,
                        AdventureCount = playerCharacter.Adventures.Count,
                        NonPlayerCharacterCount = playerCharacter.NonPlayerCharacters.Count
                    }
                );

                response.Data = playerCharacters;
                response.Success = true;
                response.Message = playerCharacters.Count == 0 ? "No characters exist yet" : null;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id)
        {
            DataServiceResponse<GetPlayerCharacterDetailDTO> response = new DataServiceResponse<GetPlayerCharacterDetailDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetPlayerCharacterDetailDTO playerCharacter = await _playerCharacterRepository.GetEntityAsync<GetPlayerCharacterDetailDTO>(
                    predicate: playerCharacter => playerCharacter.UserId == userId && playerCharacter.Id == id,
                    include: new[]
                    {
                        "Adventures",
                        "NonPlayerCharacters"
                    },
                    select: playerCharacter => new GetPlayerCharacterDetailDTO()
                    {
                        Id = playerCharacter.Id,
                        Name = playerCharacter.Name,
                        Description = playerCharacter.Description,
                        Adventures = playerCharacter.Adventures.Select(
                            adventure => new GetAdventureDTO()
                            {
                                Id = adventure.Id,
                                Title = adventure.Title
                            }
                        ),
                        NonPlayerCharacters = playerCharacter.NonPlayerCharacters.Select(
                            nonPlayerCharacter => new GetNonPlayerCharacterDTO()
                            {
                                Id = nonPlayerCharacter.Id,
                                Name = nonPlayerCharacter.Name
                            }
                        )
                    }
                );

                response.Data = playerCharacter;
                response.Success = true;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereAreNewNonPlayerCharactersToAdd =
                newPlayerCharacter.NewNonPlayerCharacters != null
                && newPlayerCharacter.NewNonPlayerCharacters.Any();

            bool thereAreExisitingNonPlayerCharactersToAdd =
                newPlayerCharacter.ExistingNonPlayerCharacters != null
                && newPlayerCharacter.ExistingNonPlayerCharacters.Any();

            if (!thereAreNewNonPlayerCharactersToAdd && !thereAreExisitingNonPlayerCharactersToAdd)
            {
                response.Success = false;
                response.Message = "At least one new or existing NPC must be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            try
            {
                /*
                We add initial NPCs and Threads to a PlayerCharacter here,
                since it is faster then sepearating these transactions into their own services
                (Though, we would use their own services when PlayerCharacter is already created)
                */

                List<NonPlayerCharacter> nonPlayerCharactersToAdd = new List<NonPlayerCharacter>();

                /*
                Get existing NPCs

                We can add only those that are not taking part in any Adventure
                or not assigned to another PlayerCharacter

                It is unlikely that this code will receive IDs of those that do not
                meet conditions above, since we don't supply it to the client app,
                but it never hurts to double check
                */
                if (thereAreExisitingNonPlayerCharactersToAdd)
                {
                    Expression<Func<NonPlayerCharacter, bool>> predicate =
                        nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                        && nonPlayerCharacter.Adventures.Count == 0
                        && nonPlayerCharacter.PlayerCharacterId == null
                        && newPlayerCharacter.ExistingNonPlayerCharacters.Contains(nonPlayerCharacter.Id);

                    nonPlayerCharactersToAdd = await _nonPlayerCharacterRepository.GetEntititesAsync(
                        predicate: predicate
                    );
                }

                // Map DTOs to data models and add to pool of all NPCs to add
                if (thereAreNewNonPlayerCharactersToAdd)
                {
                    List<NonPlayerCharacter> newNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters
                        .Select(nonPlayerCharacter => _mapper.Map<NonPlayerCharacter>(nonPlayerCharacter))
                        .ToList();

                    nonPlayerCharactersToAdd.AddRange(newNonPlayerCharactersToAdd);
                }

                // Map DTOs to data models
                List<Thread> threadsToAdd = newPlayerCharacter.Threads
                    .Select(thread => _mapper.Map<Thread>(thread))
                    .ToList();

                // Link both collections of NPCs and Threads to current user
                nonPlayerCharactersToAdd = nonPlayerCharactersToAdd
                    .Select(nonPlayerCharacter => { nonPlayerCharacter.UserId = userId; return nonPlayerCharacter; })
                    .ToList();

                threadsToAdd = threadsToAdd
                    .Select(thread => { thread.UserId = userId; return thread; })
                    .ToList();

                // Finally create and write character to db
                PlayerCharacter characterToAdd = new PlayerCharacter()
                {
                    Name = newPlayerCharacter.Name,
                    Description = newPlayerCharacter.Description,
                    NonPlayerCharacters = nonPlayerCharactersToAdd,
                    Threads = threadsToAdd,
                    UserId = userId
                };

                await _playerCharacterRepository.AddEntityAsync(characterToAdd);

                response.Success = true;
                response.Message = "Character was successfully added";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;

                return response;
            }

            return response;
        }

        public async Task <BaseServiceResponse> UpdatePlayerCharacter(UpdatePlayerCharacterDTO updatedPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                PlayerCharacter playerCharacterToUpdate = await _playerCharacterRepository.GetEntityAsync(
                    id: updatedPlayerCharacter.Id,
                    predicate: playerCharacter => playerCharacter.UserId == userId
                );

                if (playerCharacterToUpdate == null)
                {
                    response.Success = false;
                    response.Message = "Character doesn't exists";

                    return response;
                }

                Type typeOfPlayerCharacter = playerCharacterToUpdate.GetType();

                PropertyInfo[] updatedProperties = updatedPlayerCharacter.GetType().GetProperties();

                List<string> propertiesToUpdate = new List<string>();

                foreach (PropertyInfo updatedProperty in updatedProperties)
                {
                    if (updatedProperty.GetValue(updatedPlayerCharacter) == null || updatedProperty.Name == "Id")
                    {
                        continue;
                    }

                    PropertyInfo propertyToUpdate = typeOfPlayerCharacter.GetProperty(updatedProperty.Name);

                    propertyToUpdate.SetValue(
                        playerCharacterToUpdate,
                        updatedProperty.GetValue(updatedPlayerCharacter)
                    );

                    propertiesToUpdate.Add(updatedProperty.Name);
                }

                await _playerCharacterRepository.UpdateEntityAsync(
                    playerCharacterToUpdate,
                    propertiesToUpdate
                );

                response.Success = true;
                response.Message = $"Character was successfully updated";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> DeletePlayerCharacter(int id)
        {
            throw new System.NotImplementedException();
        }
    }
}