using System;
using System.Linq;
using System.Linq.Expressions;
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
            PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>> response = new();

            int userId = GetUserIdFromHttpContext();

            bool weNeedAll = filter is (int)NonPlayerCharacterFilter.ALL;

            Expression<Func<NonPlayerCharacter, bool>> predicate = filter switch
            {
                /*
                NonPlayerCharacters available for Adventures should not
                belong to other PlayerCharacters (since they can also take part in other adventures)
                */
                (int)NonPlayerCharacterFilter.AVAILABLE_FOR_ADVENTURES => nonPlayerCharacter
                    => nonPlayerCharacter.UserId == userId && nonPlayerCharacter.PlayerCharacterId == null,

                /*
                NonPlayerCharacters available for PlayerCharacters should not
                belong to other PlayerCharacters, neither take part in the Adventure
                */
                (int)NonPlayerCharacterFilter.AVAILABLE_FOR_PLAYER_CHARACTERS => nonPlayerCharacter
                    => nonPlayerCharacter.UserId == userId && nonPlayerCharacter.PlayerCharacterId == null
                        && nonPlayerCharacter.Adventures.Count == 0,

                // Otherwise just filter on user
                _ => nonPlayerCharacter => nonPlayerCharacter.UserId == userId
            };

            try
            {
                int? numberOfResults = null;

                if (selectedPage is not null)
                {
                    numberOfResults = await _repository.GetEntitiesCountAsync(
                        predicate
                    );
                }

                IEnumerable<GetNonPlayerCharacterListDTO> nonPlayerCharacters = await QueryNonPlayerCharacters(
                    predicate,
                    new Ref<bool>(weNeedAll),
                    new Ref<string>(sortingParameter),
                    selectedPage is not null ? new Ref<int>((int)selectedPage) : null
                );

                response.Data = nonPlayerCharacters;

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

        public async Task <DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id)
        {
            DataServiceResponse<GetNonPlayerCharacterDetailDTO> response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetNonPlayerCharacterDetailDTO nonPlayerCharacter = await _repository.GetEntityAsync(
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

                if (nonPlayerCharacter is null)
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
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            try
            {
                NonPlayerCharacter nonPlayerCharacterToAdd = new()
                {
                    Name = newNonPlayerCharacter.Name,
                    Description = newNonPlayerCharacter.Description,
                    PlayerCharacterId = newNonPlayerCharacter.PlayerCharacterId, // null if not provided
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
            BaseServiceResponse response = new();

            int userId = GetUserIdFromHttpContext();

            if (updatedNonPlayerCharacter.Name is null && updatedNonPlayerCharacter.Description is null)
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

                if (nonPlayerCharacterToUpdate is null)
                {
                    response.Success = false;
                    response.Message = "NPC doesn't exist";

                    return response;
                }

                (NonPlayerCharacter nonPlayerCharacterWithUpdates, List<string> propertiesToUpdate) = UpdateVariableNumberOfFields(
                    nonPlayerCharacterToUpdate,
                    updatedNonPlayerCharacter
                );

                await _repository.UpdateEntityAsync(
                    nonPlayerCharacterWithUpdates,
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
            BaseServiceResponse response = new();

            try
            {
                await _repository.DeleteEntitiesAsync(ids);

                (char suffix, string verb) = (
                    ids.Count() > 1 ? ('s', "were") : ('\0', "was")
                );

                response.Success = true;
                response.Message = $"NPC{suffix} {verb} successfully deleted";
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
            IEnumerable<GetNonPlayerCharacterListDTO> nonPlayerCharacters = await _repository.GetEntititesAsync(
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
                page: selectedPage?.Value
            );

            return nonPlayerCharacters;
        }
    }
}