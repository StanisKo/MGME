using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

using AutoMapper;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;
using System.Linq.Expressions;

namespace MGME.Core.Services.PlayerCharacterService
{
    public class PlayerCharacterService : BaseEntityService, IPlayerCharacterService
    {
        private readonly IEntityRepository<PlayerCharacter> _playerCharacterRepository;

        private readonly IEntityRepository<NonPlayerCharacter> _nonPlayerCharacterRepository;

        private readonly IMapper _mapper;

        public PlayerCharacterService(IEntityRepository<PlayerCharacter> playerCharacterRepository,
                                      IEntityRepository<NonPlayerCharacter> nonPlayerCharacterRepository,
                                      IEntityRepository<Thread> threadRepository,
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

            bool thereAreNewNonPlayerCharactersToAddToAdd =
                newPlayerCharacter.NewNonPlayerCharacters != null
                && newPlayerCharacter.NewNonPlayerCharacters.Any();

            bool thereAreExisitingNonPlayerCharactersToAdd =
                newPlayerCharacter.ExistingNonPlayerCharacters != null
                && newPlayerCharacter.ExistingNonPlayerCharacters.Any();

            if (!thereAreNewNonPlayerCharactersToAddToAdd && !thereAreExisitingNonPlayerCharactersToAdd)
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

                We can add only those that are not assigned to another PlayerCharacter
                or not taking part in any Adventure
                */
                if (thereAreNewNonPlayerCharactersToAddToAdd)
                {
                    Expression<Func<NonPlayerCharacter, bool>> predicate =
                        npc => npc.UserId == userId
                        && newPlayerCharacter.ExistingNonPlayerCharacters.Contains(npc.Id)
                        && npc.PlayerCharacterId == null
                        && npc.Adventures.Count == 0;

                    nonPlayerCharactersToAdd = await _nonPlayerCharacterRepository.GetEntititesAsync(
                        predicate: predicate
                    );
                }

                if (thereAreExisitingNonPlayerCharactersToAdd)
                {
                    List<NonPlayerCharacter> newNonPlayerCharactersToAdd = newPlayerCharacter.NewNonPlayerCharacters
                        .Select(npc => _mapper.Map<NonPlayerCharacter>(npc))
                        .ToList();

                    nonPlayerCharactersToAdd.AddRange(newNonPlayerCharactersToAdd);
                }

                List<Thread> threadsToAdd = newPlayerCharacter.Threads
                    .Select(thread => _mapper.Map<Thread>(thread))
                    .ToList();

                nonPlayerCharactersToAdd = nonPlayerCharactersToAdd
                    .Select(npc => { npc.UserId = userId; return npc; })
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