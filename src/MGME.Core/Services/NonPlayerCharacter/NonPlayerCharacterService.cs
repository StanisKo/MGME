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


namespace MGME.Core.Services.NonPlayerCharacterService
{
    public class NonPlayerCharacterService : BaseEntityService, INonPlayerCharacterService
    {
        public Task<BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids)
        {
            throw new NotImplementedException();
        }

        public Task<DataServiceResponse<List<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters()
        {
            throw new NotImplementedException();
        }

        public Task<DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id)
        {
            throw new NotImplementedException();
        }

        public Task<BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            throw new NotImplementedException();
        }
    }
}