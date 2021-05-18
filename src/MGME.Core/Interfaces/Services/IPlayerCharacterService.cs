using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface IPlayerCharacterService
    {
         Task <DataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters();

         Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id);

         Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter);

         Task <BaseServiceResponse> UpdatePlayerCharacter(UpdatePlayerCharacterDTO updatedPlayerCharacter);

         Task <BaseServiceResponse> DeletePlayerCharacter(int id);
    }
}