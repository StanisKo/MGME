using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.SceneItem;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneItemService
    {
        Task <BaseServiceResponse> AddSceneItem(AddSceneItemDTO newSceneItem);

        Task <BaseServiceResponse> UpdateSceneItem(UpdateSceneItemDTO updatedSceneItem);
    }
}