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
            throw new System.NotImplementedException();
        }

        public async Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id)
        {
            throw new System.NotImplementedException();
        }

        public async Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereAreNewNPCsToAdd =
                newPlayerCharacter.NewNPCs != null && newPlayerCharacter.NewNPCs.Any();

            bool thereAreExisitingNPCsToAdd =
                newPlayerCharacter.ExistingNPCs != null && newPlayerCharacter.ExistingNPCs.Any();

            if (!thereAreNewNPCsToAdd && !thereAreExisitingNPCsToAdd)
            {
                response.Success = false;
                response.Message = "At least one new or existing NPC must be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            // TODO: optimize and prettify

            try
            {
                /*
                We add initial NPCs and Threads to a PlayerCharacter here,
                since it is faster then sepearating these transactions into their own services
                (Though, we would use their own services when PlayerCharacter is already created)
                */

                List<NonPlayerCharacter> NPCsToAdd = new List<NonPlayerCharacter>();

                /*
                Get existing NPCs

                We can add only those that are not assigned to another PlayerCharacter
                or not taking part in any Adventure
                */
                if (thereAreExisitingNPCsToAdd)
                {
                    Expression<Func<NonPlayerCharacter, bool>> predicate =
                        npc => npc.UserId == userId
                        && newPlayerCharacter.ExistingNPCs.Contains(npc.Id)
                        && npc.PlayerCharacterId == null
                        && npc.Adventures.Count == 0;

                    NPCsToAdd = await _nonPlayerCharacterRepository.GetEntititesAsync(
                        predicate: predicate
                    );
                }

                // Map new NPCs to data models
                if (thereAreNewNPCsToAdd)
                {
                    List<NonPlayerCharacter> newNPCsToAdd = newPlayerCharacter.NewNPCs.Select(
                        npc => _mapper.Map<NonPlayerCharacter>(npc)
                    ).ToList();

                    NPCsToAdd.AddRange(newNPCsToAdd);
                }

                // Map Threads to data models
                List<Thread> threadsToAdd = newPlayerCharacter.Threads.Select(
                    thread => _mapper.Map<Thread>(thread)
                ).ToList();

                // Bind both collections to current user
                NPCsToAdd = NPCsToAdd.Select(npc => { npc.UserId = userId; return npc; }).ToList();

                threadsToAdd = threadsToAdd.Select(thread => { thread.UserId = userId; return thread; }).ToList();

                PlayerCharacter characterToAdd = new PlayerCharacter()
                {
                    Name = newPlayerCharacter.Name,
                    Description = newPlayerCharacter.Description,
                    NonPlayerCharacters = NPCsToAdd,
                    Threads = threadsToAdd,
                    UserId = userId
                };

                // Add Character
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