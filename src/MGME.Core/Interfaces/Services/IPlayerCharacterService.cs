using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface IPlayerCharacterService
    {
         Task <DataServiceResponse<List<GetPlayerCharacterListDTO>>> GetAllPlayerCharacters();

         Task <DataServiceResponse<GetPlayerCharacterDetailDTO>> GetPlayerCharacter(int id);

         Task <BaseServiceResponse> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter);

         Task <BaseServiceResponse> UpdatePlayerCharacter();

         Task <BaseServiceResponse> DeletePlayerCharacter(int id);
    }
}