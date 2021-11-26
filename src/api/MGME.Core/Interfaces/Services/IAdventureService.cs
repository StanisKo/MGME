using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface IAdventureService
    {
        Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure);

        Task <PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>>> GetAllAdventures(string sortingParameter, int selectedPage);

        Task <DataServiceResponse<GetAdventureDetailDTO>> GetAdventure(int id);

        Task <BaseServiceResponse> AddToAdventure(AddRemoveToFromAdventureDTO ids);

        Task<BaseServiceResponse> RemoveFromAdventure(AddRemoveToFromAdventureDTO ids);

        Task <BaseServiceResponse> DeleteAdventure(IEnumerable<int> ids);

        Task <BaseServiceResponse> UpdateAdventure(UpdateAdventureDTO updatedAdventure);

        Task<BaseServiceResponse> AddNewNonPlayerCharacterToAdventure(AddNonPlayerCharacterDTO newNonPlayerCharacter);
    }
}
