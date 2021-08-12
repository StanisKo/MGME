using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneService
    {
        Task<PaginatedDataServiceResponse<IEnumerable<GetSceneListDTO>>> GetAllScenes(int adventureId, int selectedPage);

        Task <BaseServiceResponse> AddScene(AddSceneDTO newScene);

        Task <BaseServiceResponse> ResolveScene(ResolveSceneDTO sceneToResolve);
    }
}