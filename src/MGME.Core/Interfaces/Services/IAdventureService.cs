using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;

namespace MGME.Core.Interfaces.Services
{
    public interface IAdventureService
    {
        Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure);

        Task <PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>>> GetAllAdventures(string sortingParameter, int selectedPage);

        Task <DataServiceResponse<GetAdventureDetailDTO>> GetAdventure(int id);

        Task <BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids);

        Task <BaseServiceResponse> DeleteAdventure(IEnumerable<int> ids);
    }
}