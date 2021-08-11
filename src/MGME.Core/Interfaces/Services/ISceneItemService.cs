using System.Threading.Tasks;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.DTOs.SceneItem;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneItemService
    {
        // We don't paginate scene items
        Task <DataServiceResponse<IEnumerable<GetSceneItemListDTO>>> GetSceneItems(int sceneId);

        Task <BaseServiceResponse> AddSceneItem(AddSceneItemDTO newSceneItem);

        Task <BaseServiceResponse> UpdateSceneItem(UpdateSceneItemDTO updatedSceneItem);
    }
}