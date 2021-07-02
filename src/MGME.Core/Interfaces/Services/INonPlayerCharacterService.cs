using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface INonPlayerCharacterService
    {
        Task <PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters(int filter, string sortingParameter, int? selectedPage);

        Task <DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id);

        Task <BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter);

        Task <BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter);

        Task <BaseServiceResponse> DeleteNonPlayerCharacter(int id);
    }
}