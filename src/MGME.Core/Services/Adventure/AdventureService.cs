using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.Thread;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;
using MGME.Core.Utils;
using MGME.Core.Utils.Sorters;

namespace MGME.Core.Services.AdventureService
{
    public class AdventureService : BaseEntityService, IAdventureService
    {
        private readonly IEntityRepository<Adventure> _adventureRepository;

        private readonly IEntityRepository<PlayerCharacter> _playerCharacterRepository;

        private readonly IEntityRepository<NonPlayerCharacter> _nonPlayerCharacterRepository;

        private readonly IMapper _mapper;

        private readonly AdventureSorter _sorter;

        public AdventureService(IEntityRepository<Adventure> adventureRepository,
                                IEntityRepository<PlayerCharacter> playerCharacterRepository,
                                IEntityRepository<NonPlayerCharacter> nonPlayerCharacterRepository,
                                IMapper mapper,
                                AdventureSorter sorter,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _adventureRepository = adventureRepository;
            _playerCharacterRepository = playerCharacterRepository;
            _nonPlayerCharacterRepository = nonPlayerCharacterRepository;
            _mapper = mapper;
            _sorter = sorter;
        }

        public async Task <PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>>> GetAllAdventures(string sortingParameter, int selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>> response = new PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                int numberOfResults = await _adventureRepository.GetEntitiesCountAsync(
                    adventure => adventure.UserId == userId
                );

                IEnumerable<GetAdventureListDTO> adventures = await QueryAdventures(
                    new Ref<string>(sortingParameter),
                    new Ref<int>(selectedPage),
                    new Ref<int>(userId)
                );

                response.Data = adventures;

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

        public async Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereAreNewNonPlayerCharactersToAdd = newAdventure.NewNonPlayerCharacters?.Any() == true;

            bool thereAreExisitingNonPlayerCharactersToAdd = newAdventure.ExistingNonPlayerCharacters?.Any() == true;

            if (!thereAreNewNonPlayerCharactersToAdd && !thereAreExisitingNonPlayerCharactersToAdd)
            {
                response.Success = false;
                response.Message = "At least one new or existing NPC must be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            try
            {
                bool adventureExists = await _adventureRepository.CheckIfEntityExistsAsync(
                    adventure => adventure.UserId == userId
                        && adventure.Title.ToLower() == newAdventure.Title.ToLower()
                );

                if (adventureExists)
                {
                    response.Success = false;
                    response.Message = "Adventure with such title already exists";

                    return response;
                }

                List<NonPlayerCharacter> newNonPlayerCharactersToAdd = new List<NonPlayerCharacter>();

                if (thereAreNewNonPlayerCharactersToAdd)
                {
                    // Check if at least one new NonPlayerCharacter with such name already exists
                    IEnumerable<string> newNonPlayerCharacterNames = newAdventure.NewNonPlayerCharacters.Select(
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
                    newNonPlayerCharactersToAdd = newAdventure.NewNonPlayerCharacters.Select(
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
                List<Thread> threadsToAdd = newAdventure.Threads.Select(
                    thread => _mapper.Map<Thread>(thread)
                ).ToList();

                Adventure adventureToAdd = new Adventure()
                {
                    Title = newAdventure.Title,
                    Context = newAdventure.Context,
                    ChaosFactor = newAdventure.ChaosFactor,
                    NonPlayerCharacters = newNonPlayerCharactersToAdd,
                    Threads = threadsToAdd,
                    UserId = userId
                };

                await _adventureRepository.AddEntityAsync(adventureToAdd);

                // We query added adventure back to add PlayerCharacters and possible existing NonPlayerCharacters
                Adventure addedAdventure = await _adventureRepository.GetEntityAsync(
                    tracking: true,
                    splitQuery: true,
                    predicate: adventure => adventure.UserId == userId && adventure.Title == newAdventure.Title,
                    include: new[]
                    {
                        "PlayerCharacters",
                        "NonPlayerCharacters"
                    }
                );

                // Add player characters
                IEnumerable<PlayerCharacter> playerCharacters = await _playerCharacterRepository.GetEntititesAsync(
                    predicate: playerCharacter => playerCharacter.UserId == userId
                        && newAdventure.PlayerCharacters.Contains(playerCharacter.Id)
                );

                addedAdventure.PlayerCharacters = playerCharacters.ToList();

                await _playerCharacterRepository.LinkEntitiesAsync(
                        playerCharacters,
                        addedAdventure,
                        "PlayerCharacters"
                    );

                /*
                Add existing NonPlayerCharacters if any

                Also check if they don't belong to a PlayerCharacter
                Yet, omit checking if they already take part in adventure,
                Since NonPlayerCharacters can take part in multiple adventures

                It is unlikely that this code will receive IDs of those that do not
                meet conditions above, since we don't supply it to the client app,
                but it never hurts to double check
                */
                if (thereAreExisitingNonPlayerCharactersToAdd)
                {
                    Expression<Func<NonPlayerCharacter, bool>> predicate =
                        nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                                && nonPlayerCharacter.PlayerCharacterId == null
                                    && newAdventure.ExistingNonPlayerCharacters.Contains(nonPlayerCharacter.Id);

                    IEnumerable<NonPlayerCharacter> existingNonPlayerCharacters =
                        await _nonPlayerCharacterRepository.GetEntititesAsync(
                            predicate: predicate
                        );

                    addedAdventure.NonPlayerCharacters = existingNonPlayerCharacters.ToList();

                    // We link existing NonPlayerCharacter to our new Adventure
                    await _nonPlayerCharacterRepository.LinkEntitiesAsync(
                        existingNonPlayerCharacters,
                        addedAdventure,
                        "NonPlayerCharacters"
                    );
                }

                response.Success = true;
                response.Message = "Adventure was successfully added";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereArePlayerCharactersToAdd = ids.PlayerCharacters?.Any() == true;

            bool thereAreNonPlayerCharactersToAdd = ids.NonPlayerCharacters?.Any() == true;

            if (!thereArePlayerCharactersToAdd && !thereAreNonPlayerCharactersToAdd)
            {
                response.Success = false;
                response.Message = "At least one character or one npc id has to be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            try
            {
                Adventure adventureToAddTo = await _adventureRepository.GetEntityAsync(
                    id: ids.Adventure,
                    predicate: adventure => adventure.UserId == userId,
                    tracking: true,
                    splitQuery: true,
                    include: new[]
                    {
                        "PlayerCharacters",
                        "NonPlayerCharacters"
                    }
                );

                if (adventureToAddTo == null)
                {
                    response.Success = false;
                    response.Message = "Adventure doesn't exist";

                    return response;
                }

                if (thereArePlayerCharactersToAdd)
                {
                    bool providedNamesAlreadyUsed = CheckForMatches<PlayerCharacter>(ids, adventureToAddTo, response);

                    if (providedNamesAlreadyUsed)
                    {
                        // Response is populated from private method ^^^
                        return response;
                    }

                    Expression<Func<PlayerCharacter, bool>> predicate =
                        playerCharacter => playerCharacter.UserId == userId
                            && ids.PlayerCharacters.Contains(playerCharacter.Id);

                    IEnumerable<PlayerCharacter> playerCharactersToAdd = await _playerCharacterRepository.GetEntititesAsync(
                        tracking: true,
                        predicate: predicate
                    );

                    for (int i = 0; i < playerCharactersToAdd.Count(); i++)
                    {
                        adventureToAddTo.PlayerCharacters.Add(
                            playerCharactersToAdd.ElementAt(i)
                        );
                    }

                    await _playerCharacterRepository.LinkEntitiesAsync(
                        playerCharactersToAdd,
                        adventureToAddTo,
                        "PlayerCharacters"
                    );
                }

                if (thereAreNonPlayerCharactersToAdd)
                {
                    bool providedNamesAlreadyUsed = CheckForMatches<NonPlayerCharacter>(ids, adventureToAddTo, response);

                    if (providedNamesAlreadyUsed)
                    {
                        return response;
                    }

                    Expression<Func<NonPlayerCharacter, bool>> predicate =
                        nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                            && ids.NonPlayerCharacters.Contains(nonPlayerCharacter.Id);

                    IEnumerable<NonPlayerCharacter> nonPlayerCharactersToAdd = await _nonPlayerCharacterRepository.GetEntititesAsync(
                        tracking: true,
                        predicate: predicate
                    );

                    for (int i = 0; i < nonPlayerCharactersToAdd.Count(); i++)
                    {
                        adventureToAddTo.NonPlayerCharacters.Add(
                            nonPlayerCharactersToAdd.ElementAt(i)
                        );
                    }

                    await _nonPlayerCharacterRepository.LinkEntitiesAsync(
                        nonPlayerCharactersToAdd,
                        adventureToAddTo,
                        "NonPlayerCharacters"
                    );
                }

                response.Success = true;

                // We never add PlayerCharacters and NonPlayerCharacters together at once
                response.Message = $"{(thereArePlayerCharactersToAdd ? "Characters" : "NPCs")} were successfully added";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> DeleteAdventure(IEnumerable<int> ids)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                await _adventureRepository.DeleteEntitiesAsync(ids);

                (char suffix, string verb) args = (
                    ids.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"Adventure{args.suffix} {args.verb} successfully deleted";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private async Task <IEnumerable<GetAdventureListDTO>> QueryAdventures(Ref<string> sortingParameter, Ref<int> selectedPage, Ref<int> userId)
        {
            IEnumerable<GetAdventureListDTO> adventures = await _adventureRepository.GetEntititesAsync<GetAdventureListDTO>(
                predicate: adventure => adventure.UserId == userId.Value,
                include: new[]
                {
                    "Threads",
                    "PlayerCharacters",
                    "NonPlayerCharacters"
                },
                select: adventure => new GetAdventureListDTO()
                {
                    Id = adventure.Id,
                    Title = adventure.Title,

                    Thread = adventure.Threads.Select(
                        thread => new GetThreadDTO()
                        {
                            Id = thread.Id,
                            Name = thread.Name
                        }
                    ).Where(
                        thread => adventure.Threads.Count == 1
                    ).FirstOrDefault(),
                    ThreadCount = adventure.Threads.Count,

                    ChaosFactor = adventure.ChaosFactor,

                    PlayerCharacter = adventure.PlayerCharacters.Select(
                        playerCharacter => new GetPlayerCharacterDTO()
                        {
                            Id = playerCharacter.Id,
                            Name = playerCharacter.Name
                        }
                    ).Where(
                        playerCharacter => adventure.PlayerCharacters.Count == 1
                    ).FirstOrDefault(),
                    PlayerCharacterCount = adventure.PlayerCharacters.Count,

                    NonPlayerCharacter = adventure.NonPlayerCharacters.Select(
                        nonPlayerCharacter => new GetNonPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.Id,
                            Name = nonPlayerCharacter.Name
                        }
                    ).Where(
                        nonPlayerCharacter => adventure.NonPlayerCharacters.Count == 1
                    ).FirstOrDefault(),
                    NonPlayerCharacterCount = adventure.NonPlayerCharacters.Count,

                    SceneCount = adventure.Scenes.Count,

                    CreatedAt = adventure.CreatedAt
                },
                orderBy: _sorter.DetermineSorting(sortingParameter.Value),
                page: selectedPage.Value
            );

            return adventures;
        }

        private bool CheckForMatches<TEntity>(AddToAdventureDTO ids, Adventure adventureToAddTo, BaseServiceResponse response) where TEntity: BaseEntity
        {
            Type typeOfDTO = ids.GetType();
            Type typeOfModel = adventureToAddTo.GetType();

            PropertyInfo relevantCollectionOnDTO;
            PropertyInfo relevantCollectionOnModel;

            if (typeof(TEntity) == typeof(PlayerCharacter))
            {
                relevantCollectionOnDTO = typeOfDTO.GetProperty("PlayerCharacters");
                relevantCollectionOnModel = typeOfModel.GetProperty("PlayerCharacters");
            }
            else
            {
                relevantCollectionOnDTO = typeOfDTO.GetProperty("NonPlayerCharacters");
                relevantCollectionOnModel = typeOfModel.GetProperty("NonPlayerCharacters");
            }

            IEnumerable<TEntity> relevantEntities =
                (relevantCollectionOnModel.GetValue(adventureToAddTo) as IEnumerable<TEntity>);

            IEnumerable<int> matches = relevantEntities.Select(entity => entity.Id).Intersect(
                relevantCollectionOnDTO.GetValue(ids) as IEnumerable<int>
            );

            if (matches.Any())
            {
                IEnumerable<string> names = relevantEntities.Where(
                        entity => matches.Contains(entity.Id)
                    ).Select(
                        entity =>
                        {
                            Type typeOfEntity = entity.GetType();

                            PropertyInfo entityName = typeOfEntity.GetProperty("Name");

                            return entityName.GetValue(entity) as string;
                        }
                    );

                // We modify response in this private method to at least here keep things DRY
                response.Success = false;
                response.Message = $"{String.Join(", ", names)} already added to \"{adventureToAddTo.Title}\"";

                return true;
            }

            return false;
        }
    }
}