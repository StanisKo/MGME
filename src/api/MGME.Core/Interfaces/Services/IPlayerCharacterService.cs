using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface IPlayerCharacterService
    {
        Task <PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters(string sortingParameter, int? selectedPage);

        Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id);

        Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter);

        Task <BaseServiceResponse> UpdatePlayerCharacter(UpdatePlayerCharacterDTO updatedPlayerCharacter);

        Task <BaseServiceResponse> DeletePlayerCharacters(IEnumerable<int> ids);

        Task <BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids);
    }
}