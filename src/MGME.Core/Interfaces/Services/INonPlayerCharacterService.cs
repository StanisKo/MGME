using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface INonPlayerCharacterService
    {
        Task <DataServiceResponse<List<GetNonPlayerCharacterListDTO>>> GetAllNonPlayerCharacters();

        Task <DataServiceResponse<GetNonPlayerCharacterDetailDTO>> GetNonPlayerCharacter(int id);

        Task <BaseServiceResponse> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter);

        Task <BaseServiceResponse> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter);

        Task <BaseServiceResponse> AddToPlayerCharacter(AddToPlayerCharacterDTO ids);

        Task <BaseServiceResponse> AddToAdventure(AddToAdventureDTO ids);
    }
}