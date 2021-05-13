using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.Interfaces.Services
{
    public interface INonPlayerCharacterService
    {
        Task <DataServiceResponse<GetNonPlayerCharacterListDTO>> GetAllNonPlayerCharacters();
    }
}