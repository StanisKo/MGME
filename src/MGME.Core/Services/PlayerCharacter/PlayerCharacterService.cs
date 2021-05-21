using System;
using System.Linq;
using System.Linq.Expressions;
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
using MGME.Core.Utils;
using MGME.Core.Utils.Sorters;

namespace MGME.Core.Services.PlayerCharacterService
{
    public class PlayerCharacterService : BaseEntityService, IPlayerCharacterService
    {
        private readonly IEntityRepository<PlayerCharacter> _playerCharacterRepository;

        private readonly IEntityRepository<NonPlayerCharacter> _nonPlayerCharacterRepository;

        private readonly IMapper _mapper;

        private readonly PlayerCharacterSorter _sorter;

        public PlayerCharacterService(IEntityRepository<PlayerCharacter> playerCharacterRepository,
                                      IEntityRepository<NonPlayerCharacter> nonPlayerCharacterRepository,
                                      IMapper mapper,
                                      PlayerCharacterSorter sorter,
                                      IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _playerCharacterRepository = playerCharacterRepository;
            _nonPlayerCharacterRepository = nonPlayerCharacterRepository;
            _mapper = mapper;
            _sorter = sorter;
        }

        public async Task <PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters(string sortingParameter, int selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>> response = new PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                int numberOfResults = await _playerCharacterRepository.GetEntitiesCount();

                IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await QueryPlayerCharacters(
                    sortingParameter,
                    selectedPage
                );

                response.Data = playerCharacters;

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

        public async Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id)
        {
            DataServiceResponse<GetPlayerCharacterDetailDTO> response = new DataServiceResponse<GetPlayerCharacterDetailDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetPlayerCharacterDetailDTO playerCharacter = await _playerCharacterRepository.GetEntityAsync<GetPlayerCharacterDetailDTO>(
                    id: id,
                    predicate: playerCharacter => playerCharacter.UserId == userId,
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

                if (playerCharacter == null)
                {
                    response.Success = false;
                    response.Message = "Character doesn't exist";

                    return response;
                }

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
                since it is faster than sepearating these transactions into their own services
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
                    // We don't need List<T> here
                    IEnumerable<NonPlayerCharacter> newNonPlayerCharactersToAdd =
                        newPlayerCharacter.NewNonPlayerCharacters.Select(
                            nonPlayerCharacter => _mapper.Map<NonPlayerCharacter>(nonPlayerCharacter)
                    );

                    nonPlayerCharactersToAdd.AddRange(newNonPlayerCharactersToAdd);
                }

                // Map DTOs to data models
                List<Thread> threadsToAdd = newPlayerCharacter.Threads
                    .Select(thread => _mapper.Map<Thread>(thread))
                    .ToList();

                // Link both collections of Threads and NPCs to current user
                threadsToAdd = threadsToAdd
                    .Select(thread => { thread.UserId = userId; return thread; })
                    .ToList();

                nonPlayerCharactersToAdd = nonPlayerCharactersToAdd
                    .Select(nonPlayerCharacter => { nonPlayerCharacter.UserId = userId; return nonPlayerCharacter; })
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
            }

            return response;
        }

        public async Task <BaseServiceResponse> UpdatePlayerCharacter(UpdatePlayerCharacterDTO updatedPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            if (updatedPlayerCharacter.Name == null && updatedPlayerCharacter.Description == null)
            {
                response.Success = false;
                response.Message = "To update character, either name or description must be provided";

                return response;
            }

            try
            {
                /*
                We query for PlayerCharacter directly and not DTO,
                since at this point in time it only has 3 fields, 2 of which we need to update

                Though, should use DTO when/if model will grow
                */
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

                /*
                We avoid explicitly updating fields, since model can grow in the future and
                at some point we might want to get rid of Name/Description check above and
                let front end update variable number of fields
                */
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
                response.Message = "Character was successfully updated";
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
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                PlayerCharacter playerCharacterToDelete = await _playerCharacterRepository.GetEntityAsync(
                    id: id,
                    predicate: playerCharacter => playerCharacter.UserId == userId
                );

                if (playerCharacterToDelete == null)
                {
                    response.Success = false;
                    response.Message = "Character doesn't exist";

                    return response;
                }

                await _playerCharacterRepository.DeleteEntityAsync(playerCharacterToDelete);

                response.Success = true;
                response.Message = "Character was successfully deleted";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private async Task <IEnumerable<GetPlayerCharacterListDTO>> QueryPlayerCharacters(string sortingParameter, int selectedPage)
        {
            int userId = GetUserIdFromHttpContext();

            IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await _playerCharacterRepository.GetEntititesAsync<GetPlayerCharacterListDTO>(
                predicate: playerCharacter => playerCharacter.UserId == userId,
                include: new[]
                {
                    "Adventures",
                    "NonPlayerCharacters"
                },
                select: playerCharacter => new GetPlayerCharacterListDTO()
                {
                    Id = playerCharacter.Id,
                    Name = playerCharacter.Name,

                    Adventure = playerCharacter.Adventures.Select(
                        adventure => new GetAdventureDTO()
                        {
                            Id = adventure.Id,
                            Title = adventure.Title
                        }
                    ).Where(
                        adventure => playerCharacter.Adventures.Count == 1
                    ).FirstOrDefault(),
                    AdventureCount = playerCharacter.Adventures.Count,

                    NonPlayerCharacter = playerCharacter.NonPlayerCharacters.Select(
                        nonPlayerCharacter => new GetNonPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.Id,
                            Name = nonPlayerCharacter.Name
                        }
                    ).Where(
                        nonPlayerCharacter => playerCharacter.NonPlayerCharacters.Count == 1
                    ).FirstOrDefault(),
                    NonPlayerCharacterCount = playerCharacter.NonPlayerCharacters.Count
                },
                orderBy: _sorter.DetermineSorting(sortingParameter),
                page: selectedPage
            );

            return playerCharacters;
        }
    }
}