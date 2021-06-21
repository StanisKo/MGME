using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;
using System.Linq.Expressions;

namespace MGME.Core.Services.AdventureService
{
    public class AdventureService : BaseEntityService, IAdventureService
    {
        private readonly IEntityRepository<Adventure> _adventureRepository;

        private readonly IEntityRepository<NonPlayerCharacter> _nonPlayerCharacterRepository;

        private readonly IMapper _mapper;

        public AdventureService(IEntityRepository<Adventure> adventureRepository,
                                IEntityRepository<NonPlayerCharacter> nonPlayerCharacterRepository,
                                IMapper mapper,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _adventureRepository = adventureRepository;
            _nonPlayerCharacterRepository = nonPlayerCharacterRepository;
            _mapper = mapper;
        }

        public async Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereAreNewNonPlayerCharactersToAdd = newAdventure?.NewNonPlayerCharacters.Any() == true;

            bool thereAreExisitingNonPlayerCharactersToAdd = newAdventure?.ExistingNonPlayerCharacters.Any() == true;

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
                    adventure => adventure.Title.ToLower() == newAdventure.Title.ToLower()
                );

                if (adventureExists)
                {
                    response.Success = false;
                    response.Message = "Adventure with such title already exists";

                    return response;
                }

                // Check if at least one new NonPlayerCharacter already exists
                IEnumerable<string> newNonPlayerCharacterNames = newAdventure.NewNonPlayerCharacters.Select(
                        newNonPlayerCharacter => newNonPlayerCharacter.Name
                );

                Expression<Func<NonPlayerCharacter, bool>> nonPlayerCharacterNamePredicate =
                    existingNonPlayerCharacter => newNonPlayerCharacterNames.Contains(
                        existingNonPlayerCharacter.Name
                    );

                bool nonPlayerCharacterAlreadyExists = await _nonPlayerCharacterRepository.CheckIfEntityExistsAsync(
                    nonPlayerCharacterNamePredicate
                );

                if (nonPlayerCharacterAlreadyExists)
                {
                    response.Success = false;
                    response.Message = "One of the new NPCs either already takes part in another adventure, or belongs to a character";

                    return response;
                }

                List<NonPlayerCharacter> newNonPlayerCharactersToAdd = new List<NonPlayerCharacter>();

                if (thereAreNewNonPlayerCharactersToAdd)
                {
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
                    NonPlayerCharacters = newNonPlayerCharactersToAdd,
                    Threads = threadsToAdd,
                    UserId = userId
                };
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }
    }
}