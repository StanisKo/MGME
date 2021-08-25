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

        public async Task <PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters(string sortingParameter, int? selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>> response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {

                int? numberOfResults = null;

                if (selectedPage is not null)
                {
                    numberOfResults = await _playerCharacterRepository.GetEntitiesCountAsync(
                        playerCharacter => playerCharacter.UserId == userId
                    );
                }

                IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await QueryPlayerCharacters(
                    new Ref<int>(userId),
                    new Ref<string>(sortingParameter),
                    selectedPage is not null ? new Ref<int>((int)selectedPage) : null
                );

                response.Data = playerCharacters;

                if (selectedPage is not null)
                {
                    response.Pagination.Page = selectedPage;
                    response.Pagination.NumberOfResults = numberOfResults;
                    response.Pagination.NumberOfPages = DataAccessHelpers.GetNumberOfPages((int)numberOfResults);
                }

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
            DataServiceResponse<GetPlayerCharacterDetailDTO> response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetPlayerCharacterDetailDTO playerCharacter = await _playerCharacterRepository.GetEntityAsync(
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

                if (playerCharacter is null)
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
            BaseServiceResponse response = new();

            bool thereAreNewNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters?.Any() == true;

            bool thereAreExistingNonPlayerCharactersToAdd = newPlayerCharacter.ExistingNonPlayerCharacters?.Any() == true;

            if (!thereAreNewNonPlayerCharactersToAdd && !thereAreExistingNonPlayerCharactersToAdd)
            {
                response.Success = false;
                response.Message = "At least one new or existing NPC must be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            try
            {
                // Check if player character with such name already exists for this user
                bool playerCharacterExists = await _playerCharacterRepository.CheckIfEntityExistsAsync(
                    playerCharacter => playerCharacter.UserId == userId
                        && String.Equals(playerCharacter.Name.ToLower(), newPlayerCharacter.Name.ToLower())
                );

                if (playerCharacterExists)
                {
                    response.Success = false;
                    response.Message = "Character with such name already exists";

                    return response;
                }

                List<NonPlayerCharacter> newNonPlayerCharactersToAdd = new();

                if (thereAreNewNonPlayerCharactersToAdd)
                {
                    // Check if at least one new NonPlayerCharacter with such name already exists for this user
                    IEnumerable<string> newNonPlayerCharacterNames = newPlayerCharacter.NewNonPlayerCharacters.Select(
                            newNonPlayerCharacter => newNonPlayerCharacter.Name
                    );

                    Expression<Func<NonPlayerCharacter, bool>> nonPlayerCharacterNamePredicate =
                        existingNonPlayerCharacter => existingNonPlayerCharacter.UserId == userId
                            && newNonPlayerCharacterNames.Contains(existingNonPlayerCharacter.Name);

                    bool nonPlayerCharacterAlreadyExists = await _nonPlayerCharacterRepository.CheckIfEntityExistsAsync(
                        nonPlayerCharacterNamePredicate
                    );

                    if (nonPlayerCharacterAlreadyExists)
                    {
                        response.Success = false;
                        response.Message = "One of the new NPCs already exists";

                        return response;
                    }

                    // Map NonPlayerCharacter DTOs to data models and link to current user
                    newNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters.Select(
                        nonPlayerCharacter =>
                        {
                            NonPlayerCharacter nonPlayerCharacterDataModel = _mapper.Map<NonPlayerCharacter>(
                                nonPlayerCharacter
                            );

                            nonPlayerCharacterDataModel.UserId = userId;

                            return nonPlayerCharacterDataModel;
                        }
                    ).ToList();
                }

                // Map Thread DTOs to data models
                List<Thread> threadsToAdd = newPlayerCharacter.Threads.Select(
                    thread => _mapper.Map<Thread>(thread)
                ).ToList();

                // Finally create and write character to db
                PlayerCharacter characterToAdd = new()
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
                if (thereAreExistingNonPlayerCharactersToAdd)
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
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            if (updatedPlayerCharacter.Name is null && updatedPlayerCharacter.Description is null)
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

                if (playerCharacterToUpdate is null)
                {
                    response.Success = false;
                    response.Message = "Character doesn't exists";

                    return response;
                }

                (PlayerCharacter playerCharacterWithUpdates, List<string> propertiesToUpdate) = UpdateVariableNumberOfFields(
                    playerCharacterToUpdate,
                    updatedPlayerCharacter
                );

                await _playerCharacterRepository.UpdateEntityAsync(
                    playerCharacterWithUpdates,
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
            BaseServiceResponse response = new();

            try
            {
                await _playerCharacterRepository.DeleteEntitiesAsync(ids);

                (char suffix, string verb) = (
                    ids.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"Character{suffix} {verb} successfully deleted";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids)
        {
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                PlayerCharacter playerCharacterToAddTo = await _playerCharacterRepository.GetEntityAsync(
                    id: ids.PlayerCharacterId,
                    predicate: playerCharacter => playerCharacter.UserId == userId,
                    tracking: true,
                    include: new[]
                    {
                        "NonPlayerCharacters"
                    }
                );

                if (playerCharacterToAddTo == null)
                {
                    response.Success = false;
                    response.Message = "Character doesn't exist";

                    return response;
                }

                /*
                We query only those, that don't have adventure and use their count and count of provided ids
                to deduce a possible error -- weather some of the NonPlayerCharacters by provided ids already
                take part in an Adventure; and in such, save a join on Adventure
                */
                IEnumerable<NonPlayerCharacter> nonPlayerCharactersToAdd = await _nonPlayerCharacterRepository.GetEntititesAsync(
                    predicate: nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                        && ids.NonPlayerCharacters.Contains(nonPlayerCharacter.Id)
                            && nonPlayerCharacter.Adventures.Count == 0
                );

                IEnumerable<int> matches = playerCharacterToAddTo.NonPlayerCharacters.Select(
                    nonPlayerCharacter => nonPlayerCharacter.Id
                ).Intersect(
                    ids.NonPlayerCharacters
                );

                if (matches.Any())
                {
                    IEnumerable<string> names = playerCharacterToAddTo.NonPlayerCharacters.Where(
                        nonPlayerCharacter => matches.Contains(nonPlayerCharacter.Id)
                    ).Select(
                        nonPlayerCharacter => nonPlayerCharacter.Name
                    );

                    response.Success = false;
                    response.Message = $"{String.Join(", ", names)} already added to \"{playerCharacterToAddTo.Name}\"";

                    return response;
                }

                bool nonPlayerCharacterAlreadyTaken = nonPlayerCharactersToAdd.Any(
                    nonPlayerCharacter => nonPlayerCharacter.PlayerCharacterId is not null
                );

                if (nonPlayerCharacterAlreadyTaken)
                {
                    response.Success = false;
                    response.Message = "One of the NPCs already belongs to another Character";

                    return response;
                }

                // If potential error, there will always be less queried NonPlayerCharacters
                bool nonPlayerCharacterAlreadyTakesPartInAdventure =
                    nonPlayerCharactersToAdd.Count() != ids.NonPlayerCharacters.Count();

                if (nonPlayerCharacterAlreadyTakesPartInAdventure)
                {
                    response.Success = false;
                    response.Message = "One of the NPCs already takes part in Adventure and cannot be added to a Character";

                    return response;
                }

                for (int i  = 0; i < nonPlayerCharactersToAdd.Count(); i++)
                {
                    playerCharacterToAddTo.NonPlayerCharacters.Add(
                        nonPlayerCharactersToAdd.ElementAt(i)
                    );
                }

                await _nonPlayerCharacterRepository.LinkEntitiesAsync(
                    nonPlayerCharactersToAdd,
                    playerCharacterToAddTo,
                    "NonPlayerCharacters"
                );

                (char suffix, string verb) = (
                    nonPlayerCharactersToAdd.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"NPC{suffix} {verb} successfully added";

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private async Task <IEnumerable<GetPlayerCharacterListDTO>> QueryPlayerCharacters(Ref<int> userId, Ref<string> sortingParameter, Ref<int> selectedPage)
        {
            /*
            Here, if client does not provide selectedPage == does not request paginated result, it means we only
            need PlayerCharacters that will be linked with NonPlayerCharacter or Adventure upon creating of two former

            Therefore, we can avoid querying unnecessary data, as we only need names and ids
            */
            IEnumerable<GetPlayerCharacterListDTO> playerCharacters = await _playerCharacterRepository.GetEntititesAsync(
                predicate: playerCharacter => playerCharacter.UserId == userId.Value,
                include: selectedPage != null ? new[]
                {
                    "Threads",
                    "Adventures",
                    "NonPlayerCharacters"
                } : null,
                select: playerCharacter => new GetPlayerCharacterListDTO()
                {
                    Id = playerCharacter.Id,
                    Name = playerCharacter.Name,

                    Thread = selectedPage != null ? playerCharacter.Threads.Select(
                        thread => new GetThreadDTO()
                        {
                            Id = thread.Id,
                            Name = thread.Name
                        }
                    ).FirstOrDefault(
                        thread => playerCharacter.Threads.Count == 1
                    ) : null,

                    ThreadCount = selectedPage != null ? playerCharacter.Threads.Count : null,

                    Adventure = selectedPage != null ? playerCharacter.Adventures.Select(
                        adventure => new GetAdventureDTO()
                        {
                            Id = adventure.Id,
                            Title = adventure.Title
                        }
                    ).FirstOrDefault(
                        adventure => playerCharacter.Adventures.Count == 1
                    ) : null,

                    AdventureCount = selectedPage != null ? playerCharacter.Adventures.Count : null,

                    NonPlayerCharacter = selectedPage != null ? playerCharacter.NonPlayerCharacters.Select(
                        nonPlayerCharacter => new GetNonPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.Id,
                            Name = nonPlayerCharacter.Name
                        }
                    ).FirstOrDefault(
                        nonPlayerCharacter => playerCharacter.NonPlayerCharacters.Count == 1
                    ) : null,

                    NonPlayerCharacterCount = selectedPage != null ? playerCharacter.NonPlayerCharacters.Count : null
                } ,
                orderBy: _sorter.DetermineSorting(sortingParameter.Value),
                page: selectedPage?.Value
            );

            return playerCharacters;
        }
    }
}