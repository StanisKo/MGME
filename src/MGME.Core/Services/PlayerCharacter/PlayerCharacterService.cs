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
            throw new System.NotImplementedException();
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
                if (thereAreNewNonPlayerCharactersToAdd)
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

                if (thereAreExisitingNonPlayerCharactersToAdd)
                {
                    List<NonPlayerCharacter> newNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters
                        .Select(nonPlayerCharacter => _mapper.Map<NonPlayerCharacter>(nonPlayerCharacter))
                        .ToList();

                    nonPlayerCharactersToAdd.AddRange(newNonPlayerCharactersToAdd);
                }

                List<Thread> threadsToAdd = newPlayerCharacter.Threads
                    .Select(thread => _mapper.Map<Thread>(thread))
                    .ToList();

                nonPlayerCharactersToAdd = nonPlayerCharactersToAdd
                    .Select(nonPlayerCharacter => { nonPlayerCharacter.UserId = userId; return nonPlayerCharacter; })
                    .ToList();

                threadsToAdd = threadsToAdd
                    .Select(thread => { thread.UserId = userId; return thread; })
                    .ToList();

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

        public async Task <BaseServiceResponse> UpdatePlayerCharacter()
        {
            throw new System.NotImplementedException();
        }

        public async Task <BaseServiceResponse> DeletePlayerCharacter(int id)
        {
            throw new System.NotImplementedException();
        }
    }
}