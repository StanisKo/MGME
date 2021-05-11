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
            throw new System.NotImplementedException();
        }

        public async Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id)
        {
            throw new System.NotImplementedException();
        }

        public async Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool thereAreNewNPCsToAdd = newPlayerCharacter.NewNonPlayerCharacters.Any();
            bool thereAreExisitingNPCsToAdd = newPlayerCharacter.ExistingNonPlayerCharacters.Any();

            if (!thereAreNewNPCsToAdd && !thereAreExisitingNPCsToAdd)
            {
                response.Success = false;
                response.Message = "At least one new or existing NPC must be provided";

                return response;
            }

            int userId = GetUserIdFromHttpContext();

            try
            {
                PlayerCharacter characterToAdd = new PlayerCharacter()
                {
                    Name = newPlayerCharacter.Name,
                    Description = newPlayerCharacter.Description,
                    UserId = userId
                };

                List<NonPlayerCharacter> existingNPCsToAdd = new List<NonPlayerCharacter>();

                if (thereAreExisitingNPCsToAdd)
                {

                }

                await _playerCharacterRepository.AddEntityAsync(characterToAdd);

                // Parallelize adding npcs and threads
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