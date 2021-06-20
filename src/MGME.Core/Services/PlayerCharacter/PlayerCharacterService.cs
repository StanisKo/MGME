using System;
using System.Linq;
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
using MGME.Core.DTOs.Thread;
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
                int numberOfResults = await _playerCharacterRepository.GetEntitiesCountAsync(
                    playerCharacter => playerCharacter.UserId == userId
                );

                IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await QueryPlayerCharacters(
                    new Ref<string>(sortingParameter),
                    new Ref<int>(selectedPage),
                    new Ref<int>(userId)
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
                bool playerCharacterExists = await _playerCharacterRepository.CheckIfEntityExistsAsync(
                    playerCharacter => playerCharacter.Name.ToLower() == newPlayerCharacter.Name.ToLower()
                );

                if (playerCharacterExists)
                {
                    response.Success = false;
                    response.Message = "Character with such name already exists";

                    return response;
                }

                // Check if at least one new NonPlayerCharacter already exists
                Expression<Func<NonPlayerCharacter, bool>> nonPlayerCharacterNamePredicate =

                    existingNonPlayerCharacter => newPlayerCharacter.NewNonPlayerCharacters.Select(
                        newNonPlayerCharacter => newNonPlayerCharacter.Name
                    ).Contains(
                        existingNonPlayerCharacter.Name
                    );

                bool nonPlayerCharacterAlreadyExists = await _nonPlayerCharacterRepository.CheckIfEntityExistsAsync(
                    nonPlayerCharacterNamePredicate
                );

                // If so, it belongs to someone else, or takes part in adventure; otherwise client denies the request
                if (nonPlayerCharacterAlreadyExists)
                {
                    response.Success = false;
                    response.Message = "One of the new NPCs either already belongs to another character, or takes part in adventure";

                    return response;
                }

                /*
                We add initial NPCs and Threads to a PlayerCharacter here,
                since it is faster than sepearating these transactions into their own services
                (Though, we would use their own services when PlayerCharacter is already created)
                */

                List<NonPlayerCharacter> newNonPlayerCharactersToAdd = new List<NonPlayerCharacter>();

                if (thereAreNewNonPlayerCharactersToAdd)
                {
                    // Map NonPlayerCharacter DTOs to data models and link to current user
                    newNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters.Select(
                        nonPlayerCharacter =>
                        {
                            NonPlayerCharacter nonPlayerCharacterDM = _mapper.Map<NonPlayerCharacter>(
                                nonPlayerCharacter
                            );

                            nonPlayerCharacterDM.UserId = userId;

                            return nonPlayerCharacterDM;
                        }
                    ).ToList();
                }

                // Map Thread DTOs to data models
                List<Thread> threadsToAdd = newPlayerCharacter.Threads.Select(
                    thread => _mapper.Map<Thread>(thread)
                ).ToList();

                // Finally create and write character to db
                PlayerCharacter characterToAdd = new PlayerCharacter()
                {
                    Name = newPlayerCharacter.Name,
                    Description = newPlayerCharacter.Description,
                    NonPlayerCharacters = newNonPlayerCharactersToAdd,
                    Threads = threadsToAdd,
                    UserId = userId
                };

                await _playerCharacterRepository.AddEntityAsync(characterToAdd);

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

                    IEnumerable<NonPlayerCharacter> existingNonPlayerCharacters =
                        await _nonPlayerCharacterRepository.GetEntititesAsync(
                            predicate: predicate
                        );

                    // We link existing NonPlayerCharacter to our new PlayerCharacter
                    existingNonPlayerCharacters = existingNonPlayerCharacters.Select(
                        nonPlayerCharacter =>
                        {
                            nonPlayerCharacter.PlayerCharacterId = characterToAdd.Id;

                            return nonPlayerCharacter;
                        }
                    );

                    await _nonPlayerCharacterRepository.LinkEntitiesAsync(
                        existingNonPlayerCharacters,
                        "PlayerCharacterId"
                    );
                }

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

                (PlayerCharacter playerCharacterWithUpdates, List<string> propertiesToUpdate) = UpdateVariableNumberOfFields<PlayerCharacter>(
                    playerCharacterToUpdate,
                    updatedPlayerCharacter
                );

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

        public async Task <BaseServiceResponse> DeletePlayerCharacters(IEnumerable<int> ids)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                await _playerCharacterRepository.DeleteEntitiesAsync(ids);

                (char suffix, string verb) args = (
                    ids.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"Character{args.suffix} {args.verb} successfully deleted";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private async Task <IEnumerable<GetPlayerCharacterListDTO>> QueryPlayerCharacters(Ref<string> sortingParameter, Ref<int> selectedPage, Ref<int> userId)
        {
            IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await _playerCharacterRepository.GetEntititesAsync<GetPlayerCharacterListDTO>(
                predicate: playerCharacter => playerCharacter.UserId == userId.Value,
                include: new[]
                {
                    "Threads",
                    "Adventures",
                    "NonPlayerCharacters"
                },
                select: playerCharacter => new GetPlayerCharacterListDTO()
                {
                    Id = playerCharacter.Id,
                    Name = playerCharacter.Name,

                    Thread = playerCharacter.Threads.Select(
                        thread => new GetThreadDTO()
                        {
                            Id = thread.Id,
                            Name = thread.Name
                        }
                    ).Where(
                        thread => playerCharacter.Threads.Count == 1
                    ).FirstOrDefault(),
                    ThreadCount = playerCharacter.Threads.Count,

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
                orderBy: _sorter.DetermineSorting(sortingParameter.Value),
                page: selectedPage.Value
            );

            return playerCharacters;
        }
    }
}