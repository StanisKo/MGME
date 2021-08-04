using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;
using MGME.Core.Utils;
using MGME.Core.Utils.Sorters;

namespace MGME.Core.Services.NonPlayerCharacterService
{
    public class NonPlayerCharacterService : BaseEntityService, INonPlayerCharacterService
    {
        private readonly IEntityRepository<NonPlayerCharacter> _repository;

        private readonly NonPlayerCharacterSorter _sorter;

        public NonPlayerCharacterService(IEntityRepository<NonPlayerCharacter> repository,
                                         NonPlayerCharacterSorter sorter,
                                         IHttpContextAccessor httpContextAccessor): base(httpContextAccessor)
        {
            _repository = repository;
            _sorter = sorter;
        }

        public async Task <PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters(int filter, string sortingParameter, int? selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>> response = new PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>>();

            int userId = GetUserIdFromHttpContext();

            bool weNeedAll = filter == (int)NonPlayerCharacterFilter.ALL;

            Expression<Func<NonPlayerCharacter, bool>> predicate;

            switch (filter)
            {
                /*
                NonPlayerCharacters available for Adventures should not
                belong to other PlayerCharacters (since they can also take part in other adventures)
                */
                case ((int)NonPlayerCharacterFilter.AVAILABLE_FOR_ADVENTURES):
                    predicate =
                        nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                            && nonPlayerCharacter.PlayerCharacterId == null;

                    break;

                /*
                NonPlayerCharacters available for PlayerCharacters should not
                belong to other PlayerCharacters, neither take part in the Adventure
                */
                case ((int)NonPlayerCharacterFilter.AVAILABLE_FOR_PLAYER_CHARACTERS):
                    predicate =
                        nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                            && nonPlayerCharacter.PlayerCharacterId == null
                                && nonPlayerCharacter.Adventures.Count == 0;

                    break;

                default:
                    predicate = nonPlayerCharacter => nonPlayerCharacter.UserId == userId;

                    break;
            }

            try
            {
                int? numberOfResults = null;

                if (selectedPage != null)
                {
                    numberOfResults = await _repository.GetEntitiesCountAsync(
                        predicate
                    );
                }

                IEnumerable<GetNonPlayerCharacterListDTO> nonPlayerCharacters = await QueryNonPlayerCharacters(
                    predicate,
                    new Ref<bool>(weNeedAll),
                    new Ref<string>(sortingParameter),
                    selectedPage != null ? new Ref<int>((int)selectedPage) : null
                );

                response.Data = nonPlayerCharacters;

                if (selectedPage != null)
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

        public async Task <DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id)
        {
            DataServiceResponse<GetNonPlayerCharacterDetailDTO> response = new DataServiceResponse<GetNonPlayerCharacterDetailDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetNonPlayerCharacterDetailDTO nonPlayerCharacter = await _repository.GetEntityAsync<GetNonPlayerCharacterDetailDTO>(
                    id: id,
                    predicate: nonPlayerCharacter => nonPlayerCharacter.UserId == userId,
                    include: new[]
                    {
                        "PlayerCharacter",
                        "Adventures"
                    },
                    select: nonPlayerCharacter => new GetNonPlayerCharacterDetailDTO()
                    {
                        Id = nonPlayerCharacter.Id,
                        Name = nonPlayerCharacter.Name,
                        Description = nonPlayerCharacter.Description,
                        PlayerCharacter = new GetPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.PlayerCharacter.Id,
                            Name = nonPlayerCharacter.PlayerCharacter.Name
                        },
                        Adventures = nonPlayerCharacter.Adventures.Select(
                            adventure => new GetAdventureDTO()
                            {
                                Id = adventure.Id,
                                Title = adventure.Title
                            }
                        )
                    }
                );

                if (nonPlayerCharacter == null)
                {
                    response.Success = false;
                    response.Message = "NPC doesn't exist";

                    return response;
                }

                response.Data = nonPlayerCharacter;
                response.Success = true;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                NonPlayerCharacter nonPlayerCharacterToAdd = new NonPlayerCharacter()
                {
                    Name = newNonPlayerCharacter.Name,
                    Description = newNonPlayerCharacter.Description,
                    PlayerCharacterId = newNonPlayerCharacter.PlayerCharacter, // null if not provided
                    UserId = userId
                };

                await _repository.AddEntityAsync(nonPlayerCharacterToAdd);

                response.Success = true;
                response.Message = "NPC was successfully added";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            if (updatedNonPlayerCharacter.Name == null && updatedNonPlayerCharacter.Description == null)
            {
                response.Success = false;
                response.Message = "To update NPC, either name or description must be provided";

                return response;
            }

            try
            {
                NonPlayerCharacter nonPlayerCharacterToUpdate = await _repository.GetEntityAsync(
                    id: updatedNonPlayerCharacter.Id,
                    predicate: nonPlayerCharacter => nonPlayerCharacter.UserId == userId
                );

                if (nonPlayerCharacterToUpdate == null)
                {
                    response.Success = false;
                    response.Message = "NPC doesn't exist";

                    return response;
                }

                /*
                We avoid explicitly updating fields, since model can grow in the future and
                at some point we might want to get rid of Name/Description check above and
                let front end update variable number of fields
                */
                Type typeOfNonPlayerCharacter = nonPlayerCharacterToUpdate.GetType();

                PropertyInfo[] updatedProperties = updatedNonPlayerCharacter.GetType().GetProperties();

                List<string> propertiesToUpdate = new List<string>();

                foreach (PropertyInfo updatedProperty in updatedProperties)
                {
                    if (updatedProperty.GetValue(updatedNonPlayerCharacter) == null || updatedProperty.Name == "Id")
                    {
                        continue;
                    }

                    PropertyInfo propertyToUpdate = typeOfNonPlayerCharacter.GetProperty(updatedProperty.Name);

                    propertyToUpdate.SetValue(
                        nonPlayerCharacterToUpdate,
                        updatedProperty.GetValue(updatedNonPlayerCharacter)
                    );

                    propertiesToUpdate.Add(updatedProperty.Name);
                }

                await _repository.UpdateEntityAsync(
                    nonPlayerCharacterToUpdate,
                    propertiesToUpdate
                );

                response.Success = true;
                response.Message = "NPC was successfully updated";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> DeleteNonPlayerCharacter(IEnumerable<int> ids)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                await _repository.DeleteEntitiesAsync(ids);

                (char suffix, string verb) args = (
                    ids.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"NPC{args.suffix} {args.verb} successfully deleted";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private async Task <IEnumerable<GetNonPlayerCharacterListDTO>> QueryNonPlayerCharacters(
            Expression<Func<NonPlayerCharacter, bool>> predicate,
            Ref<bool> weNeedAll,
            Ref<string> sortingParameter,
            Ref<int> selectedPage
        )
        {
            IEnumerable<GetNonPlayerCharacterListDTO> nonPlayerCharacters = await _repository.GetEntititesAsync<GetNonPlayerCharacterListDTO>(
                predicate: predicate,
                include: weNeedAll.Value
                    ? new[]
                    {
                        "PlayerCharacter",
                        "Adventures"
                    }
                    : null,
                select: nonPlayerCharacter => new GetNonPlayerCharacterListDTO()
                {
                    Id = nonPlayerCharacter.Id,
                    Name = nonPlayerCharacter.Name,

                    PlayerCharacter = weNeedAll.Value && nonPlayerCharacter.PlayerCharacter != null
                        ? new GetPlayerCharacterDTO()
                        {
                            Id = nonPlayerCharacter.PlayerCharacter.Id,
                            Name = nonPlayerCharacter.PlayerCharacter.Name
                        }
                        : null,

                    Adventure = weNeedAll.Value && nonPlayerCharacter.Adventures.Count == 1
                        ? new GetAdventureDTO()
                        {
                            Id = nonPlayerCharacter.Adventures.FirstOrDefault().Id,
                            Title = nonPlayerCharacter.Adventures.FirstOrDefault().Title
                        }
                        : null,

                    AdventureCount = weNeedAll.Value
                        ? nonPlayerCharacter.Adventures.Count
                        : null
                },
                orderBy: _sorter.DetermineSorting(sortingParameter.Value),
                page: selectedPage?.Value ?? null
            );

            return nonPlayerCharacters;
        }
    }
}