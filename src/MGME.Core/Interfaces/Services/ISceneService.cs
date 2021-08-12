using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneService
    {
        /*
         Selected page is nullable, since we want to implement reversed paging
         and all initial results will be paged starting from the most recent scenes

         We use normal paging only if explicitly requested by client
         */
        Task <PaginatedDataServiceResponse<IEnumerable<GetSceneListDTO>>> GetAllScenes(int adventureId, int? selectedPage);

        Task <BaseServiceResponse> AddScene(AddSceneDTO newScene);

        Task <BaseServiceResponse> ResolveScene(ResolveSceneDTO sceneToResolve);
    }
}